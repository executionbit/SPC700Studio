# SPC700 S-DSP build information

Ghettochip Studio ships the `wasm/spc-dsp.js` and `wasm/spc-dsp.wasm` browser
module from the supplied workstation resource. It wraps the standalone
`SPC_DSP` implementation from `snes-spc-arm` / `snes_spc` 0.9.0.

## Scope of emulation

This is an authentic S-DSP signal path: voices, BRR decoding, ADSR, pitch,
mixing, echo, and DSP RAM/register behavior are handled by the upstream
implementation. It is **not** a complete SPC700/SMP music emulator. The
workstation does not run the SPC700 CPU, timers, IPL boot ROM, or complete SPC
music files. Browser scheduling and the original procedural patch bank supply
the trigger events around the S-DSP core.

The core performance path runs across a pool of independent S-DSP instances;
each instance has its own 64 KB APU RAM and eight voices. Channels are assigned
round-robin to a chip/local voice pair, so simultaneous channels use separate
emulators and additional channels do not compete for one sample namespace. The
pool also redistributes new events across any healthy instances if one cannot
initialize. The larger library and DLC catalog uses the same deterministic
patch recipes through browser-resident audio buffers, preserving longer decays
while avoiding a finite-RAM failure after browsing many distinct sounds.

## Included source and notices

- The upstream S-DSP source used for this module is retained in
  `vendor/snes-spc-arm/snes_spc/`.
- The WebAssembly C ABI wrapper and its build script are retained in
  `spc-source/`.
- See `THIRD_PARTY_NOTICES.md` and `licenses/snes-spc-arm-license.txt` for
  attribution and licensing terms.

The source snapshot was supplied with this project resource; it identifies
itself as `snes_spc 0.9.0`. The upstream DSP source is unmodified. The
project-specific C ABI wrapper is retained separately so the LGPL component
can be inspected, rebuilt, and replaced independently.

## Rebuild

The module requires Emscripten (`em++`) and the included source tree. From the
project root, run:

```bash
bash spc-source/scripts/build-spc-dsp-wasm.sh
```

The script writes the resulting `spc-dsp.js` and `spc-dsp.wasm` files directly
to `wasm/`, where the runtime loads them.

## Asset policy

The workstation only generates procedural BRR patches or encodes audio selected
by the user. The encoder uses the available 64 KB APU RAM and reports when an
import is too long for the remaining memory; it never silently truncates an
import. It does not bundle game ROMs, BRR dumps, soundtrack data, or other
commercial game audio.