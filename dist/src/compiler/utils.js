"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBytecode = exports.rmDirSync = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
function rmDirSync(dirPath) {
    if (fs_1.default.existsSync(dirPath)) {
        (0, child_process_1.execSync)(`rm -rf ${dirPath}`);
    }
}
exports.rmDirSync = rmDirSync;
function getBytecode(wasmPath) {
    if (!fs_1.default.existsSync(wasmPath)) {
        throw new Error(`Bytecode file not found at ${wasmPath}`);
    }
    const wasmBinary = fs_1.default.readFileSync(wasmPath);
    return `0x${wasmBinary.toString("hex")}`;
}
exports.getBytecode = getBytecode;
//# sourceMappingURL=utils.js.map