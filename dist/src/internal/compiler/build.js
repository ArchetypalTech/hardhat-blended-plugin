"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RustBuilder = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const errors_1 = require("./errors");
class RustBuilder {
    /**
     * Generates WASM filename from contract path
     */
    getWasmName(contractPath) {
        const baseName = path_1.default.basename(contractPath);
        return `${baseName.replace(/-/g, '_')}.wasm`;
    }
    /**
     * Separates Rust flags from Cargo options
     */
    separateOptions(options) {
        return {
            cargoOptions: options.filter((opt) => !opt.startsWith('-C') && !opt.includes('--rustc-flags')),
            rustFlags: options.filter((opt) => opt.startsWith('-C')),
        };
    }
    /**
     * Builds WASM file from Rust contract
     */
    buildWasm(contractPath, settings) {
        const wasmName = this.getWasmName(contractPath);
        const outputDir = path_1.default.join(contractPath, constants_1.COMPILER_CONSTANTS.DIRECTORIES.TARGET, settings.target, 'release');
        const wasmPath = path_1.default.join(outputDir, wasmName);
        (0, fs_extra_1.ensureDirSync)(outputDir);
        try {
            const { cargoOptions, rustFlags } = this.separateOptions(settings.options);
            const buildCommand = ['cargo build', ...cargoOptions].join(' ');
            (0, child_process_1.execSync)(buildCommand, {
                cwd: contractPath,
                stdio: 'inherit',
                env: Object.assign(Object.assign({}, process.env), { RUSTFLAGS: rustFlags.join(' ') }),
            });
            return wasmPath;
        }
        catch (error) {
            throw errors_1.CompilerErrors.compilationFailed(contractPath, error instanceof Error ? error.message : String(error));
        }
    }
    ensureRustInstalled() {
        try {
            (0, child_process_1.execSync)('rustc --version', { stdio: 'ignore' });
        }
        catch (_a) {
            try {
                (0, child_process_1.execSync)("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y", {
                    stdio: 'inherit',
                });
                process.env.PATH += `:${process.env.HOME}/.cargo/bin`;
            }
            catch (_error) {
                throw errors_1.CompilerErrors.rustNotInstalled();
            }
        }
    }
}
exports.RustBuilder = RustBuilder;
//# sourceMappingURL=build.js.map