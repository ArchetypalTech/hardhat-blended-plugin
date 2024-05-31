"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const WASM_FORMAT = "hh-wasm-artifact-1";
const CARGO_INSTALL_CMD = "cargo install --git https://github.com/fluentlabs-xyz/fluentbase fluentbase-bin";
const RUST_INSTALL_CMD = "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y";
const RUSTFLAGS = "-C link-arg=-zstack-size=131072 -C target-feature=+bulk-memory -C opt-level=z -C strip=symbols";
function ensureRustInstalled() {
    try {
        (0, child_process_1.execSync)("rustc --version", { stdio: "ignore" });
        console.log("Rust is already installed.");
    }
    catch (error) {
        console.log("Rust is not installed. Installing Rust...");
        (0, child_process_1.execSync)(RUST_INSTALL_CMD);
        process.env.PATH += `:${process.env.HOME}/.cargo/bin`;
        console.log("Rust installed successfully.");
    }
}
function rmDirSync(dirPath) {
    if ((0, fs_1.existsSync)(dirPath)) {
        (0, child_process_1.execSync)(`rm -rf ${dirPath}`);
    }
}
function prepareOutputDir(outputDir) {
    console.log("Preparing the output directory...");
    if ((0, fs_1.existsSync)(outputDir)) {
        console.log("Output directory already exists. Deleting the directory...");
        rmDirSync(outputDir);
    }
    console.log(`Creating the output directory at ${outputDir}...`);
    (0, fs_1.mkdirSync)(outputDir);
}
function compileToWasm(projectPath, outputDir, pkgName) {
    const wasmTarget = path_1.default.join(projectPath, `target/wasm32-unknown-unknown/release/${pkgName}.wasm`);
    const wasmOutputFile = path_1.default.join(outputDir, `${pkgName}.wasm`);
    const wasmWatFile = path_1.default.join(outputDir, `${pkgName}.wat`);
    console.log(`Compiling Rust project at ${projectPath}`);
    try {
        (0, child_process_1.execSync)(`cargo build --release --target=wasm32-unknown-unknown --no-default-features`, {
            cwd: projectPath,
            env: Object.assign(Object.assign({}, process.env), { RUSTFLAGS }),
            stdio: "inherit",
        });
        console.log("Rust project compiled successfully.");
        console.log("Copying the wasm file to the output directory...");
        (0, fs_1.copyFileSync)(wasmTarget, wasmOutputFile);
        console.log("Converting wasm to wat...");
        (0, child_process_1.execSync)(`wasm2wat ${wasmOutputFile} > ${wasmWatFile}`, {
            stdio: "inherit",
        });
        return wasmOutputFile;
    }
    catch (error) {
        console.error("Failed to compile Rust project.");
        throw error;
    }
}
function ensureRwasmcInstalled() {
    try {
        (0, child_process_1.execSync)("command -v rwasmc", { stdio: "ignore" });
        console.log("rwasmc is already installed.");
    }
    catch (error) {
        console.log("rwasmc is not installed. Installing rwasmc...");
        (0, child_process_1.execSync)(CARGO_INSTALL_CMD, { stdio: "inherit" });
        console.log("rwasmc installed successfully.");
    }
}
function convertWasmToRwasm(wasmOutputFile, rwasmOutputFile) {
    ensureRwasmcInstalled();
    console.log("Converting wasm to rwasm...");
    (0, child_process_1.execSync)(`rwasmc --file-in-path="${wasmOutputFile}" --rwasm-file-out-path="${rwasmOutputFile}"`, { stdio: "inherit" });
}
function build({ contractDir, pkgName, absolutePath }) {
    const projectPath = path_1.default.resolve(absolutePath, contractDir);
    const outputDir = path_1.default.join(projectPath, "bin");
    const rwasmOutputFile = path_1.default.join(outputDir, `${pkgName}.rwasm`);
    console.log(`Building Rust project at ${projectPath}, package name: ${pkgName}`);
    ensureRustInstalled();
    prepareOutputDir(outputDir);
    const wasmOutputFile = compileToWasm(projectPath, outputDir, pkgName);
    convertWasmToRwasm(wasmOutputFile, rwasmOutputFile);
    console.log(`Build completed. WASM and rWASM files are in ${outputDir}`);
}
exports.build = build;
//# sourceMappingURL=compiler.js.map