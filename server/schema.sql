CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dlc_entitlements (
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    pack_id TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('complimentary', 'stripe')),
    stripe_checkout_session_id TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, pack_id)
);

CREATE INDEX IF NOT EXISTS dlc_entitlements_user_idx
    ON dlc_entitlements (user_id);

CREATE TABLE IF NOT EXISTS processed_stripe_events (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);