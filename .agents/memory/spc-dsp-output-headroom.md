---
name: S-DSP output headroom
description: The output-buffer constraint required by the bundled snes_spc DSP wrapper.
---

The bundled `snes_spc` S-DSP must receive a small stereo PCM buffer margin in
addition to the exact number of samples expected from a render call.

**Why:** When an output write lands exactly on the supplied end pointer, the
upstream core switches subsequent output to its internal overflow buffer. A
wrapper that then asks for its sample count receives a pointer difference that
is not relative to the caller's buffer.

**How to apply:** Any browser or native wrapper around this core should allocate
and pass a modest interleaved-stereo headroom beyond the predicted output size,
then validate the returned count before consuming PCM.