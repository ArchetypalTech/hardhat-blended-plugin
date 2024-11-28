export enum CompilerErrorCode {
  RUST_NOT_INSTALLED = 'RUST_NOT_INSTALLED',
  COMPILATION_FAILED = 'COMPILATION_FAILED',
  WASM_NOT_FOUND = 'WASM_NOT_FOUND',
  INTERFACE_NOT_FOUND = 'INTERFACE_NOT_FOUND',
  INVALID_CONFIG = 'INVALID_CONFIG',
  BUILD_FAILED = 'BUILD_FAILED',
}

export class CompilerError extends Error {
  constructor(
    public code: CompilerErrorCode,
    message: string,
    public details?: string[],
  ) {
    super(message);
    this.name = 'CompilerError';
  }
}

export const CompilerErrors = {
  rustNotInstalled: () =>
    new CompilerError(CompilerErrorCode.RUST_NOT_INSTALLED, 'Rust is not installed.', [
      'Please install Rust manually or ensure network connectivity for automatic installation',
    ]),

  compilationFailed: (contractPath: string, error: string) =>
    new CompilerError(CompilerErrorCode.COMPILATION_FAILED, `Failed to compile ${contractPath}`, [
      error,
    ]),

  wasmNotFound: (path: string) =>
    new CompilerError(CompilerErrorCode.WASM_NOT_FOUND, 'WASM file not found', [
      `Expected WASM at: ${path}`,
    ]),

  contractNotFound: (path: string) =>
    new CompilerError(CompilerErrorCode.WASM_NOT_FOUND, 'Contract file not found', [
      `Expected contract at: ${path}`,
    ]),
  interfaceNotFound: (path: string) =>
    new CompilerError(CompilerErrorCode.INTERFACE_NOT_FOUND, 'Interface file not found', [
      `Expected interface at: ${path}`,
    ]),

  invalidConfig: (message: string, details: string[]) =>
    new CompilerError(CompilerErrorCode.INVALID_CONFIG, message, details),

  buildFailed: (message: string, details?: string[]) =>
    new CompilerError(CompilerErrorCode.BUILD_FAILED, message, details),
} as const;
