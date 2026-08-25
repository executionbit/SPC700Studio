"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const patchSource = fs.readFileSync(path.join(root, "sound-patches.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const context = { window: {}, Float32Array, Math, Error, Set, Object };

vm.runInNewContext(patchSource, context, { filename: "sound-patches.js" });
const bank = context.window.GhettochipPatchBank;
if (!bank || typeof bank.missingTracks !== "function") {
    throw new Error("Legacy project recovery detector is unavailable.");
}

const missing = bank.missingTracks([
    { id: "kick", name: "KICK", soundId: "kick" },
    { id: "retired", name: "RETIRED", soundId: "retired_patch_99" },
    { id: "sample", name: "SAMPLE" },
]);
if (
    missing.length !== 1 ||
    missing[0].trackId !== "retired" ||
    missing[0].trackName !== "RETIRED" ||
    missing[0].soundId !== "retired_patch_99"
) {
    throw new Error("Unknown legacy sound IDs were not mapped to the affected channel.");
}

if (
    !indexSource.includes("needs-repair") ||
    !indexSource.includes("REPLACE SOUND...") ||
    !indexSource.includes("track.soundId = replacementId") ||
    !indexSource.includes("NEEDS REPAIR")
) {
    throw new Error("The rack does not expose a complete legacy sound repair path.");
}

console.log("Legacy project recovery regression passed.");