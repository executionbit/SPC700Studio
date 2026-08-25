"use strict";

const STARTER_BEAT_IDS = new Set([
    "neon-relay",
    "dusk-circuit",
    "glass-garden",
]);
const THEMES = new Set(["sunrise", "tide", "nocturne", "dark"]);
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SAFE_COLOR = /^#[0-9A-Fa-f]{6}$/;
const MAX_TRACKS = 32;
const MAX_PATTERNS = 16;
const TOTAL_STEPS = 32;
const TIMELINE_BLOCKS = 16;
const MAX_SAMPLE_FRAMES = 1_000_000;

function number(value, fallback, min, max) {
    const parsed = Number(value);
    return Number.isFinite(parsed)
        ? Math.max(min, Math.min(max, parsed))
        : fallback;
}

function safeId(value) {
    const id = String(value || "");
    if (!SAFE_ID.test(id)) throw new Error("Beat contains an invalid track id.");
    return id;
}

function plainText(value, fallback, maxLength) {
    const text = String(value || fallback)
        .replace(/[<>&"'`]/g, "")
        .trim()
        .slice(0, maxLength);
    return text || fallback;
}

function booleanSteps(value, length = TOTAL_STEPS) {
    return Array.from({ length }, (_, index) => value?.[index] === true);
}

function mapByTrack(entries, trackIds, mapper) {
    return Array.from({ length: Math.min(entries?.length || 0, MAX_PATTERNS) }, (_, index) => {
        const input = entries[index];
        const output = {};
        trackIds.forEach((id) => {
            if (input && Object.prototype.hasOwnProperty.call(input, id)) {
                output[id] = mapper(input[id]);
            }
        });
        return output;
    });
}

function sanitizeParameters(value, depth = 0) {
    if (depth > 4 || value == null) return null;
    if (typeof value === "boolean" || typeof value === "string") {
        return typeof value === "string" ? plainText(value, "", 64) : value;
    }
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (Array.isArray(value)) {
        return value.slice(0, TOTAL_STEPS).map((item) =>
            sanitizeParameters(item, depth + 1),
        );
    }
    if (typeof value === "object") {
        const output = {};
        Object.entries(value)
            .slice(0, 16)
            .forEach(([key, item]) => {
                if (/^[A-Za-z0-9_-]{1,32}$/.test(key)) {
                    output[key] = sanitizeParameters(item, depth + 1);
                }
            });
        return output;
    }
    return null;
}

function isImportedTrack(track) {
    return Boolean(
        track?.sampleRef ||
        String(track?.id || "").startsWith("custom_"),
    );
}

function sanitizeCustomSamples(samples, allowedIds) {
    const output = {};
    Object.entries(samples || {}).forEach(([rawId, sample]) => {
        const id = safeId(rawId);
        if (!allowedIds.has(id) || !sample || !Array.isArray(sample.channels)) return;
        const channels = sample.channels.slice(0, 2);
        if (
            !channels.length ||
            channels.some(
                (channel) =>
                    !Array.isArray(channel) ||
                    channel.length === 0 ||
                    channel.length > MAX_SAMPLE_FRAMES,
            )
        ) {
            throw new Error("Imported audio is too large or invalid.");
        }
        output[id] = {
            sampleRate: Math.round(number(sample.sampleRate, 44100, 8000, 192000)),
            channels: channels.map((channel) =>
                channel.map((frame) => number(frame, 0, -1, 1)),
            ),
        };
    });
    return output;
}

function preparePublicProject(input, includeImportedAudio) {
    if (!input || typeof input !== "object") {
        throw new Error("Invalid beat project.");
    }
    if (!Array.isArray(input.tracks) || !Array.isArray(input.patterns)) {
        throw new Error("Invalid beat project.");
    }

    const tracks = input.tracks.slice(0, MAX_TRACKS).map((track) => {
        const id = safeId(track?.id);
        const imported = isImportedTrack(track);
        const normalized = {
            id,
            name: plainText(track?.name, "CHANNEL", 24),
            color: SAFE_COLOR.test(String(track?.color || ""))
                ? track.color
                : "#64748b",
            vol: number(track?.vol, 0.7, 0, 1),
            pan: number(track?.pan, 0, -1, 1),
            stepsCount: TOTAL_STEPS,
            fx: {
                echo: number(track?.fx?.echo, 0, 0, 1),
                noise: number(track?.fx?.noise, 0, 0, 1),
                pitchMod: number(track?.fx?.pitchMod, 0, 0, 1),
            },
        };
        if (track?.soundId) normalized.soundId = safeId(track.soundId);
        if (imported) normalized.sampleRef = safeId(track.sampleRef || id);
        return normalized;
    });
    const publicTracks = includeImportedAudio
        ? tracks
        : tracks.filter((track) => !isImportedTrack(track));
    if (!publicTracks.length) throw new Error("The public beat has no playable channels.");
    const trackIds = new Set(publicTracks.map((track) => track.id));
    const patternCount = Math.max(1, Math.min(input.patterns.length, MAX_PATTERNS));

    const patterns = mapByTrack(
        input.patterns.slice(0, patternCount),
        trackIds,
        booleanSteps,
    );
    while (patterns.length < patternCount) patterns.push({});

    const project = {
        theme: THEMES.has(input.theme) ? input.theme : "sunrise",
        bpm: Math.round(number(input.bpm, 120, 60, 200)),
        lpf: Math.round(number(input.lpf, 3200, 100, 12000)),
        dist: Math.round(number(input.dist, 15, 0, 100)),
        spc: {
            master: number(input.spc?.master, 0.85, 0, 1),
            adsr: number(input.spc?.adsr, 4, 0, 7),
            echo: number(input.spc?.echo, 0.2, 0, 1),
        },
        tracks: publicTracks,
        patterns,
        patternMutes: mapByTrack(input.patternMutes, trackIds, Boolean),
        patternMidiNotes: mapByTrack(input.patternMidiNotes, trackIds, (notes) =>
            Array.from({ length: 12 }, (_, pitch) => booleanSteps(notes?.[pitch])),
        ),
        patternParameters: mapByTrack(
            input.patternParameters,
            trackIds,
            sanitizeParameters,
        ),
        patternOctaveOffsets: mapByTrack(
            input.patternOctaveOffsets,
            trackIds,
            (offset) => Math.round(number(offset, 0, -4, 4)),
        ),
        glitchPatterns: Array.from({ length: patternCount }, (_, index) => {
            const glitch = input.glitchPatterns?.[index] || {};
            return {
                tapestop: booleanSteps(glitch.tapestop),
                retrigger: booleanSteps(glitch.retrigger),
                reverser: booleanSteps(glitch.reverser),
                crusher: booleanSteps(glitch.crusher),
                gater: booleanSteps(glitch.gater),
            };
        }),
        songTimeline: Array.from({ length: patternCount }, (_, index) =>
            booleanSteps(input.songTimeline?.[index], TIMELINE_BLOCKS),
        ),
        noteSettings: {
            key: Math.round(number(input.noteSettings?.key, 0, 0, 11)),
            scale: ["chromatic", "major", "minor", "pentatonic"].includes(
                input.noteSettings?.scale,
            )
                ? input.noteSettings.scale
                : "chromatic",
        },
        projectName: plainText(input.projectName, "Untitled Beat", 80),
    };

    const starterSource = String(input.starterSource || input.remixOf || "");
    if (STARTER_BEAT_IDS.has(starterSource)) project.starterSource = starterSource;
    if (includeImportedAudio) {
        project.customSamples = sanitizeCustomSamples(
            input.customSamples,
            new Set(publicTracks.filter(isImportedTrack).map((track) => track.sampleRef)),
        );
        const missingSample = publicTracks
            .filter(isImportedTrack)
            .find((track) => !project.customSamples[track.sampleRef]);
        if (missingSample) {
            throw new Error("Imported audio is missing from the public copy.");
        }
    }
    return project;
}

module.exports = {
    STARTER_BEAT_IDS,
    preparePublicProject,
};