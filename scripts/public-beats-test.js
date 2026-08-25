"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { app, start } = require("../server/index");
const { pool } = require("../server/db");
const { preparePublicProject } = require("../server/public-beats");

function project() {
    return {
        theme: "sunrise",
        bpm: 124,
        lpf: 3200,
        dist: 15,
        starterSource: "neon-relay",
        projectName: "Safe Beat",
        tracks: [
            { id: "kick", name: "KICK", color: "#e52521", vol: 0.8, pan: 0 },
            {
                id: "custom_1",
                name: "PRIVATE",
                color: "#123456",
                sampleRef: "custom_1",
                vol: 1,
                pan: 0,
            },
        ],
        patterns: [{ kick: [true], custom_1: [true] }],
        patternMutes: [{}],
        patternMidiNotes: [{}],
        patternParameters: [{}],
        patternOctaveOffsets: [{}],
        glitchPatterns: [{}],
        songTimeline: [[]],
        customSamples: {
            custom_1: { sampleRate: 44100, channels: [[0.1, -0.1]] },
        },
    };
}

const privateCopy = preparePublicProject(project(), false);
assert.deepEqual(privateCopy.tracks.map((track) => track.id), ["kick"]);
assert.equal(privateCopy.customSamples, undefined);
assert.equal(privateCopy.patterns[0].custom_1, undefined);

const consentedCopy = preparePublicProject(project(), true);
assert.equal(consentedCopy.tracks.length, 2);
assert.deepEqual(consentedCopy.customSamples.custom_1.channels[0], [0.1, -0.1]);

const malicious = project();
malicious.tracks[0].name = '<img src=x onerror="alert(1)">';
malicious.tracks[0].id = 'kick" onmouseover="alert(1)';
assert.throws(() => preparePublicProject(malicious, false), /invalid track id/);

const escapedName = project();
escapedName.tracks[0].name = '<img src=x onerror="alert(1)">';
assert.equal(
    preparePublicProject(escapedName, false).tracks[0].name.includes("<"),
    false,
);

assert.throws(
    () => preparePublicProject({ tracks: [], patterns: [] }, false),
    /no playable channels/,
);

console.log("Public beat privacy and validation regression passed.");

function request(server, method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body === undefined ? "" : JSON.stringify(body);
        const req = http.request(
            { ...server.address(), method, path, headers: {
                ...(payload ? {
                    "content-type": "application/json",
                    "content-length": Buffer.byteLength(payload),
                } : {}),
                ...headers,
            } },
            (res) => {
                let text = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => { text += chunk; });
                res.on("end", () => {
                    let parsed;
                    try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
                    resolve({ status: res.statusCode, body: parsed });
                });
            },
        );
        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runApiIntegration() {
    const suffix = crypto.randomBytes(8).toString("hex");
    const userId = `test_public_api_${suffix}`;
    const server = http.createServer(app);
    app.locals.authResolver = (req) =>
        req.headers["x-public-beats-test-user"] === userId
            ? { userId }
            : { userId: null };

    const apiProject = project();
    let starterSlug;
    let remixSlug;
    try {
        await pool.query(
            fs.readFileSync(path.join(__dirname, "..", "server", "schema.sql"), "utf8"),
        );
        await new Promise((resolve) => server.listen(0, resolve));

        const unauthenticated = await request(server, "POST", "/api/beats", {
            sourceKind: "starter",
            project: apiProject,
        });
        assert.equal(unauthenticated.status, 401);

        const published = await request(server, "POST", "/api/beats", {
            sourceKind: "starter",
            title: "API Safe Starter",
            project: apiProject,
            includeImportedAudio: false,
        }, { "x-public-beats-test-user": userId });
        assert.equal(published.status, 201);
        assert.match(published.body.url, /^\/beat\/[A-Za-z0-9_-]+$/);
        starterSlug = published.body.beat.slug;
        assert.equal(published.body.beat.source_kind, "starter");
        assert.equal(published.body.beat.starter_source, "neon-relay");
        assert.equal(published.body.beat.includes_imported_audio, false);

        const anonymous = await request(server, "GET", `/api/beats/${starterSlug}`);
        assert.equal(anonymous.status, 200);
        assert.equal(anonymous.body.beat.slug, starterSlug);
        assert.equal(anonymous.body.beat.project.projectName, "Safe Beat");
        assert.deepEqual(anonymous.body.beat.project.tracks.map((track) => track.id), ["kick"]);
        assert.equal(anonymous.body.beat.project.customSamples, undefined);
        assert.equal(anonymous.body.beat.project.patterns[0].custom_1, undefined);

        const consented = await request(server, "POST", "/api/beats", {
            sourceKind: "starter",
            title: "API Consented Starter",
            project: apiProject,
            includeImportedAudio: true,
        }, { "x-public-beats-test-user": userId });
        assert.equal(consented.status, 201);
        assert.equal(consented.body.beat.includes_imported_audio, true);
        assert.equal(consented.body.beat.project, undefined);
        const consentedRead = await request(
            server,
            "GET",
            `/api/beats/${consented.body.beat.slug}`,
        );
        assert.equal(consentedRead.status, 200);
        assert.deepEqual(
            consentedRead.body.beat.project.customSamples.custom_1.channels[0],
            [0.1, -0.1],
        );
        assert.equal(consentedRead.body.beat.project.tracks.length, 2);

        const remix = await request(server, "POST", "/api/beats", {
            sourceKind: "published",
            sourceSlug: starterSlug,
            title: "API Remix",
            project: { ...apiProject, starterSource: "not-used-for-lineage" },
        }, { "x-public-beats-test-user": userId });
        assert.equal(remix.status, 201);
        remixSlug = remix.body.beat.slug;
        const remixRead = await request(server, "GET", `/api/beats/${remixSlug}`);
        assert.equal(remixRead.status, 200);
        assert.equal(remixRead.body.beat.source_kind, "published");
        assert.equal(remixRead.body.beat.source_slug, starterSlug);
        assert.equal(remixRead.body.beat.source_title, "API Safe Starter");

        const invalidSource = await request(server, "POST", "/api/beats", {
            sourceKind: "starter",
            project: { ...apiProject, starterSource: "javascript:alert(1)" },
        }, { "x-public-beats-test-user": userId });
        assert.equal(invalidSource.status, 400);

        const invalidRemix = await request(server, "POST", "/api/beats", {
            sourceKind: "published",
            sourceSlug: "../../etc/passwd",
            project: apiProject,
        }, { "x-public-beats-test-user": userId });
        assert.equal(invalidRemix.status, 400);

        const maliciousPayload = project();
        maliciousPayload.tracks[0].id = 'kick" onmouseover="alert(1)';
        const malicious = await request(server, "POST", "/api/beats", {
            sourceKind: "starter",
            project: maliciousPayload,
        }, { "x-public-beats-test-user": userId });
        assert.equal(malicious.status, 400);

        const malformed = await new Promise((resolve, reject) => {
            const req = http.request({
                ...server.address(),
                method: "POST",
                path: "/api/beats",
                headers: { "content-type": "application/json" },
            }, (res) => {
                res.resume();
                res.on("end", () => resolve(res.statusCode));
            });
            req.on("error", reject);
            req.end("{not-json");
        });
        assert.equal(malformed, 400);

        const missingApiRoute = await request(server, "POST", "/api/not-a-route", {
            hello: "world",
        });
        assert.equal(missingApiRoute.status, 404);
        assert.deepEqual(missingApiRoute.body, { error: "API route not found." });
        console.log("Public beat API publish/read/remix regression passed.");
    } finally {
        await new Promise((resolve) => server.close(resolve));
        delete app.locals.authResolver;
        await pool.query(
            "DELETE FROM published_beats WHERE slug = ANY($1::text[])",
            [[starterSlug, remixSlug].filter(Boolean)],
        );
        await pool.query("DELETE FROM app_users WHERE id = $1", [userId]);
        await pool.end();
    }
}

runApiIntegration().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});