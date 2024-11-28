"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactBuilder = void 0;
const fs_extra_1 = require("fs-extra");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("./constants");
/**
 * Handles creation and storage of compilation artifacts
 */
class ArtifactBuilder {
    constructor(artifactsPath) {
        this.artifactsPath = artifactsPath;
    }
    /**
     * Saves contract artifact and associated files
     */
    async saveArtifact(config, interfaceABI, contractName, interfaceName, bytecode) {
        const formattedPath = this.formatContractPath(config.path);
        const artifactDir = path_1.default.join(this.artifactsPath, formattedPath + '.wasm');
        const artifactPath = path_1.default.join(artifactDir, `${contractName}.json`);
        const buildInfoPath = await this.saveBuildInfo(config, contractName, interfaceABI, bytecode);
        const artifact = {
            _format: constants_1.COMPILER_CONSTANTS.ARTIFACTS.FORMATS.WASM,
            contractName,
            sourceName: config.path,
            interfaceName: interfaceName,
            interfacePath: config.interface.path,
            abi: interfaceABI,
            bytecode,
            deployedBytecode: bytecode,
            linkReferences: {},
            deployedLinkReferences: {},
        };
        (0, fs_extra_1.ensureDirSync)(artifactDir);
        await fs_1.default.promises.writeFile(artifactPath, JSON.stringify(artifact, null, 2));
        await this.saveDebugArtifact(artifactDir, contractName, buildInfoPath);
    }
    /**
     * Formats contract path for artifact storage
     */
    formatContractPath(contractPath) {
        const parts = path_1.default.parse(contractPath);
        return path_1.default.join(parts.dir, parts.base
            .split(/[-_]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(''));
    }
    /**
     * Saves build info file and returns relative path
     */
    async saveBuildInfo(config, contractName, interfaceABI, bytecode) {
        const buildId = crypto_1.default.randomBytes(16).toString('hex');
        const buildInfoDir = path_1.default.join(this.artifactsPath, constants_1.COMPILER_CONSTANTS.DIRECTORIES.BUILD_INFO);
        const buildInfoPath = path_1.default.join(buildInfoDir, `${buildId}.json`);
        const buildInfo = this.createBuildInfo(config, contractName, interfaceABI, bytecode, buildId);
        (0, fs_extra_1.ensureDirSync)(buildInfoDir);
        await fs_1.default.promises.writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2));
        const formattedPath = this.formatContractPath(config.path);
        const contractArtifactPath = path_1.default.join(this.artifactsPath, formattedPath + '.wasm');
        const relativeToArtifacts = path_1.default.relative(this.artifactsPath, contractArtifactPath);
        const upDirs = relativeToArtifacts
            .split(path_1.default.sep)
            .map(() => '..')
            .join('/');
        return path_1.default.join(upDirs, constants_1.COMPILER_CONSTANTS.DIRECTORIES.BUILD_INFO, `${buildId}.json`);
    }
    /**
     * Creates build info object containing compilation metadata
     */
    createBuildInfo(config, contractName, interfaceABI, bytecode, buildId) {
        const bytecodeObject = {
            object: bytecode,
            opcodes: '',
            sourceMap: '',
            linkReferences: {},
            immutableReferences: {},
        };
        const contractOutput = {
            abi: interfaceABI,
            evm: {
                bytecode: bytecodeObject,
                deployedBytecode: bytecodeObject,
                methodIdentifiers: {},
            },
        };
        return {
            _format: constants_1.COMPILER_CONSTANTS.ARTIFACTS.FORMATS.BUILD_INFO,
            solcVersion: constants_1.COMPILER_CONSTANTS.ARTIFACTS.VERSION,
            solcLongVersion: constants_1.COMPILER_CONSTANTS.ARTIFACTS.VERSION,
            id: buildId,
            input: this.createCompilerInput(config),
            output: {
                contracts: {
                    [config.path]: {
                        [contractName]: contractOutput,
                    },
                },
                sources: {},
            },
            rustSettings: {
                target: config.compile.target,
                debug: config.compile.debug,
                options: config.compile.options,
            },
        };
    }
    /**
     * Creates compiler input configuration
     */
    createCompilerInput(config) {
        return {
            language: constants_1.COMPILER_CONSTANTS.ARTIFACTS.LANGUAGE,
            sources: {
                [config.path]: {
                    content: '',
                },
            },
            settings: {
                optimizer: {
                    enabled: true, // Always enabled as it's controlled by options now
                    runs: constants_1.COMPILER_CONSTANTS.ARTIFACTS.OPTIMIZER_RUNS,
                },
                outputSelection: {
                    '*': {
                        '*': ['*'],
                    },
                },
            },
        };
    }
    /**
     * Saves debug artifact file containing build info reference
     */
    async saveDebugArtifact(artifactDir, contractName, buildInfoPath) {
        const debugInfo = {
            _format: constants_1.COMPILER_CONSTANTS.ARTIFACTS.FORMATS.DEBUG,
            buildInfo: buildInfoPath,
        };
        const debugPath = path_1.default.join(artifactDir, `${contractName}.dbg.json`);
        await fs_1.default.promises.writeFile(debugPath, JSON.stringify(debugInfo, null, 2));
    }
}
exports.ArtifactBuilder = ArtifactBuilder;
//# sourceMappingURL=artifacts.js.map