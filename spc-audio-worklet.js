class SpcPcmOutputProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.queue = [];
        this.offset = 0;
        this.processCount = 0;

        this.port.onmessage = ({ data }) => {
            if (data?.type === "enqueue" && data.frames instanceof Float32Array) {
                this.queue.push(data.frames);
            }
            if (data?.type === "clear") {
                this.queue = [];
                this.offset = 0;
            }
        };
    }

    process(_inputs, outputs) {
        const output = outputs[0];
        const left = output[0];
        const right = output[1] || left;

        for (let frame = 0; frame < left.length; frame += 1) {
            let queued = this.queue[0];
            while (queued && this.offset + 1 >= queued.length) {
                this.queue.shift();
                this.offset = 0;
                queued = this.queue[0];
            }

            if (!queued) {
                left[frame] = 0;
                right[frame] = 0;
                continue;
            }

            left[frame] = queued[this.offset];
            right[frame] = queued[this.offset + 1];
            this.offset += 2;
        }

        if (++this.processCount % 32 === 0) {
            const queuedSamples = this.queue.reduce(
                (total, frames, index) => total + frames.length - (index === 0 ? this.offset : 0),
                0,
            );
            this.port.postMessage({ type: "queue-state", queuedSamples });
        }
        return true;
    }
}

registerProcessor("spc-pcm-output", SpcPcmOutputProcessor);