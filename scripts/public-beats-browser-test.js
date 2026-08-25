"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const { app } = require("../server/index");
const { pool } = require("../server/db");

function request(server, method, requestPath, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body === undefined ? "" : JSON.stringify(body);
        const req = http.request(
            {
                ...server.address(),
                method,
                path: requestPath,
                headers: {
                    ...(payload
                        ? {
                              "content-type": "application/json",
                              "content-length": Buffer.byteLength(payload),
                          }
                        : {}),
                    ...headers,
                },
            },
            (res) => {
                let text = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (text += chunk));
                res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(text) }));
            },
        );
        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
}

function browserProject() {
    return {
        theme: "nocturne",
        bpm: 120,
        projectName: "Browser Shared Beat",
        starterSource: "neon-relay",
        tracks: [
            { id: "kick", name: "KICK", color: "#e52521", soundId: "kick", vol: 0.8, pan: 0 },
            {
                id: "custom_1",
                name: "IMPORTED",
                color: "#123456",
                sampleRef: "custom_1",
                vol: 0.8,
                pan: 0,
            },
        ],
        patterns: [{ kick: [true], custom_1: [true] }],
        patternMutes: [{}],
        patternMidiNotes: [{}],
        patternParameters: [{}],
        patternOctaveOffsets: [{}],
        glitchPatterns: [{}],
        songTimeline: [[true]],
        customSamples: {
            custom_1: { sampleRate: 44100, channels: [[0.1, -0.1, 0.1, -0.1]] },
        },
    };
}

async function assertSharedBeatLoadsAndPlays(page, baseUrl, slug, includesSample) {
    page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
            console.error(`browser ${message.type()}: ${message.text()}`);
        }
    });
    page.on("pageerror", (error) => console.error(`browser pageerror: ${error.message}`));
    await page.addInitScript(() => {
        window.__audioBufferStarts = 0;
        const originalStart = AudioBufferSourceNode.prototype.start;
        AudioBufferSourceNode.prototype.start = function (...args) {
            window.__audioBufferStarts += 1;
            return originalStart.apply(this, args);
        };
    });
    await page.goto(`${baseUrl}/beat/${slug}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() =>
        document.body.classList.contains("public-playback"),
    );

    const loaded = await page.evaluate(() => ({
        visibleTrackIds: [...document.querySelectorAll("#tracks-list .track-row[data-track-id]")].map(
            (element) => element.dataset.trackId,
        ),
        banner: document.getElementById("public-beat-banner")?.classList.contains("open"),
    }));
    assert.equal(loaded.banner, true);
    assert.deepEqual(loaded.visibleTrackIds, includesSample ? ["kick", "custom_1"] : ["kick"]);

    await page.locator("#btn-play").click();
    await page.waitForFunction(() =>
        document.getElementById("btn-play")?.classList.contains("active"),
    );
    await page.waitForTimeout(250);
    assert.equal(
        await page.locator("#btn-play").evaluate((button) => button.classList.contains("active")),
        true,
    );
    await page.locator("#btn-play").click();
}

async function main() {
    if (!fs.existsSync(chromium.executablePath())) {
        console.log(
            "Public beat browser regression skipped: Playwright Chromium is not installed in this environment.",
        );
        return;
    }
    const suffix = crypto.randomBytes(8).toString("hex");
    const userId = `test_public_browser_${suffix}`;
    const server = http.createServer(app);
    app.locals.authResolver = (req) =>
        req.headers["x-public-beats-test-user"] === userId ? { userId } : { userId: null };
    let privateSlug;
    let consentedSlug;
    const browser = await chromium.launch({ headless: true });
    try {
        await pool.query(
            fs.readFileSync(path.join(__dirname, "..", "server", "schema.sql"), "utf8"),
        );
        await new Promise((resolve) => server.listen(0, resolve));
        const baseUrl = `http://127.0.0.1:${server.address().port}`;
        const project = browserProject();

        const privatePublish = await request(
            server,
            "POST",
            "/api/beats",
            { sourceKind: "starter", title: "Browser Private Beat", project, includeImportedAudio: false },
            { "x-public-beats-test-user": userId },
        );
        assert.equal(privatePublish.status, 201);
        privateSlug = privatePublish.body.beat.slug;

        const consentedPublish = await request(
            server,
            "POST",
            "/api/beats",
            { sourceKind: "starter", title: "Browser Consented Beat", project, includeImportedAudio: true },
            { "x-public-beats-test-user": userId },
        );
        assert.equal(consentedPublish.status, 201);
        consentedSlug = consentedPublish.body.beat.slug;

        const privatePage = await browser.newPage();
        await assertSharedBeatLoadsAndPlays(privatePage, baseUrl, privateSlug, false);
        await privatePage.close();

        const consentedPage = await browser.newPage();
        await assertSharedBeatLoadsAndPlays(consentedPage, baseUrl, consentedSlug, true);
        await consentedPage.close();
        console.log("Public beat browser loading, playback, and sample privacy regression passed.");
    } finally {
        await browser.close();
        await new Promise((resolve) => server.close(resolve));
        delete app.locals.authResolver;
        await pool.query(
            "DELETE FROM published_beats WHERE slug = ANY($1::text[])",
            [[privateSlug, consentedSlug].filter(Boolean)],
        );
        await pool.query("DELETE FROM app_users WHERE id = $1", [userId]);
        await pool.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});