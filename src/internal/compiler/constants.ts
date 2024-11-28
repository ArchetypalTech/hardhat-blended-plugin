export const COMPILER_CONSTANTS = {
  DIRECTORIES: {
    TARGET: 'target',
    BUILD_INFO: 'build-info',
    BIN: 'bin',
  },
  ARTIFACTS: {
    FORMATS: {
      BUILD_INFO: 'hh-wasm-build-info-1',
      DEBUG: 'hh-wasm-dbg-1',
      WASM: 'hh-wasm-artifact-1',
    },
    LANGUAGE: 'Rust',
    VERSION: '0.0.0',
    OPTIMIZER_RUNS: 200,
  },
} as const;
