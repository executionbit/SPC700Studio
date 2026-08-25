(function () {
    "use strict";

    /**
     * Thin browser adapter for the separately compiled snes-spc-arm S-DSP
     * module. The chip itself remains in WebAssembly; this file only handles
     * loading, RAM access, and conversion of its signed 16-bit stereo output.
     */
    class SpcDspRuntime {
        constructor() {
            this.module = null;
            this.instance = 0;
            this.ramPointer = 0;
            this.outputPointer = 0;
            this.outputCapacity = 0;
        }

        async initialize() {
            if (this.instance) return;

            const wasmDirectory = new URL("wasm/", document.baseURI).href;
            const runtimeUrl = new URL("spc-dsp.js", wasmDirectory).href;
            const factoryModule = await import(runtimeUrl);
            const createModule = factoryModule.default;

            if (typeof createModule !== "function") {
                throw new Error("SPC700 WebAssembly factory is unavailable.");
            }

            this.module = await createModule({
                locateFile: (path) => new URL(path, wasmDirectory).href,
            });
            this.instance = this.module._spc_dsp_create();
            this.ramPointer = this.module._spc_dsp_ram(this.instance);

            if (!this.instance || !this.ramPointer) {
                throw new Error("The SPC700 S-DSP core could not start.");
            }
        }

        assertReady() {
            if (!this.module || !this.instance) {
                throw new Error("SPC700 runtime has not been initialized.");
            }
        }

        reset() {
            this.assertReady();
            this.module._spc_dsp_reset(this.instance);
        }

        writeDsp(address, value) {
            this.assertReady();
            this.module._spc_dsp_write(
                this.instance,
                Number(address) & 0x7f,
                Number(value) & 0xff,
            );
        }

        readDsp(address) {
            this.assertReady();
            return this.module._spc_dsp_read(this.instance, Number(address) & 0x7f) & 0xff;
        }

        writeRam(offset, bytes) {
            this.assertReady();
            const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
            if (offset < 0 || offset + source.length > 0x10000) {
                throw new RangeError("SPC700 sample does not fit in 64 KB APU RAM.");
            }
            this.module.HEAPU8.set(source, this.ramPointer + offset);
        }

        ensureOutputCapacity(sampleCount) {
            if (sampleCount <= this.outputCapacity) return;
            if (this.outputPointer) this.module._spc_free(this.outputPointer);
            this.outputPointer = this.module._spc_malloc(sampleCount * Int16Array.BYTES_PER_ELEMENT);
            this.outputCapacity = sampleCount;
            if (!this.outputPointer) {
                throw new Error("SPC700 output buffer allocation failed.");
            }
        }

        runFrames(frameCount) {
            this.assertReady();
            const requestedSamples = Math.max(2, Math.floor(frameCount) * 2);
            // The upstream DSP switches to an internal overflow buffer when a
            // write lands exactly on the supplied end pointer. Keep a small
            // stereo safety margin so sample_count() remains relative to our
            // output buffer at every render boundary.
            const capacity = requestedSamples + 64;
            this.ensureOutputCapacity(capacity);
            const written = this.module._spc_dsp_run(
                this.instance,
                Math.floor(frameCount) * 32,
                this.outputPointer,
                capacity,
            );
            if (written < 0 || written > capacity) {
                throw new Error("SPC700 renderer exceeded its PCM output buffer.");
            }
            const source = this.module.HEAP16.subarray(
                this.outputPointer >> 1,
                (this.outputPointer >> 1) + written,
            );
            const output = new Float32Array(written);
            for (let index = 0; index < written; index += 1) {
                output[index] = source[index] / 32768;
            }
            return output;
        }

        dispose() {
            if (!this.module) return;
            if (this.outputPointer) this.module._spc_free(this.outputPointer);
            if (this.instance) this.module._spc_dsp_destroy(this.instance);
            this.module = null;
            this.instance = 0;
            this.ramPointer = 0;
            this.outputPointer = 0;
            this.outputCapacity = 0;
        }
    }

    window.SpcDspRuntime = SpcDspRuntime;
})();