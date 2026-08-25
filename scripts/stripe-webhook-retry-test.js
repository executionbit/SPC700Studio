"use strict";

const assert = require("node:assert/strict");
const Module = require("node:module");

const processedEvents = new Set();
const entitlements = new Set();
let failEntitlementWrite = true;
let transaction;

function query(sql, params) {
    if (sql === "BEGIN") {
        transaction = {
            processedEvents: new Set(processedEvents),
            entitlements: new Set(entitlements),
        };
        return { rowCount: null };
    }
    if (sql === "ROLLBACK") {
        transaction = null;
        return { rowCount: null };
    }
    if (sql === "COMMIT") {
        processedEvents.clear();
        transaction.processedEvents.forEach((id) => processedEvents.add(id));
        entitlements.clear();
        transaction.entitlements.forEach((key) => entitlements.add(key));
        transaction = null;
        return { rowCount: null };
    }
    if (sql.includes("processed_stripe_events")) {
        const [eventId] = params;
        if (transaction.processedEvents.has(eventId)) return { rowCount: 0 };
        transaction.processedEvents.add(eventId);
        return { rowCount: 1 };
    }
    if (sql.includes("dlc_entitlements")) {
        if (failEntitlementWrite) {
            failEntitlementWrite = false;
            throw new Error("transient database failure");
        }
        const [userId, packId] = params;
        transaction.entitlements.add(`${userId}:${packId}`);
        return { rowCount: 1 };
    }
    throw new Error(`Unexpected query: ${sql}`);
}

const fakePool = {
    connect: async () => ({
        query: async (sql, params) => query(sql, params),
        release: () => {},
    }),
    query: async () => {
        throw new Error("The test should use a transaction client.");
    },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
    if (request === "pg") return { Pool: function Pool() { return fakePool; } };
    return originalLoad.call(this, request, parent, isMain);
};

const { processStripeEntitlement } = require("../server/db");
Module._load = originalLoad;

const entitlement = {
    eventId: "evt_paid_pack",
    userId: "user_123",
    packId: "dlc_synthwave",
    checkoutSessionId: "cs_paid_pack",
    paymentIntentId: "pi_paid_pack",
};

(async () => {
    await assert.rejects(
        processStripeEntitlement(entitlement),
        /transient database failure/,
    );
    assert.deepEqual([...processedEvents], []);
    assert.deepEqual([...entitlements], []);

    assert.equal(await processStripeEntitlement(entitlement), true);
    assert.deepEqual([...processedEvents], ["evt_paid_pack"]);
    assert.deepEqual([...entitlements], ["user_123:dlc_synthwave"]);

    assert.equal(await processStripeEntitlement(entitlement), false);
    assert.deepEqual([...processedEvents], ["evt_paid_pack"]);
    assert.deepEqual([...entitlements], ["user_123:dlc_synthwave"]);
    console.log("Stripe webhook retry test passed.");
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});