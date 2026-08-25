"use strict";

const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureUser(userId) {
    const inserted = await pool.query(
        `INSERT INTO app_users (id) VALUES ($1)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [userId],
    );
    const { rows } = await pool.query(
        `SELECT id, stripe_customer_id FROM app_users WHERE id = $1`,
        [userId],
    );
    return { user: rows[0], isNew: inserted.rowCount === 1 };
}

async function grantEntitlement({
    userId,
    packId,
    source,
    checkoutSessionId = null,
    paymentIntentId = null,
}) {
    await pool.query(
        `INSERT INTO dlc_entitlements
           (user_id, pack_id, source, stripe_checkout_session_id, stripe_payment_intent_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, pack_id) DO NOTHING`,
        [userId, packId, source, checkoutSessionId, paymentIntentId],
    );
}

async function grantNewUserDlc(userId) {
    const { FREE_DLC_IDS } = require("../shared/dlc-catalog");
    for (const packId of FREE_DLC_IDS) {
        await grantEntitlement({ userId, packId, source: "complimentary" });
    }
}

async function listEntitlements(userId) {
    const { rows } = await pool.query(
        `SELECT pack_id, source, created_at
         FROM dlc_entitlements
         WHERE user_id = $1
         ORDER BY created_at ASC`,
        [userId],
    );
    return rows;
}

async function findEntitlement(userId, packId) {
    const { rows } = await pool.query(
        `SELECT pack_id FROM dlc_entitlements
         WHERE user_id = $1 AND pack_id = $2`,
        [userId, packId],
    );
    return rows[0] || null;
}

async function getStripeCustomerId(userId) {
    const { rows } = await pool.query(
        `SELECT stripe_customer_id FROM app_users WHERE id = $1`,
        [userId],
    );
    return rows[0]?.stripe_customer_id || null;
}

async function saveStripeCustomerId(userId, customerId) {
    await pool.query(
        `UPDATE app_users SET stripe_customer_id = $1 WHERE id = $2`,
        [customerId, userId],
    );
}

async function markStripeEvent(eventId) {
    const result = await pool.query(
        `INSERT INTO processed_stripe_events (id)
         VALUES ($1)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [eventId],
    );
    return result.rowCount === 1;
}

async function processStripeEntitlement({
    eventId,
    userId,
    packId,
    checkoutSessionId = null,
    paymentIntentId = null,
}) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const eventResult = await client.query(
            `INSERT INTO processed_stripe_events (id)
             VALUES ($1)
             ON CONFLICT (id) DO NOTHING
             RETURNING id`,
            [eventId],
        );
        if (eventResult.rowCount === 0) {
            await client.query("COMMIT");
            return false;
        }

        await client.query(
            `INSERT INTO dlc_entitlements
               (user_id, pack_id, source, stripe_checkout_session_id, stripe_payment_intent_id)
             VALUES ($1, $2, 'stripe', $3, $4)
             ON CONFLICT (user_id, pack_id) DO NOTHING`,
            [userId, packId, checkoutSessionId, paymentIntentId],
        );
        await client.query("COMMIT");
        return true;
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    ensureUser,
    grantEntitlement,
    grantNewUserDlc,
    listEntitlements,
    findEntitlement,
    getStripeCustomerId,
    saveStripeCustomerId,
    markStripeEvent,
    processStripeEntitlement,
};
