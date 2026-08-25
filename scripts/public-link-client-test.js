"use strict";

const assert = require("node:assert/strict");
const { readPublishResponse } = require("../public-link-client");

async function expectError(response, expectedMessage) {
    await assert.rejects(
        () => readPublishResponse(response),
        (error) =>
            error instanceof Error &&
            error.message === expectedMessage &&
            !error.message.includes("Unexpected token"),
    );
}

async function run() {
    const success = await readPublishResponse(
        new Response(JSON.stringify({ url: "/beat/ready-to-share" }), {
            status: 201,
            headers: { "content-type": "application/json" },
        }),
    );
    assert.deepEqual(success, { url: "/beat/ready-to-share" });

    await expectError(
        new Response("<!DOCTYPE html><html><body>Studio</body></html>", {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
        }),
        "The public-link service returned an unexpected page. Refresh the studio and try again.",
    );
    await expectError(
        new Response("not-json", {
            status: 502,
            headers: { "content-type": "application/json" },
        }),
        "The public-link service returned invalid data. Refresh the studio and try again.",
    );
    await expectError(
        new Response("", {
            status: 503,
            headers: { "content-type": "application/json" },
        }),
        "The public-link service returned an empty response. Refresh the studio and try again.",
    );
    console.log("Public-link browser response handling regression passed.");
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});