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

CREATE TABLE IF NOT EXISTS published_beats (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    project JSONB NOT NULL,
    source_kind TEXT NOT NULL CHECK (source_kind IN ('starter', 'published')),
    starter_source TEXT,
    source_slug TEXT REFERENCES published_beats(slug) ON DELETE SET NULL,
    includes_imported_audio BOOLEAN NOT NULL DEFAULT FALSE,
    unpublished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS published_beats_owner_idx
    ON published_beats (owner_id, created_at DESC);

-- Idempotently upgrade task environments that may have created an earlier
-- published_beats shape before this schema was finalized.
ALTER TABLE published_beats
    ADD COLUMN IF NOT EXISTS source_kind TEXT,
    ADD COLUMN IF NOT EXISTS starter_source TEXT,
    ADD COLUMN IF NOT EXISTS unpublished_at TIMESTAMPTZ;

UPDATE published_beats
SET source_kind = CASE
    WHEN source_slug IS NULL THEN 'starter'
    ELSE 'published'
END
WHERE source_kind IS NULL;

ALTER TABLE published_beats
    ALTER COLUMN source_kind SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'published_beats_source_kind_check'
          AND conrelid = 'published_beats'::regclass
    ) THEN
        ALTER TABLE published_beats
            ADD CONSTRAINT published_beats_source_kind_check
            CHECK (source_kind IN ('starter', 'published'));
    END IF;
END
$$;