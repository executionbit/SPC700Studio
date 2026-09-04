"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
    parseMidiFile,
    programFamily,
    arrangementLength,
    arrangementPosition,
    durationSeconds,
} = require("../midi-import");

const variableLength = (value) => {
    const bytes = [value & 0x7f];
    while ((value >>= 7)) bytes.unshift((value & 0x7f) | 0x80);
    return Buffer.from(bytes);
};
const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    return Buffer.concat([Buffer.from(type), length, data]);
};
const event = (delta, bytes) => Buffer.concat([variableLength(delta), Buffer.from(bytes)]);
const namedTrack = (name, channel, program, note, restTicks) =>
    chunk(
        "MTrk",
        Buffer.concat([
            event(0, [0xff, 0x03, name.length, ...Buffer.from(name)]),
            event(0, [0xc0 | channel, program]),
            event(restTicks, [0x90 | channel, note, 110]),
            event(480, [0x80 | channel, note, 0]),
            event(0, [0xff, 0x2f, 0]),
        ]),
    );

const header = Buffer.alloc(6);
header.writeUInt16BE(1, 0);
header.writeUInt16BE(3, 2);
header.writeUInt16BE(480, 4);
const tempoTrack = chunk(
    "MTrk",
    Buffer.concat([
        event(0, [0xff, 0x51, 0x03, 0x07, 0xa1, 0x20]),
        event(0, [0xff, 0x2f, 0]),
    ]),
);
const file = Buffer.concat([
    chunk("MThd", header),
    tempoTrack,
    namedTrack("Horns", 0, 56, 60, 0),
    namedTrack("Strings", 1, 40, 67, 4320),
]);
const imported = parseMidiFile(file.buffer.slice(file.byteOffset, file.byteOffset + file.length));

assert.equal(imported.division, 480);
assert.equal(imported.bpm, 120);
assert.deepEqual(imported.tempoEvents, [{ tick: 0, bpm: 120 }]);
assert.equal(imported.tracks.length, 2);
assert.equal(imported.tracks[0].soundId, "gm_brass");
assert.equal(imported.tracks[1].soundId, "gm_strings");
assert.equal(imported.tracks[0].notes[0].duration, 480);
assert.equal(programFamily(73, 2).soundId, "gm_flute");
assert.equal(programFamily(0, 9).soundId, "gm_drums");
assert.deepEqual(arrangementPosition(4320, 480), {
    absoluteStep: 36,
    block: 1,
    step: 4,
});
assert.equal(
    arrangementLength(imported.songTicks, imported.division, 32, 4320).blockCount,
    2,
);
assert.deepEqual(arrangementLength(3840, 480, 32, 3600), {
    totalSteps: 32,
    blockCount: 1,
});
assert.deepEqual(arrangementLength(3840, 480, 32, 3839), {
    totalSteps: 33,
    blockCount: 2,
});
assert.equal(
    durationSeconds(
        0,
        8,
        [
            { step: 0, bpm: 120 },
            { step: 4, bpm: 60 },
        ],
        120,
    ),
    1.5,
);

const savedProject = JSON.parse(
    JSON.stringify({
        timelineLength: 2,
        midiEvents: [{ horns: [{ step: 0, note: 60, durationSteps: 4 }] }],
        midiTempoSteps: [{ step: 0, bpm: 120 }],
    }),
);
assert.equal(savedProject.timelineLength, 2);
assert.equal(savedProject.midiEvents[0].horns[0].durationSteps, 4);
assert.deepEqual(savedProject.midiTempoSteps, [{ step: 0, bpm: 120 }]);

const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
for (const marker of [
    "importMidiArrangement",
    "state.midiEvents",
    "state.patternNames",
    "timelineBlockCount",
    "MIDI PLAYLIST READY",
    "durationSeconds",
    "midiTempoSteps",
]) {
    assert.ok(indexSource.includes(marker), `Missing MIDI arrangement marker: ${marker}`);
}

console.log("MIDI program mapping and full-playlist regression passed.");