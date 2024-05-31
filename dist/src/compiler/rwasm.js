"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertWasmToRwasm = exports.ensureRwasmcInstalled = void 0;
const child_process_1 = require("child_process");
const CARGO_INSTALL_CMD = "cargo install --git https://github.com/fluentlabs-xyz/fluentbase fluentbase-bin";
function ensureRwasmcInstalled() {
    try {
        child_process_1.execSync("command -v rwasmc", { stdio: "ignore" });
    }
    catch (error) {
        console.log("rwasmc is not installed. Installing rwasmc...");
        child_process_1.execSync(CARGO_INSTALL_CMD, { stdio: "inherit" });
        console.log("rwasmc installed successfully.");
    }
}
exports.ensureRwasmcInstalled = ensureRwasmcInstalled;
function convertWasmToRwasm(wasmOutputFile, rwasmOutputFile) {
    ensureRwasmcInstalled();
    child_process_1.execSync(`rwasmc --file-in-path="${wasmOutputFile}" --rwasm-file-out-path="${rwasmOutputFile}"`, { stdio: "inherit" });
}
exports.convertWasmToRwasm = convertWasmToRwasm;
//# sourceMappingURL=rwasm.js.map