# vendor/

This directory hosts the pinned `snes-spc-arm` source used to build the
S-DSP WebAssembly core.

Populate it with:

```bash
git submodule add https://github.com/nathancassano/snes-spc-arm.git vendor/snes-spc-arm
```

Do not commit built artifacts here — only the pinned upstream source
(as a submodule, per `.gitmodules`, or a manually pinned copy with its
exact commit/revision recorded).
