"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RustCompiler = void 0;
const artifacts_1 = require("./artifacts");
const build_1 = require("./build");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class RustCompiler {
    constructor(config, hre) {
        this.config = config;
        this.hre = hre;
        this.artifactBuilder = new artifacts_1.ArtifactBuilder(this.hre.config.paths.artifacts);
        this.rustBuilder = new build_1.RustBuilder();
    }
    async compile(options = {}) {
        await this.rustBuilder.ensureRustInstalled();
        return Promise.all(this.config.contracts.map((contract) => this.compileContract(contract, options)));
    }
    async compileContract(contract, options) {
        try {
            const contractPath = path_1.default.resolve(this.hre.config.paths.root, contract.path);
            const contractName = path_1.default.basename(this.artifactBuilder.formatContractPath(contractPath));
            if (options.verbose) {
                console.log('Compiling with settings:', contract.compile);
            }
            const wasmPath = await this.rustBuilder.buildWasm(contractPath, contract.compile);
            if (options.verbose) {
                console.log(`Contract path: ${contractPath}`);
                console.log(`Contract name: ${contractName}`);
                console.log(`WASM path: ${wasmPath}`);
            }
            const bytecode = this.getBytecode(wasmPath);
            const interfaceABI = this.getInterfaceABI(contract);
            await this.artifactBuilder.saveArtifact(contract, interfaceABI, contractName, bytecode);
            return {
                contractName,
                success: true,
                output: bytecode,
            };
        }
        catch (error) {
            return {
                contractName: contract.path,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    getInterfaceABI(contract) {
        if (!contract.interface) {
            throw errors_1.CompilerErrors.interfaceNotFound(contract.path);
        }
        const interfacePath = path_1.default.resolve(this.hre.config.paths.artifacts, contract.interface.path, `${contract.interface.name}.json`);
        if (!fs_1.default.existsSync(interfacePath)) {
            throw errors_1.CompilerErrors.interfaceNotFound(interfacePath);
        }
        return JSON.parse(fs_1.default.readFileSync(interfacePath, 'utf8')).abi;
    }
    getBytecode(wasmPath) {
        if (!fs_1.default.existsSync(wasmPath)) {
            throw errors_1.CompilerErrors.wasmNotFound(wasmPath);
        }
        return `0x${fs_1.default.readFileSync(wasmPath).toString('hex')}`;
    }
    async clean() {
        for (const contract of this.config.contracts) {
            const contractPath = path_1.default.resolve(this.hre.config.paths.root, contract.path);
            const formattedPath = this.artifactBuilder.formatContractPath(contract.path);
            const dirs = [
                path_1.default.join(contractPath, constants_1.COMPILER_CONSTANTS.DIRECTORIES.TARGET),
                path_1.default.join(this.hre.config.paths.artifacts, formattedPath + '.wasm'),
                path_1.default.join(contractPath, constants_1.COMPILER_CONSTANTS.DIRECTORIES.BIN),
            ];
            for (const dir of dirs) {
                if (fs_1.default.existsSync(dir)) {
                    await fs_1.default.promises.rm(dir, { recursive: true, force: true });
                }
            }
        }
    }
}
exports.RustCompiler = RustCompiler;
//# sourceMappingURL=index.js.map