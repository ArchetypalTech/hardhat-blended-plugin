"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = require("fs-extra");
const config_1 = require("hardhat/config");
const path_1 = __importDefault(require("path"));
const compiler_1 = require("./compiler");
const utils_1 = require("./utils");
const WASM_FORMAT = "hh-wasm-artifact-1";
/**
 * Compiles a contract and generates an artifact file.
 * @param cfg - The contract compile configuration.
 * @param hre - The Hardhat runtime environment.
 */
function compileContract(cfg, hre) {
    const outputDir = path_1.default.join(hre.config.paths.artifacts, cfg.contractDir);
    // Get the interface artifact
    const interfaceArtifact = utils_1.getInterfaceArtifact(cfg.interfacePath, hre.config.paths.artifacts);
    const contractName = path_1.default.basename(cfg.contractDir);
    // Compile the Rust project
    const bytecode = compiler_1.compileAndGetBytecode(path_1.default.join(hre.config.paths.root, cfg.contractDir));
    const artifact = {
        _format: WASM_FORMAT,
        contractName: contractName,
        sourceName: cfg.contractDir,
        interfaceName: cfg.interfacePath,
        abi: interfaceArtifact.abi,
        bytecode: bytecode,
        deployedBytecode: bytecode,
        linkReferences: {},
        deployedLinkReferences: {},
    };
    // Save artifact to the output directory
    fs_extra_1.ensureDirSync(outputDir);
    const artifactPath = path_1.default.join(outputDir, `${contractName}.json`);
    fs_1.default.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
}
config_1.extendConfig((config, userConfig) => {
    var _a, _b;
    config.compileToWasmConfig = (_b = (_a = userConfig.compileToWasmConfig) === null || _a === void 0 ? void 0 : _a.map((cfg) => ({
        contractDir: cfg.contractDir,
        interfacePath: cfg.interfacePath,
    }))) !== null && _b !== void 0 ? _b : [];
});
config_1.subtask("compile-to-wasm", "Compiles the Rust project").setAction(async (_, hre) => {
    console.log("Compiling Rust contracts...");
    const compileConfigs = hre.config.compileToWasmConfig;
    for (const cfg of compileConfigs) {
        compileContract(cfg, hre);
    }
});
config_1.task("compile", "Compiles the entire project, including Rust").setAction(async (_, hre, runSuper) => {
    await runSuper();
    await hre.run("compile-to-wasm");
});
//# sourceMappingURL=index.js.map