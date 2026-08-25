"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { DLC_CATALOG } = require("../shared/dlc-catalog");

const root = path.resolve(__dirname, "..");
const patchSource = fs.readFileSync(path.join(root, "sound-patches.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const catalogStart = indexSource.indexOf("const soundLibraryKits =");
const catalogEnd = indexSource.indexOf("async function hydrateDlcCatalog", catalogStart);
if (catalogStart < 0 || catalogEnd < 0) {
    throw new Error("Could not locate the browser sound catalog.");
}

const browserCatalog = indexSource
    .slice(catalogStart, catalogEnd)
    .match(/\bid:\s*"([^"]+)"/g)
    .map((entry) => entry.match(/"([^"]+)"/)[1])
    .filter((id) => !id.startsWith("dlc_"));
const expectedIds = [...new Set(browserCatalog)];
const browserPackIds = [
    ...indexSource
        .slice(catalogStart, catalogEnd)
        .matchAll(/\bid:\s*"(dlc_[^"]+)"/g),
].map((match) => match[1]);
const context = { window: {}, Float32Array, Math, Error, Set, Object };
vm.runInNewContext(patchSource, context, { filename: "sound-patches.js" });
const bank = context.window.GhettochipPatchBank;

if (!bank || typeof bank.validate !== "function") {
    throw new Error("Patch bank validation API is unavailable.");
}

bank.validate(expectedIds);
const sharedPackIds = DLC_CATALOG.map((pack) => pack.id);
if (
    sharedPackIds.length !== new Set(browserPackIds).size ||
    sharedPackIds.some((id) => !browserPackIds.includes(id))
) {
    throw new Error("Browser and shared DLC catalogs contain different pack IDs.");
}

// Exercise the same AudioBuffer construction used by the forced Web Audio
// fallback, without requiring a real browser or an audio device in CI.
const fakeContext = {
    sampleRate: 44100,
    createBuffer(channels, length, sampleRate) {
        const channelsData = Array.from(
            { length: channels },
            () => new Float32Array(length),
        );
        return {
            numberOfChannels: channels,
            copyToChannel(data, channel) {
                channelsData[channel].set(data);
            },
            getChannelData(channel) {
                return channelsData[channel];
            },
            sampleRate,
            length,
        };
    },
};
for (const id of expectedIds) {
    const pcm = bank.render(id, 32000);
    if (!pcm.length || !pcm.some((sample) => Math.abs(sample) > 0.0001)) {
        throw new Error(`Patch "${id}" rendered silence.`);
    }
    if (![...pcm].every(Number.isFinite)) {
        throw new Error(`Patch "${id}" rendered invalid PCM.`);
    }
    const audioBuffer = bank.createBuffer(fakeContext, id);
    if (
        audioBuffer.length <= 0 ||
        audioBuffer.sampleRate !== fakeContext.sampleRate ||
        !audioBuffer
            .getChannelData(0)
            .some((sample) => Math.abs(sample) > 0.0001)
    ) {
        throw new Error(`Patch "${id}" failed Web Audio buffer creation.`);
    }
}

const drumIds = expectedIds.filter((id) =>
    ["kick", "snare", "hat", "clap", "tom", "rim", "shaker"].some((kind) =>
        bank.recipeFor(id).kind === kind,
    ),
);
const melodicIds = expectedIds.filter((id) =>
    ["bass", "lead", "bell", "pad"].includes(bank.recipeFor(id).kind),
);
if (!drumIds.length || !melodicIds.length) {
    throw new Error("Representative drum and melodic patches are missing.");
}

console.log(
    `Audio smoke test passed: ${expectedIds.length} catalog patches, ` +
        `${drumIds[0]} drum, ${melodicIds[0]} melodic, finite non-silent PCM.`,
);