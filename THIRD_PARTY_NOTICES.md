# Third-party notices

## snes-spc-arm / snes_spc

This project includes the following source snapshot:

- Upstream: <https://github.com/nathancassano/snes-spc-arm>
- Component: standalone `SPC_DSP` from `snes_spc 0.9.0`
- License: GNU Lesser General Public License (LGPL)
- Integration: separately compiled WebAssembly module

The retained upstream source and notices are in
`vendor/snes-spc-arm/snes_spc/`. The complete upstream license text is retained
at `licenses/snes-spc-arm-license.txt`. The original `SPC_DSP` source is
unmodified; the browser-facing C ABI wrapper is a separate file at
`spc-source/native/spc_dsp_wasm_api.cpp`.

The generated browser artifacts are `wasm/spc-dsp.js` and
`wasm/spc-dsp.wasm`. Corresponding source and the matching rebuild script are
included in this project; see `SPC700_BUILD.md`. The workstation does not
bundle game ROMs, BRR dumps, soundtrack data, or commercial game samples.
