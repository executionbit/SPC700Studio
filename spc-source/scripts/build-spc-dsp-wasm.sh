#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENDOR="$ROOT/vendor/snes-spc-arm/snes_spc"
OUT="$ROOT/wasm"

if [[ ! -f "$VENDOR/SPC_DSP.cpp" || ! -f "$VENDOR/SPC_DSP.h" ]]; then
  echo "Missing snes-spc-arm source at: $VENDOR" >&2
  echo "Populate vendor/snes-spc-arm before building." >&2
  exit 1
fi

command -v em++ >/dev/null 2>&1 || {
  echo "em++ was not found. Activate Emscripten with: source ~/emsdk/emsdk_env.sh" >&2
  exit 1
}

mkdir -p "$OUT"

em++ \
  "$ROOT/spc-source/native/spc_dsp_wasm_api.cpp" \
  "$VENDOR/SPC_DSP.cpp" \
  -I"$VENDOR" \
  -O3 \
  -DNDEBUG \
  -std=c++17 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web,worker \
  -s FILESYSTEM=0 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_FUNCTIONS='[
    "_spc_dsp_create",
    "_spc_dsp_destroy",
    "_spc_dsp_reset",
    "_spc_dsp_ram",
    "_spc_dsp_ram_size",
    "_spc_dsp_write",
    "_spc_dsp_read",
    "_spc_dsp_run",
    "_spc_malloc",
    "_spc_free"
  ]' \
  -s EXPORTED_RUNTIME_METHODS='["HEAPU8","HEAP16"]' \
  -o "$OUT/spc-dsp.js"

printf 'Built:\n  %s\n  %s\n' "$OUT/spc-dsp.js" "$OUT/spc-dsp.wasm"
