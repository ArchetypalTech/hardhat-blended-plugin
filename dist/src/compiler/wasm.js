"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileRustToWasm = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const RUSTFLAGS = "-C link-arg=-zstack-size=131072 -C target-feature=+bulk-memory -C opt-level=z -C strip=symbols";
function compileRustToWasm(projectPath, outputDir, pkgName) {
    const wasmTarget = path_1.default.join(projectPath, `target/wasm32-unknown-unknown/release/${pkgName}.wasm`);
    const wasmOutputFile = path_1.default.join(projectPath, outputDir, `${pkgName}.wasm`);
    try {
        child_process_1.execSync(`cargo build --release --target=wasm32-unknown-unknown --no-default-features`, {
            cwd: projectPath,
            env: Object.assign(Object.assign({}, process.env), { RUSTFLAGS }),
            stdio: "inherit",
        });
        fs_1.copyFileSync(wasmTarget, wasmOutputFile);
        return wasmOutputFile;
    }
    catch (error) {
        console.error("Failed to compile Rust project.");
        throw error;
    }
}
exports.compileRustToWasm = compileRustToWasm;
//# sourceMappingURL=wasm.js.map