"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutputDir = void 0;
const path_1 = __importDefault(require("path"));
function getOutputDir(artifactsPath, contractDir) {
    return path_1.default.join(artifactsPath, contractDir);
}
exports.getOutputDir = getOutputDir;
//# sourceMappingURL=utils.js.map