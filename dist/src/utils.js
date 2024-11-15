"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArtifactPath = getArtifactPath;
exports.getInterfaceArtifact = getInterfaceArtifact;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Get the path to the artifact JSON file for the given interface path.
 * @param interfacePath - The path to the Solidity interface file.
 * @param artifactsPath - The root path to the Hardhat artifacts.
 * @returns The path to the artifact JSON file.
 */
function getArtifactPath(interfacePath, artifactsPath) {
    const contractName = path_1.default.basename(interfacePath, '.sol');
    const artifactPath = path_1.default.join(artifactsPath, interfacePath, `${contractName}.json`);
    if (!fs_1.default.existsSync(artifactPath)) {
        throw new Error(`ABI file not found at ${artifactPath}`);
    }
    return artifactPath;
}
/**
 * Get the artifact object for the given interface path.
 * @param interfacePath - The path to the Solidity interface file.
 * @param artifactsPath - The root path to the Hardhat artifacts.
 * @returns The artifact object.
 */
function getInterfaceArtifact(interfacePath, artifactsPath) {
    const artifactPath = getArtifactPath(interfacePath, artifactsPath);
    const artifact = JSON.parse(fs_1.default.readFileSync(artifactPath, 'utf8'));
    return artifact;
}
//# sourceMappingURL=utils.js.map