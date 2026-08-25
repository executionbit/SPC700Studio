"use strict";

const assert = require("node:assert/strict");
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