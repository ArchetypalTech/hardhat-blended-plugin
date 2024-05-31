"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileAndGetBytecode = exports.build = void 0;
const rustInstaller_1 = require("./rustInstaller");
const utils_1 = require("./utils");
const wasm_1 = require("./wasm");
const rwasm_1 = require("./rwasm");
const path_1 = __importDefault(require("path"));
const utils_2 = require("./utils");
const fs_extra_1 = require("fs-extra");
/**
 * Builds the Rust project by compiling it to WebAssembly (WASM) and converting it to rWASM.
 * @param contractDir - The absolute path to the contract directory containing the Rust project.
 * @param pkgName - The name of the rust contract package. If the package name is "my_contract", the output files will be my_contract.wasm and my_contract.rwasm.
 */
function build(contractDir, pkgName) {
    const bin = "bin";
    fs_extra_1.ensureDirSync(path_1.default.join(contractDir, bin));
    const rwasmOutputFile = path_1.default.join(contractDir, bin, `${pkgName}.rwasm`);
    rustInstaller_1.ensureRustInstalled();
    utils_1.prepareOutputDir(bin);
    const wasmOutputFile = wasm_1.compileRustToWasm(contractDir, bin, pkgName);
    rwasm_1.convertWasmToRwasm(wasmOutputFile, rwasmOutputFile);
    return { wasmOutputFile, rwasmOutputFile };
}
exports.build = build;
/**
 * Compiles the Rust project located at the specified directory and returns the bytecode.
 *
 * @param contractDir The directory path of the Rust project to compile.
 * @returns The compiled bytecode as a string.
 * @throws If there is an error during the compilation process.
 */
function compileAndGetBytecode(contractDir) {
    const pkgName = path_1.default.basename(contractDir).replace("-", "_");
    try {
        const { wasmOutputFile } = build(contractDir, pkgName);
        return utils_2.getBytecode(path_1.default.join(wasmOutputFile));
    }
    catch (error) {
        console.error("Failed to compile Rust project.");
        throw error;
    }
}
exports.compileAndGetBytecode = compileAndGetBytecode;
//# sourceMappingURL=index.js.map