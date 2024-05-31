"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const compiler_1 = require("./compiler");
const fs_extra_1 = require("fs-extra");
const WASM_FORMAT = "hh-wasm-artifact-1";
function getBytecode(wasmPath) {
    if (!fs_1.default.existsSync(wasmPath)) {
        throw new Error(`Bytecode file not found at ${wasmPath}`);
    }
    const wasmBinary = fs_1.default.readFileSync(wasmPath);
    return `0x${wasmBinary.toString("hex")}`;
}
function compileToWasm(rootPath, contractDir) {
    console.log(`Compiling Rust project at ${contractDir}`);
    const pkgName = path_1.default.basename(contractDir).replace("-", "_");
    try {
        (0, compiler_1.build)({
            contractDir: contractDir,
            pkgName: pkgName,
            absolutePath: rootPath,
        });
        console.log("Rust project compiled successfully.");
        return getBytecode(path_1.default.join(rootPath, contractDir, "bin", `${pkgName}.wasm`));
    }
    catch (error) {
        console.error("Failed to compile Rust project.");
        throw error;
    }
}
function getInterfaceArtifact(interfacePath, artifactsPath) {
    // Generate artifact object using ABI from Hardhat artifacts
    const contractName = path_1.default.basename(interfacePath, ".sol");
    const artifactPath = path_1.default.join(artifactsPath, "contracts", `${contractName}.sol`, `${contractName}.json`);
    if (!fs_1.default.existsSync(artifactPath)) {
        throw new Error(`ABI file not found at ${artifactPath}`);
    }
    const artifact = JSON.parse(fs_1.default.readFileSync(artifactPath, "utf8"));
    return artifact;
}
function compileContract(cfg, hre) {
    const outputDir = (0, utils_1.getOutputDir)(hre.config.paths.artifacts, cfg.contractDir);
    console.log(`${hre.config.paths.root}`);
    // Get the interface artifact
    const interfaceArtifact = getInterfaceArtifact(cfg.interfacePath, hre.config.paths.artifacts);
    const contractName = path_1.default.basename(cfg.contractDir);
    // Compile the Rust project
    const bytecode = compileToWasm(hre.config.paths.root, cfg.contractDir);
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
    (0, fs_extra_1.ensureDirSync)(outputDir);
    console.log(`Saving artifact to ${outputDir}`);
    const artifactPath = path_1.default.join(outputDir, `${contractName}.json`);
    fs_1.default.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
}
(0, config_1.extendConfig)((config, userConfig) => {
    var _a, _b;
    config.compileToWasmConfig =
        (_b = (_a = userConfig.compileToWasmConfig) === null || _a === void 0 ? void 0 : _a.map((cfg) => ({
            contractDir: cfg.contractDir,
            interfacePath: cfg.interfacePath,
        }))) !== null && _b !== void 0 ? _b : [];
});
(0, config_1.subtask)("compile-to-wasm", "Compiles the Rust project").setAction(async (_, hre) => {
    const compileConfigs = hre.config.compileToWasmConfig;
    for (const cfg of compileConfigs) {
        compileContract(cfg, hre);
    }
});
(0, config_1.task)("compile", "Compiles the entire project, including Rust").setAction(async (_, hre, runSuper) => {
    await runSuper();
    await hre.run("compile-to-wasm");
});
//# sourceMappingURL=index.js.map