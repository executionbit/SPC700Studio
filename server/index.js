"use strict";

const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const { clerkMiddleware, getAuth } = require("@clerk/express");
const {
    DLC_CATALOG,
    FREE_DLC_IDS,
    getDlcPack,
} = require("../shared/dlc-catalog");
const {
    pool,
    ensureUser,
    grantEntitlement,
    grantNewUserDlc,
    listEntitlements,
    findEntitlement,
    getStripeCustomerId,
    saveStripeCustomerId,
    processStripeEntitlement,
    createPublishedBeat,
    getPublishedBeat,
} = require("./db");
const {
    getUncachableStripeClient,
    getStripeSync,
    getStripeCredentials,
} = require("./stripe-client");
const {
    STARTER_BEAT_IDS,
    preparePublicProject,
} = require("./public-beats");

const app = express();
const publicRoot = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3000);

function effectiveUserId(req) {
    const authResolver = app.locals.authResolver || getAuth;
    return authResolver(req)?.userId || null;
}

function requireAuth(req, res, next) {
    const userId = effectiveUserId(req);
    if (!userId) return res.status(401).json({ error: "Sign in required." });
    req.userId = userId;
    next();
}

async function initializeStripeSync() {
    const { runMigrations } = require("stripe-replit-sync");
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL is required.");
    await runMigrations({ databaseUrl, schema: "stripe" });
    const sync = await getStripeSync();
    const domains = process.env.REPLIT_DOMAINS?.split(",").filter(Boolean);
    if (domains?.[0]) {
        await sync.findOrCreateManagedWebhook(
            `https://${domains[0]}/api/stripe/webhook`,
        );
    }
    sync.syncBackfill().catch((error) =>
        console.error("Stripe sync backfill failed:", error.message),
    );
}

async function handleStripeEvent(event) {
    if (
        event.type !== "checkout.session.completed" &&
        event.type !== "checkout.session.async_payment_succeeded"
    ) {
        return;
    }
    if (event.data.object.payment_status !== "paid") return;
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const packId = session.metadata?.dlc_pack_id;
    if (!userId || !getDlcPack(packId) || getDlcPack(packId).freeForNewUsers) {
        console.warn("Ignoring invalid DLC checkout metadata.");
        return;
    }
    return processStripeEntitlement({
        eventId: event.id,
        userId,
        packId,
        checkoutSessionId: session.id,
        paymentIntentId:
            typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null,
    });
}

// Stripe must receive the raw request body for signature verification.
app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const signature = req.headers["stripe-signature"];
        if (!signature) return res.status(400).json({ error: "Missing signature." });
        try {
            const sync = await getStripeSync();
            await sync.processWebhook(
                req.body,
                Array.isArray(signature) ? signature[0] : signature,
            );
            const event = JSON.parse(req.body.toString("utf8"));
            const firstProcessing = await handleStripeEvent(event);
            res.json({ received: true, duplicate: !firstProcessing });
        } catch (error) {
            console.error("Stripe webhook rejected:", error.message);
            res.status(400).json({ error: "Webhook verification failed." });
        }
    },
);

app.use("/api/__clerk", require("./middlewares/clerkProxyMiddleware").clerkProxyMiddleware());
app.use(clerkMiddleware());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/config", async (_req, res) => {
    let connectorPublishableKey = "";
    try {
        connectorPublishableKey = (await getStripeCredentials()).publishableKey;
    } catch (error) {
        console.warn("Stripe publishable key unavailable:", error.message);
    }
    res.json({
        clerkPublishableKey:
            process.env.VITE_CLERK_PUBLISHABLE_KEY ||
            process.env.CLERK_PUBLISHABLE_KEY ||
            "",
        clerkProxyUrl: process.env.VITE_CLERK_PROXY_URL || "",
        stripePublishableKey:
            process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
            process.env.STRIPE_PUBLISHABLE_KEY ||
            connectorPublishableKey,
    });
});

app.get("/api/dlc/catalog", (_req, res) => {
    res.json({
        packs: DLC_CATALOG.map(({ id, name, description, game, priceCents, freeForNewUsers }) => ({
            id,
            name,
            description,
            game,
            priceCents,
            freeForNewUsers,
        })),
    });
});

app.get("/api/entitlements", requireAuth, async (req, res) => {
    try {
        const { isNew } = await ensureUser(req.userId);
        if (isNew) await grantNewUserDlc(req.userId);
        const entitlements = await listEntitlements(req.userId);
        res.json({
            userId: req.userId,
            packIds: entitlements.map((item) => item.pack_id),
            entitlements,
        });
    } catch (error) {
        console.error("Entitlement restore failed:", error.message);
        res.status(500).json({ error: "Unable to restore DLC entitlements." });
    }
});

app.post("/api/dlc/checkout", requireAuth, async (req, res) => {
    try {
        const pack = getDlcPack(req.body?.packId);
        if (!pack) return res.status(404).json({ error: "DLC pack not found." });
        if (pack.freeForNewUsers) {
            return res.status(400).json({ error: "This pack is complimentary." });
        }
        await ensureUser(req.userId);
        if (await findEntitlement(req.userId, pack.id)) {
            return res.status(409).json({ error: "DLC pack is already unlocked." });
        }

        const stripe = await getUncachableStripeClient();
        const prices = await stripe.prices.list({
            active: true,
            type: "one_time",
            limit: 100,
        });
        const price = prices.data.find(
            (candidate) => candidate.metadata?.dlc_pack_id === pack.id,
        );
        if (!price) {
            return res.status(503).json({
                error: "This DLC pack is not configured in Stripe yet.",
            });
        }

        let customer = await getStripeCustomerId(req.userId);
        if (!customer) {
            const created = await stripe.customers.create({
                metadata: { user_id: req.userId },
            });
            customer = created.id;
            await saveStripeCustomerId(req.userId, customer);
        }
        const origin = `${req.protocol}://${req.get("host")}`;
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer,
            line_items: [{ price: price.id, quantity: 1 }],
            client_reference_id: req.userId,
            metadata: { user_id: req.userId, dlc_pack_id: pack.id },
            success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?checkout=cancelled`,
            allow_promotion_codes: true,
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error("DLC checkout failed:", error.message);
        res.status(500).json({ error: "Unable to start secure checkout." });
    }
});

app.post("/api/checkout/confirm", requireAuth, async (req, res) => {
    try {
        const sessionId = String(req.body?.sessionId || "");
        if (!sessionId.startsWith("cs_")) {
            return res.status(400).json({ error: "Invalid checkout session." });
        }
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const packId = session.metadata?.dlc_pack_id;
        if (
            session.metadata?.user_id !== req.userId ||
            session.payment_status !== "paid" ||
            !getDlcPack(packId) ||
            getDlcPack(packId).freeForNewUsers
        ) {
            return res.status(403).json({ error: "Checkout is not verified." });
        }
        // The checkout endpoint normally creates this row, but keeping
        // confirmation self-contained makes a successful return safe across
        // retries, delayed redirects, and accounts created in another tab.
        await ensureUser(req.userId);
        await grantEntitlement({
            userId: req.userId,
            packId,
            source: "stripe",
            checkoutSessionId: session.id,
            paymentIntentId:
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id || null,
        });
        res.json({ verified: true, packId });
    } catch (error) {
        console.error("Checkout confirmation failed:", error.message);
        res.status(400).json({ error: "Checkout could not be verified." });
    }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/beats", requireAuth, async (req, res) => {
    try {
        const sourceKind = String(req.body?.sourceKind || "");
        if (!["starter", "published"].includes(sourceKind)) {
            return res.status(400).json({
                error: "Only starter beats and their remixes can be published.",
            });
        }
        if (
            sourceKind === "starter" &&
            !STARTER_BEAT_IDS.has(
                String(req.body?.project?.starterSource || req.body?.project?.remixOf || ""),
            )
        ) {
            return res.status(400).json({ error: "Starter beat source is invalid." });
        }
        const includeImportedAudio = req.body?.includeImportedAudio === true;
        const project = preparePublicProject(
            req.body?.project,
            includeImportedAudio,
        );
        const title = String(req.body?.title || project.projectName || "Untitled Beat")
            .trim()
            .slice(0, 80);
        if (!title) return res.status(400).json({ error: "A beat title is required." });
        const sourceSlug =
            sourceKind === "published"
                ? String(req.body?.sourceSlug || "").slice(0, 64)
                : null;
        if (sourceKind === "published" && !(await getPublishedBeat(sourceSlug))) {
            return res.status(400).json({ error: "The remix source no longer exists." });
        }
        const starterSource =
            sourceKind === "starter"
                ? String(project.starterSource || "")
                : null;
        await ensureUser(req.userId);
        const beat = await createPublishedBeat({
            slug: crypto.randomBytes(9).toString("base64url"),
            ownerId: req.userId,
            title,
            project,
            sourceKind,
            starterSource,
            sourceSlug,
            includesImportedAudio: includeImportedAudio,
        });
        res.status(201).json({ beat, url: `/beat/${beat.slug}` });
    } catch (error) {
        console.error("Beat publishing failed:", error.message);
        res.status(400).json({ error: error.message || "Unable to publish beat." });
    }
});

app.get("/api/beats/:slug", async (req, res) => {
    try {
        const beat = await getPublishedBeat(String(req.params.slug || ""));
        if (!beat) return res.status(404).json({ error: "Published beat not found." });
        res.json({ beat });
    } catch (error) {
        console.error("Published beat load failed:", error.message);
        res.status(500).json({ error: "Unable to load published beat." });
    }
});

app.get("/beat/:slug", (_req, res) => {
    res.sendFile(path.join(publicRoot, "index.html"));
});

app.use(express.static(publicRoot, { index: "index.html" }));

async function start() {
    await pool.query("SELECT 1");
    await initializeStripeSync();
    app.listen(port, () => console.log(`Ghettochip server listening on ${port}`));
}

if (require.main === module) {
    start().catch((error) => {
        console.error("Server startup failed:", error);
        process.exit(1);
    });
}

module.exports = { app, start };