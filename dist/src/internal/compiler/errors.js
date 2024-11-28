"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerErrors = exports.CompilerError = exports.CompilerErrorCode = void 0;
var CompilerErrorCode;
(function (CompilerErrorCode) {
    CompilerErrorCode["RUST_NOT_INSTALLED"] = "RUST_NOT_INSTALLED";
    CompilerErrorCode["COMPILATION_FAILED"] = "COMPILATION_FAILED";
    CompilerErrorCode["WASM_NOT_FOUND"] = "WASM_NOT_FOUND";
    CompilerErrorCode["INTERFACE_NOT_FOUND"] = "INTERFACE_NOT_FOUND";
    CompilerErrorCode["INVALID_CONFIG"] = "INVALID_CONFIG";
    CompilerErrorCode["BUILD_FAILED"] = "BUILD_FAILED";
})(CompilerErrorCode || (exports.CompilerErrorCode = CompilerErrorCode = {}));
class CompilerError extends Error {
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'CompilerError';
    }
}
exports.CompilerError = CompilerError;
exports.CompilerErrors = {
    rustNotInstalled: () => new CompilerError(CompilerErrorCode.RUST_NOT_INSTALLED, 'Rust is not installed.', [
        'Please install Rust manually or ensure network connectivity for automatic installation',
    ]),
    compilationFailed: (contractPath, error) => new CompilerError(CompilerErrorCode.COMPILATION_FAILED, `Failed to compile ${contractPath}`, [
        error,
    ]),
    wasmNotFound: (path) => new CompilerError(CompilerErrorCode.WASM_NOT_FOUND, 'WASM file not found', [
        `Expected WASM at: ${path}`,
    ]),
    contractNotFound: (path) => new CompilerError(CompilerErrorCode.WASM_NOT_FOUND, 'Contract file not found', [
        `Expected contract at: ${path}`,
    ]),
    interfaceNotFound: (path) => new CompilerError(CompilerErrorCode.INTERFACE_NOT_FOUND, 'Interface file not found', [
        `Expected interface at: ${path}`,
    ]),
    invalidConfig: (message, details) => new CompilerError(CompilerErrorCode.INVALID_CONFIG, message, details),
    buildFailed: (message, details) => new CompilerError(CompilerErrorCode.BUILD_FAILED, message, details),
};
//# sourceMappingURL=errors.js.map