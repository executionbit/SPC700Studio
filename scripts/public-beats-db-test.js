"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const {
    pool,
    createPublishedBeat,
    getPublishedBeat,
} = require("../server/db");

async function run() {
    const suffix = crypto.randomBytes(8).toString("hex");
    const userId = `test_publish_${suffix}`;
    const slug = `test-${suffix}`;
    try {
        await pool.query("INSERT INTO app_users (id) VALUES ($1)", [userId]);
        await createPublishedBeat({
            slug,
            ownerId: userId,
            title: "Database Publish Test",
            project: {
                projectName: "Database Publish Test",
                starterSource: "neon-relay",
                tracks: [{ id: "kick", name: "KICK" }],
                patterns: [{ kick: [true] }],
            },
            sourceKind: "starter",
            starterSource: "neon-relay",
        });
        const beat = await getPublishedBeat(slug);
        assert.equal(beat.slug, slug);
        assert.equal(beat.source_kind, "starter");
        assert.equal(beat.starter_source, "neon-relay");
        assert.equal(beat.project.tracks[0].id, "kick");
        console.log("Public beat database publish/read regression passed.");
    } finally {
        await pool.query("DELETE FROM published_beats WHERE slug = $1", [slug]);
        await pool.query("DELETE FROM app_users WHERE id = $1", [userId]);
        await pool.end();
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});