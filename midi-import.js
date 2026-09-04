(function (global) {
    "use strict";

    const PROGRAM_FAMILIES = [
        [0, 7, "gm_piano", "Piano"],
        [8, 15, "gm_mallet", "Chromatic Percussion"],
        [16, 23, "gm_organ", "Organ"],
        [24, 31, "gm_guitar", "Guitar"],
        [32, 39, "gm_bass", "Bass"],
        [40, 47, "gm_strings", "Strings"],
        [48, 55, "gm_ensemble", "Ensemble"],
        [56, 63, "gm_brass", "Brass"],
        [64, 71, "gm_reed", "Reed"],
        [72, 79, "gm_flute", "Pipe"],
        [80, 87, "gm_synth_lead", "Synth Lead"],
        [88, 95, "gm_synth_pad", "Synth Pad"],
        [96, 103, "gm_synth_fx", "Synth FX"],
        [104, 111, "gm_pluck", "World Pluck"],
        [112, 119, "gm_percussion", "Percussion"],
        [120, 127, "gm_synth_fx", "Sound FX"],
    ];

    function programFamily(program, channel) {
        if (channel === 9) {
            return { soundId: "gm_drums", family: "Drum Kit" };
        }
        const match =
            PROGRAM_FAMILIES.find(
                ([first, last]) => program >= first && program <= last,
            ) || PROGRAM_FAMILIES[10];
        return { soundId: match[2], family: match[3] };
    }

    function arrangementLength(
        songTicks,
        division,
        stepsPerPattern = 32,
        lastNoteTick = 0,
    ) {
        const totalSteps = Math.max(
            stepsPerPattern,
            Math.ceil((songTicks / division) * 4),
            arrangementPosition(lastNoteTick, division, stepsPerPattern)
                .absoluteStep + 1,
        );
        return {
            totalSteps,
            blockCount: Math.ceil(totalSteps / stepsPerPattern),
        };
    }

    function arrangementPosition(tick, division, stepsPerPattern = 32) {
        const absoluteStep = Math.max(0, Math.round((tick / division) * 4));
        return {
            absoluteStep,
            block: Math.floor(absoluteStep / stepsPerPattern),
            step: absoluteStep % stepsPerPattern,
        };
    }

    function durationSeconds(
        startStep,
        durationSteps,
        tempoSteps,
        defaultBpm,
    ) {
        const events = [...(tempoSteps || [])].sort((a, b) => a.step - b.step);
        let seconds = 0;
        for (let offset = 0; offset < Math.max(1, durationSteps); offset += 1) {
            const step = startStep + offset;
            const tempo = events
                .filter((event) => event.step <= step)
                .at(-1);
            seconds += 0.25 * (60 / (tempo?.bpm || defaultBpm || 120));
        }
        return seconds;
    }

    function parseMidiFile(arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        const view = new DataView(arrayBuffer);
        let pos = 0;
        const text = (offset, length) =>
            String.fromCharCode(...bytes.subarray(offset, offset + length));
        const readU16 = () => {
            if (pos + 2 > bytes.length) throw new Error("Unexpected end of MIDI file");
            const value = view.getUint16(pos);
            pos += 2;
            return value;
        };
        const readU32 = () => {
            if (pos + 4 > bytes.length) throw new Error("Unexpected end of MIDI file");
            const value = view.getUint32(pos);
            pos += 4;
            return value;
        };
        const readVarLen = (end) => {
            let value = 0;
            for (let count = 0; count < 4 && pos < end; count += 1) {
                const byte = bytes[pos++];
                value = (value << 7) | (byte & 0x7f);
                if (!(byte & 0x80)) return value;
            }
            throw new Error("Invalid MIDI variable-length value");
        };

        if (text(0, 4) !== "MThd") throw new Error("Not a Standard MIDI File");
        pos = 4;
        const headerLength = readU32();
        if (headerLength < 6 || pos + headerLength > bytes.length) {
            throw new Error("Invalid MIDI header");
        }
        const format = readU16();
        const sourceTrackCount = readU16();
        const division = readU16();
        pos = 8 + headerLength;
        if (format === 2) throw new Error("Type 2 MIDI files are not supported");
        if (division & 0x8000) throw new Error("SMPTE-timed MIDI files are not supported");

        const logicalTracks = [];
        let songTicks = 1;
        const tempoEvents = [{ tick: 0, microseconds: 500000 }];

        for (
            let sourceIndex = 0;
            sourceIndex < sourceTrackCount && pos + 8 <= bytes.length;
            sourceIndex += 1
        ) {
            if (text(pos, 4) !== "MTrk") throw new Error("Invalid MIDI track");
            pos += 4;
            const trackLength = readU32();
            const end = Math.min(bytes.length, pos + trackLength);
            const programs = Array(16).fill(0);
            const activeNotes = new Map();
            const notesByVoice = new Map();
            let tick = 0;
            let runningStatus = 0;
            let trackName = `MIDI Track ${sourceIndex + 1}`;

            const finishNote = (channel, note, endTick) => {
                const key = `${channel}:${note}`;
                const active = activeNotes.get(key);
                if (!active) return;
                activeNotes.delete(key);
                active.duration = Math.max(1, endTick - active.tick);
                const voiceKey = `${channel}:${active.program}`;
                if (!notesByVoice.has(voiceKey)) notesByVoice.set(voiceKey, []);
                notesByVoice.get(voiceKey).push(active);
            };

            while (pos < end) {
                tick += readVarLen(end);
                songTicks = Math.max(songTicks, tick);
                if (pos >= end) break;
                let status = bytes[pos++];
                if (status < 0x80) {
                    if (!runningStatus) throw new Error("Invalid MIDI running status");
                    pos -= 1;
                    status = runningStatus;
                } else if (status < 0xf0) {
                    runningStatus = status;
                }

                if (status === 0xff) {
                    if (pos >= end) break;
                    const metaType = bytes[pos++];
                    const length = readVarLen(end);
                    const metaEnd = Math.min(end, pos + length);
                    if (metaType === 0x03) trackName = text(pos, metaEnd - pos) || trackName;
                    if (metaType === 0x51 && metaEnd - pos === 3) {
                        const microseconds =
                            (bytes[pos] << 16) | (bytes[pos + 1] << 8) | bytes[pos + 2];
                        tempoEvents.push({ tick, microseconds });
                    }
                    pos = metaEnd;
                    continue;
                }
                if (status === 0xf0 || status === 0xf7) {
                    pos = Math.min(end, pos + readVarLen(end));
                    continue;
                }

                const command = status & 0xf0;
                const channel = status & 0x0f;
                const dataLength = command === 0xc0 || command === 0xd0 ? 1 : 2;
                if (pos + dataLength > end) throw new Error("Truncated MIDI event");
                const data1 = bytes[pos++];
                const data2 = dataLength === 2 ? bytes[pos++] : 0;
                if (command === 0xc0) {
                    programs[channel] = data1;
                } else if (command === 0x90 && data2 > 0) {
                    finishNote(channel, data1, tick);
                    activeNotes.set(`${channel}:${data1}`, {
                        note: data1,
                        tick,
                        duration: 1,
                        velocity: data2,
                        channel,
                        program: programs[channel],
                    });
                } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
                    finishNote(channel, data1, tick);
                }
            }
            for (const active of activeNotes.values()) {
                active.duration = Math.max(1, songTicks - active.tick);
                const voiceKey = `${active.channel}:${active.program}`;
                if (!notesByVoice.has(voiceKey)) notesByVoice.set(voiceKey, []);
                notesByVoice.get(voiceKey).push(active);
            }
            for (const notes of notesByVoice.values()) {
                const first = notes[0];
                const mapping = programFamily(first.program, first.channel);
                logicalTracks.push({
                    name:
                        notesByVoice.size > 1
                            ? `${trackName} · ${mapping.family}`
                            : trackName,
                    channel: first.channel,
                    program: first.program,
                    soundId: mapping.soundId,
                    family: mapping.family,
                    notes,
                });
            }
            pos = end;
        }

        if (!logicalTracks.length) throw new Error("No note events found in MIDI file");
        tempoEvents.sort((a, b) => a.tick - b.tick);
        const normalizedTempoEvents = tempoEvents.filter(
            (event, index) =>
                index === tempoEvents.length - 1 ||
                event.tick !== tempoEvents[index + 1].tick,
        );
        return {
            format,
            division,
            songTicks,
            bpm: Math.max(
                30,
                Math.min(
                    300,
                    Math.round(60000000 / normalizedTempoEvents[0].microseconds),
                ),
            ),
            tempoEvents: normalizedTempoEvents.map((event) => ({
                tick: event.tick,
                bpm: Math.max(
                    30,
                    Math.min(300, 60000000 / event.microseconds),
                ),
            })),
            tracks: logicalTracks,
        };
    }

    const api = {
        parseMidiFile,
        programFamily,
        arrangementLength,
        arrangementPosition,
        durationSeconds,
    };
    global.GhettochipMidi = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);