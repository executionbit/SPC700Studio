"use strict";

const Stripe = require("stripe");
const { StripeSync } = require("stripe-replit-sync");

async function getStripeCredentials() {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const replitToken = process.env.REPL_IDENTITY
        ? `repl ${process.env.REPL_IDENTITY}`
        : process.env.WEB_REPL_RENEWAL
          ? `depl ${process.env.WEB_REPL_RENEWAL}`
          : null;

    if (!hostname || !replitToken) {
        throw new Error(
            "Stripe integration environment is unavailable. Connect Stripe in Integrations.",
        );
    }

    const response = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
        {
            headers: {
                Accept: "application/json",
                X_REPLIT_TOKEN: replitToken,
            },
            signal: AbortSignal.timeout(10000),
        },
    );
    if (!response.ok) {
        throw new Error(`Stripe credential lookup failed: ${response.status}`);
    }
    const data = await response.json();
    const settings = data.items?.[0]?.settings;
    const secretKey =
        settings?.secret_key ||
        settings?.secretKey ||
        settings?.secret ||
        settings?.api_key ||
        settings?.apiKey;
    if (!secretKey) {
        const settingNames = Object.keys(settings || {}).join(", ") || "none";
        throw new Error(
            `Stripe secret key is not available (received settings: ${settingNames}).`,
        );
    }
    return {
        secretKey,
        webhookSecret: settings.webhook_secret || settings.webhookSecret || "",
        publishableKey: settings.publishable || "",
    };
}

async function getUncachableStripeClient() {
    const { secretKey } = await getStripeCredentials();
    return new Stripe(secretKey);
}

async function getStripeWebhookSecret() {
    return (await getStripeCredentials()).webhookSecret;
}

async function getStripeSync() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL is required.");
    const { secretKey, webhookSecret } = await getStripeCredentials();
    return new StripeSync({
        poolConfig: { connectionString: databaseUrl },
        stripeSecretKey: secretKey,
        stripeWebhookSecret: webhookSecret,
    });
}

module.exports = {
    getStripeCredentials,
    getUncachableStripeClient,
    getStripeWebhookSecret,
    getStripeSync,
};