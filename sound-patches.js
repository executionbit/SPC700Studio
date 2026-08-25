(function () {
    "use strict";

    const define = (kind, variation, options = {}) => ({
        kind,
        variation,
        duration: 0.18,
        ...options,
    });

    const PATCHES = {
        kick: define("kick", 1, { duration: 0.34, tone: 57, snap: 0.18 }),
        snare: define("snare", 2, { duration: 0.22, tone: 188, snap: 0.62 }),
        hat: define("hat", 3, { duration: 0.09, tone: 7200, snap: 0.7 }),
        glitch: define("fx", 4, { duration: 0.17, tone: 960 }),
        bass: define("bass", 5, { duration: 0.42, tone: 55 }),
        lead: define("lead", 6, { duration: 0.3, tone: 440 }),
        arp: define("bell", 7, { duration: 0.34, tone: 660 }),
        noise: define("shaker", 8, { duration: 0.18, tone: 2100 }),

        sun_kick: define("kick", 11, { duration: 0.32, tone: 61, snap: 0.24 }),
        ember_snare: define("snare", 12, { duration: 0.24, tone: 205, snap: 0.7 }),
        prism_hat: define("hat", 13, { duration: 0.08, tone: 7900, snap: 0.82 }),
        drift_clap: define("clap", 14, { duration: 0.19, tone: 1550 }),
        grove_tom: define("tom", 15, { duration: 0.29, tone: 132 }),
        spark_rim: define("rim", 16, { duration: 0.13, tone: 1520 }),

        mist_kick: define("kick", 21, { duration: 0.39, tone: 49, snap: 0.1 }),
        glass_snare: define("snare", 22, { duration: 0.27, tone: 244, snap: 0.45 }),
        halo_hat: define("hat", 23, { duration: 0.14, tone: 6200, snap: 0.55 }),
        tide_shaker: define("shaker", 24, { duration: 0.27, tone: 2600 }),
        velvet_bass: define("bass", 25, { duration: 0.52, tone: 49 }),
        lunar_lead: define("lead", 26, { duration: 0.4, tone: 330 }),

        arc_kick: define("kick", 31, { duration: 0.28, tone: 68, snap: 0.32 }),
        chrome_snare: define("snare", 32, { duration: 0.2, tone: 218, snap: 0.76 }),
        pulse_hat: define("hat", 33, { duration: 0.06, tone: 8800, snap: 0.9 }),
        signal_clap: define("clap", 34, { duration: 0.15, tone: 1900 }),
        circuit_bass: define("bass", 35, { duration: 0.32, tone: 62 }),
        vector_arp: define("bell", 36, { duration: 0.25, tone: 784 }),

        aurora_drum: define("tom", 41, { duration: 0.34, tone: 108 }),
        aurora_chime: define("bell", 42, { duration: 0.48, tone: 880 }),
        aurora_swell: define("pad", 43, { duration: 0.54, tone: 220 }),
        iron_kick: define("kick", 51, { duration: 0.3, tone: 58, snap: 0.36 }),
        iron_clang: define("rim", 52, { duration: 0.19, tone: 1810 }),
        iron_drive: define("bass", 53, { duration: 0.4, tone: 52 }),
        moon_tom: define("tom", 61, { duration: 0.42, tone: 94 }),
        moon_glass: define("bell", 62, { duration: 0.62, tone: 1046 }),
        moon_breath: define("pad", 63, { duration: 0.64, tone: 175 }),
        sun_clap: define("clap", 71, { duration: 0.17, tone: 1770 }),
        sun_bongo: define("tom", 72, { duration: 0.25, tone: 164 }),
        sun_bloom: define("lead", 73, { duration: 0.36, tone: 523 }),
        hall_kick: define("kick", 81, { duration: 0.38, tone: 47, snap: 0.14 }),
        hall_brass: define("lead", 82, { duration: 0.46, tone: 294 }),
        hall_timpani: define("tom", 83, { duration: 0.48, tone: 74 }),
        fog_snare: define("snare", 91, { duration: 0.31, tone: 176, snap: 0.38 }),
        fog_wind: define("pad", 92, { duration: 0.7, tone: 196 }),
        fog_drop: define("fx", 93, { duration: 0.3, tone: 640 }),
        mirror_hat: define("hat", 101, { duration: 0.18, tone: 6800, snap: 0.5 }),
        mirror_bell: define("bell", 102, { duration: 0.56, tone: 1175 }),
        mirror_pluck: define("lead", 103, { duration: 0.22, tone: 698 }),
        rush_kick: define("kick", 111, { duration: 0.25, tone: 72, snap: 0.42 }),
        rush_hat: define("hat", 112, { duration: 0.05, tone: 9300, snap: 0.94 }),
        rush_flash: define("fx", 113, { duration: 0.14, tone: 1320 }),
    };

    function seededRandom(seed) {
        let value = seed >>> 0;
        return () => {
            value = (value * 1664525 + 1013904223) >>> 0;
            return value / 0xffffffff;
        };
    }

    function fallbackRecipe(id) {
        let hash = 2166136261;
        for (const char of String(id)) {
            hash ^= char.charCodeAt(0);
            hash = Math.imul(hash, 16777619);
        }
        const choices = ["lead", "bell", "pad", "fx"];
        return define(choices[Math.abs(hash) % choices.length], hash, {
            duration: 0.24 + (Math.abs(hash) % 24) / 100,
            tone: 220 + (Math.abs(hash) % 900),
        });
    }

    function recipeFor(id) {
        return PATCHES[id] || fallbackRecipe(id);
    }

    function render(id, sampleRate = 32000) {
        const recipe = recipeFor(id);
        const frameCount = Math.max(48, Math.round(recipe.duration * sampleRate));
        const output = new Float32Array(frameCount);
        const random = seededRandom(recipe.variation * 7919 + frameCount);
        const tone = recipe.tone || 440;

        for (let frame = 0; frame < frameCount; frame += 1) {
            const time = frame / sampleRate;
            const position = frame / frameCount;
            const noise = random() * 2 - 1;
            const sine = (frequency) => Math.sin(Math.PI * 2 * frequency * time);
            let value = 0;

            if (recipe.kind === "kick") {
                const frequency = tone * Math.pow(0.12, position);
                value =
                    sine(frequency) * Math.exp(-position * 6.4) * 0.95 +
                    noise * Math.exp(-position * 38) * recipe.snap;
            } else if (recipe.kind === "snare") {
                const body = sine(tone) * Math.exp(-position * 8) * 0.42;
                value =
                    body +
                    noise *
                        Math.exp(-position * (5.3 + recipe.snap * 3)) *
                        (0.5 + recipe.snap * 0.35);
            } else if (recipe.kind === "hat") {
                const metal =
                    sine(tone) * 0.22 +
                    sine(tone * 1.47) * 0.18 +
                    sine(tone * 2.13) * 0.14;
                value =
                    (noise * 0.72 + metal) *
                    Math.exp(-position * (11 - recipe.snap * 3));
            } else if (recipe.kind === "clap") {
                const burst =
                    Math.exp(-position * 18) +
                    (position > 0.12 ? Math.exp(-(position - 0.12) * 22) * 0.66 : 0) +
                    (position > 0.25 ? Math.exp(-(position - 0.25) * 25) * 0.38 : 0);
                value = noise * burst * 0.78;
            } else if (recipe.kind === "tom") {
                const frequency = tone * Math.pow(0.68, position);
                value =
                    (sine(frequency) * 0.9 + sine(frequency * 1.98) * 0.15) *
                    Math.exp(-position * 4.8);
            } else if (recipe.kind === "rim") {
                value =
                    (sine(tone) * 0.64 + sine(tone * 2.8) * 0.26 + noise * 0.18) *
                    Math.exp(-position * 14);
            } else if (recipe.kind === "shaker") {
                value =
                    noise *
                    (0.6 + Math.sin(position * Math.PI * 7) * 0.28) *
                    Math.exp(-position * 3.6);
            } else if (recipe.kind === "bass") {
                const phase = (tone * time) % 1;
                value =
                    ((phase * 2 - 1) * 0.62 + sine(tone) * 0.34) *
                    Math.exp(-position * 1.9);
            } else if (recipe.kind === "bell") {
                value =
                    (sine(tone) * 0.58 +
                        sine(tone * 2.71) * 0.28 +
                        sine(tone * 4.08) * 0.14) *
                    Math.exp(-position * 3.4);
            } else if (recipe.kind === "pad") {
                value =
                    (sine(tone) * 0.42 +
                        sine(tone * 1.5) * 0.18 +
                        sine(tone * 0.5) * 0.14) *
                    Math.sin(Math.min(1, position * 8) * Math.PI * 0.5) *
                    Math.exp(-position * 1.5);
            } else if (recipe.kind === "fx") {
                const frequency = tone * (1.75 - position * 1.25);
                value =
                    (sine(frequency) * 0.52 + noise * 0.24) *
                    Math.exp(-position * 5.2);
            } else {
                value =
                    (sine(tone) * 0.65 + sine(tone * 2) * 0.18) *
                    Math.exp(-position * 3.2);
            }
            output[frame] = Math.max(-1, Math.min(1, value));
        }
        return output;
    }

    function createBuffer(context, id) {
        const pcm = render(id, context.sampleRate);
        const buffer = context.createBuffer(1, pcm.length, context.sampleRate);
        buffer.copyToChannel(pcm, 0);
        return buffer;
    }

    window.GhettochipPatchBank = {
        createBuffer,
        has: (id) => Boolean(PATCHES[id]),
        recipeFor,
        render,
    };
})();