"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRustInstalled = ensureRustInstalled;
const child_process_1 = require("child_process");
const RUST_INSTALL_CMD = "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y";
function ensureRustInstalled() {
    try {
        (0, child_process_1.execSync)('rustc --version', { stdio: 'ignore' });
    }
    catch (error) {
        console.log('Rust is not installed. Installing Rust...');
        (0, child_process_1.execSync)(RUST_INSTALL_CMD);
        process.env.PATH += `:${process.env.HOME}/.cargo/bin`;
        console.log('Rust installed successfully.');
    }
}
//# sourceMappingURL=rustInstaller.js.map