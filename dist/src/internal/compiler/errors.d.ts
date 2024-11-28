export declare enum CompilerErrorCode {
    RUST_NOT_INSTALLED = "RUST_NOT_INSTALLED",
    COMPILATION_FAILED = "COMPILATION_FAILED",
    WASM_NOT_FOUND = "WASM_NOT_FOUND",
    INTERFACE_NOT_FOUND = "INTERFACE_NOT_FOUND",
    INVALID_CONFIG = "INVALID_CONFIG",
    BUILD_FAILED = "BUILD_FAILED"
}
export declare class CompilerError extends Error {
    code: CompilerErrorCode;
    details?: string[] | undefined;
    constructor(code: CompilerErrorCode, message: string, details?: string[] | undefined);
}
export declare const CompilerErrors: {
    readonly rustNotInstalled: () => CompilerError;
    readonly compilationFailed: (contractPath: string, error: string) => CompilerError;
    readonly wasmNotFound: (path: string) => CompilerError;
    readonly interfaceNotFound: (path: string) => CompilerError;
    readonly invalidConfig: (message: string, details: string[]) => CompilerError;
    readonly buildFailed: (message: string, details?: string[]) => CompilerError;
};
//# sourceMappingURL=errors.d.ts.map