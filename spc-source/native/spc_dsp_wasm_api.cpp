/*
 * Thin C ABI around snes-spc-arm's standalone SPC_DSP implementation.
 * Keep the LGPL dependency separate under vendor/snes-spc-arm, preserve
 * upstream notices, and distribute the corresponding source/build details.
 */

#include <cstddef>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <new>

#include "SPC_DSP.h"

namespace {

constexpr std::size_t kSpcRamBytes = 0x10000;

struct SpcDspWasm final {
    SPC_DSP dsp;
    std::uint8_t* ram = nullptr;
};

inline SpcDspWasm* as_instance(std::uintptr_t handle) {
    return reinterpret_cast<SpcDspWasm*>(handle);
}

inline std::uintptr_t as_handle(SpcDspWasm* instance) {
    return reinterpret_cast<std::uintptr_t>(instance);
}

} // namespace

extern "C" {

std::uintptr_t spc_dsp_create() {
    auto* instance = new (std::nothrow) SpcDspWasm();
    if (instance == nullptr) {
        return 0;
    }

    instance->ram = static_cast<std::uint8_t*>(std::calloc(kSpcRamBytes, 1));
    if (instance->ram == nullptr) {
        delete instance;
        return 0;
    }

    instance->dsp.init(instance->ram);
    instance->dsp.reset();

    return as_handle(instance);
}

void spc_dsp_destroy(std::uintptr_t handle) {
    auto* instance = as_instance(handle);
    if (instance == nullptr) {
        return;
    }

    std::free(instance->ram);
    instance->ram = nullptr;
    delete instance;
}

void spc_dsp_reset(std::uintptr_t handle) {
    auto* instance = as_instance(handle);
    if (instance == nullptr) {
        return;
    }

    std::memset(instance->ram, 0, kSpcRamBytes);
    instance->dsp.reset();
}

std::uintptr_t spc_dsp_ram(std::uintptr_t handle) {
    auto* instance = as_instance(handle);
    return instance == nullptr
        ? 0
        : reinterpret_cast<std::uintptr_t>(instance->ram);
}

std::uint32_t spc_dsp_ram_size() {
    return static_cast<std::uint32_t>(kSpcRamBytes);
}

void spc_dsp_write(
    std::uintptr_t handle,
    std::uint32_t address,
    std::uint32_t value
) {
    auto* instance = as_instance(handle);
    if (instance == nullptr) {
        return;
    }

    instance->dsp.write(
        static_cast<int>(address & 0x7f),
        static_cast<int>(value & 0xff)
    );
}

std::uint32_t spc_dsp_read(
    std::uintptr_t handle,
    std::uint32_t address
) {
    auto* instance = as_instance(handle);
    if (instance == nullptr) {
        return 0;
    }

    return static_cast<std::uint32_t>(
        instance->dsp.read(static_cast<int>(address & 0x7f)) & 0xff
    );
}

std::int32_t spc_dsp_run(
    std::uintptr_t handle,
    std::int32_t clock_count,
    std::uintptr_t output_interleaved_ptr,
    std::int32_t output_capacity_samples
) {
    auto* instance = as_instance(handle);
    auto* output = reinterpret_cast<short*>(output_interleaved_ptr);

    if (instance == nullptr || output == nullptr || clock_count <= 0
        || output_capacity_samples <= 0) {
        return 0;
    }

    // set_output() must be called before run(); the DSP writes interleaved
    // stereo pairs into `output` up to output_capacity_samples shorts, and
    // never exceeds that bound. sample_count() reports how many of those
    // shorts were actually written this call, always a multiple of 2.
    instance->dsp.set_output(output, output_capacity_samples);
    instance->dsp.run(clock_count);
    return static_cast<std::int32_t>(instance->dsp.sample_count());
}

std::uintptr_t spc_malloc(std::uint32_t bytes) {
    if (bytes == 0) {
        return 0;
    }

    return reinterpret_cast<std::uintptr_t>(
        std::malloc(static_cast<std::size_t>(bytes))
    );
}

void spc_free(std::uintptr_t pointer) {
    std::free(reinterpret_cast<void*>(pointer));
}

} // extern "C"
