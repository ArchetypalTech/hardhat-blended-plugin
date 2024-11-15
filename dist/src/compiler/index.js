"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = build;
exports.compileAndGetBytecode = compileAndGetBytecode;
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const rustInstaller_1 = require("./rustInstaller");
const utils_1 = require("./utils");
const wasm_1 = require("./wasm");
const BIN_DIR_SLUG = 'bin';
/**
 * Builds the Rust project by compiling it to WebAssembly (WASM) and returns wasm file path.
 * @param contractDir - The absolute path to the contract directory containing the Rust project.
 * @param pkgName - The name of the rust contract package. If the package name is "my_contract", the output file will be my_contract.wasm
 */
function build(contractDir, pkgName) {
    (0, rustInstaller_1.ensureRustInstalled)();
    const outputDir = path_1.default.join(contractDir, BIN_DIR_SLUG);
    (0, utils_1.rmDirSync)(outputDir);
    (0, fs_extra_1.ensureDirSync)(outputDir);
    return (0, wasm_1.compileRustToWasm)(contractDir, BIN_DIR_SLUG, pkgName);
}
/**
 * Compiles the Rust project located at the specified directory and returns the bytecode.
 *
 * @param contractDir The directory path of the Rust project to compile.
 * @returns The compiled bytecode as a string.
 * @throws If there is an error during the compilation process.
 */
function compileAndGetBytecode(contractDir) {
    const pkgName = path_1.default.basename(contractDir).replace('-', '_');
    try {
        const wasmOutputFile = build(contractDir, pkgName);
        return (0, utils_1.getBytecode)(path_1.default.join(wasmOutputFile));
    }
    catch (error) {
        console.error('Failed to compile Rust project.');
        throw error;
    }
}
//# sourceMappingURL=index.js.map