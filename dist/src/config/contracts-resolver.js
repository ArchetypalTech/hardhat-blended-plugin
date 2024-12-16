"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsResolver = void 0;
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("./errors");
class ContractsResolver {
    /**
     * Converts kebab-case or snake_case to PascalCase
     */
    toPascalCase(str) {
        return str
            .split(/[-_]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }
    /**
     * Generates Solidity interface name from contract name
     */
    getInterfaceName(contractName) {
        return `I${this.toPascalCase(contractName)}`;
    }
    /**
     * Resolves contract name from Cargo.toml manifest
     */
    resolveContractName(contractPath) {
        const cargoPath = path_1.default.join(contractPath.endsWith('Cargo.toml') ? path_1.default.dirname(contractPath) : contractPath, 'Cargo.toml');
        try {
            const content = fs_1.default.readFileSync(cargoPath, 'utf8');
            const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
            if (!nameMatch) {
                throw new errors_1.ConfigurationError('Invalid Cargo.toml', [`Could not find package name in ${cargoPath}`], errors_1.ErrorCode.INVALID_CARGO_TOML);
            }
            return nameMatch[1];
        }
        catch (error) {
            if (error instanceof errors_1.ConfigurationError) {
                throw error;
            }
            throw new errors_1.ConfigurationError('Failed to read Cargo.toml', [error.message], errors_1.ErrorCode.CARGO_READ_ERROR);
        }
    }
    /**
     * Checks if a directory contains a valid Rust contract
     */
    isValidContractDirectory(directoryPath) {
        try {
            const cargoPath = path_1.default.join(directoryPath, 'Cargo.toml');
            if (!fs_1.default.existsSync(cargoPath)) {
                return false;
            }
            const cargoContent = fs_1.default.readFileSync(cargoPath, 'utf8');
            return cargoContent.includes('fluentbase');
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Finds a Solidity interface file for a contract
     */
    findContractInterface(contractDir, contractName) {
        const interfaceName = this.getInterfaceName(contractName);
        const interfacePath = path_1.default.join(path_1.default.dirname(contractDir), `${interfaceName}.sol`);
        if (!fs_1.default.existsSync(interfacePath)) {
            throw new errors_1.ConfigurationError('Interface file not found', [
                `Expected interface file at: ${interfacePath}`,
                `Interface should be named: ${interfaceName}.sol`,
                'Make sure the interface file exists and follows the naming convention',
            ], errors_1.ErrorCode.INTERFACE_NOT_FOUND);
        }
        return {
            path: path_1.default.relative(process.cwd(), interfacePath),
        };
    }
    /**
     * Discovers contracts in the project
     */
    discoverContracts(config) {
        var _a, _b, _c, _d, _e;
        const projectRoot = process.cwd();
        const searchPaths = ((_a = config.discovery) === null || _a === void 0 ? void 0 : _a.paths)
            ? config.discovery.paths.map((p) => `${p}/**/Cargo.toml`)
            : ['contracts/**/Cargo.toml', 'src/**/Cargo.toml'];
        const ignorePatterns = (_c = (_b = config.discovery) === null || _b === void 0 ? void 0 : _b.ignore) !== null && _c !== void 0 ? _c : ['**/target/**', '**/node_modules/**'];
        const discoveredContracts = [];
        const processedDirs = new Set();
        try {
            for (const pattern of searchPaths) {
                const cargoFiles = glob_1.default.sync(pattern, {
                    cwd: projectRoot,
                    ignore: ignorePatterns,
                });
                for (const cargoPath of cargoFiles) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    const contractDir = path_1.default.dirname(path_1.default.resolve(projectRoot, cargoPath));
                    if (processedDirs.has(contractDir))
                        continue;
                    processedDirs.add(contractDir);
                    if (!this.isValidContractDirectory(contractDir))
                        continue;
                    try {
                        const contractName = this.resolveContractName(contractDir);
                        const interface_ = this.findContractInterface(contractDir, contractName);
                        discoveredContracts.push({
                            path: path_1.default.relative(projectRoot, contractDir),
                            interface: interface_,
                        });
                    }
                    catch (error) {
                        if (!(error instanceof Error)) {
                            continue;
                        }
                        if (error instanceof errors_1.ConfigurationError &&
                            error.code === errors_1.ErrorCode.INTERFACE_NOT_FOUND) {
                            const details = (_e = (_d = error.details) === null || _d === void 0 ? void 0 : _d.join('\n  ')) !== null && _e !== void 0 ? _e : '';
                            console.warn(`Warning: ${error.message} for contract in ${contractDir}\n  ${details}`);
                        }
                        else {
                            console.warn(`Warning: Failed to process contract in ${contractDir}: ${error.message}`);
                        }
                    }
                }
            }
            if (discoveredContracts.length === 0) {
                throw new errors_1.ConfigurationError('No contracts found', ['Could not find any valid contracts in the project'], errors_1.ErrorCode.NO_CONTRACTS);
            }
            return discoveredContracts;
        }
        catch (error) {
            if (error instanceof errors_1.ConfigurationError) {
                console.log("FOOOOOOPPPPPPPP!!!!");
                throw error;
            }
            if (!(error instanceof Error)) {
                throw new errors_1.ConfigurationError('Failed to discover contracts', ['Unknown error occurred'], errors_1.ErrorCode.DISCOVERY_ERROR);
            }
            throw new errors_1.ConfigurationError('Failed to discover contracts', [error.message], errors_1.ErrorCode.DISCOVERY_ERROR);
        }
    }
}
exports.ContractsResolver = ContractsResolver;
//# sourceMappingURL=contracts-resolver.js.map