"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "index.html"), "utf8");
const start = source.indexOf("const STARTER_TEMPLATES =");
const end = source.indexOf("const STARTER_TRACKS =", start);

if (start < 0 || end < 0) {
    throw new Error("Starter template catalog is unavailable.");
}

const literal = source
    .slice(start, end)
    .replace(/^const STARTER_TEMPLATES\s*=\s*/, "")
    .trim()
    .replace(/;$/, "");
const templates = vm.runInNewContext(`(${literal})`);

if (templates.length < 3 || new Set(templates.map((template) => template.id)).size !== templates.length) {
    throw new Error("Starter catalog must contain at least three uniquely identified demos.");
}
for (const template of templates) {
    const activeTracks = Object.values(template.pattern).filter(
        (steps) => Array.isArray(steps) && steps.length,
    );
    if (
        !template.id ||
        !template.name ||
        !Number.isFinite(template.bpm) ||
        activeTracks.length < 3
    ) {
        throw new Error(`Starter "${template.id || "unknown"}" is not playable.`);
    }
}

for (const marker of [
    "makeStarterProject",
    "applyStarter",
    "window.confirm",
    "remixOf",
    "remixMode",
    "updateProjectLabel",
    "project-label",
    "data-starter-load",
    "data-starter-remix",
]) {
    if (!source.includes(marker)) {
        throw new Error(`Starter/remix workflow marker is missing: ${marker}`);
    }
}

console.log(`Starter beat regression passed: ${templates.length} playable demos.`);