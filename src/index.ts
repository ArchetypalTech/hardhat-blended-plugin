import fs from "fs";
import { ensureDirSync } from "fs-extra";
import { extendConfig, subtask, task } from "hardhat/config";
import {
  HardhatConfig,
  HardhatRuntimeEnvironment,
  HardhatUserConfig,
} from "hardhat/types";
import path from "path";
import { compileAndGetBytecode } from "./compiler";
import { getInterfaceArtifact } from "./utils";

const WASM_FORMAT = "hh-wasm-artifact-1";

interface ContractCompileConfig {
  contractDir: string;
  interfacePath: string;
}

/**
 * Compiles a contract and generates an artifact file.
 * @param cfg - The contract compile configuration.
 * @param hre - The Hardhat runtime environment.
 */
function compileContract(
  cfg: ContractCompileConfig,
  hre: HardhatRuntimeEnvironment
) {
  const outputDir = path.join(hre.config.paths.artifacts, cfg.contractDir);

  // Get the interface artifact
  const interfaceArtifact = getInterfaceArtifact(
    cfg.interfacePath,
    hre.config.paths.artifacts
  );

  const contractName = path.basename(cfg.contractDir);

  // Compile the Rust project
  const bytecode = compileAndGetBytecode(
    path.join(hre.config.paths.root, cfg.contractDir)
  );

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
  ensureDirSync(outputDir);
  const artifactPath = path.join(outputDir, `${contractName}.json`);

  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
}

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.compileToWasmConfig =
      userConfig.compileToWasmConfig?.map((cfg) => ({
        contractDir: cfg.contractDir,
        interfacePath: cfg.interfacePath,
      })) ?? [];
  }
);

subtask(
  "compile-to-wasm",
  `Compiles the Rust project to WASM and save artifacts.

Configuration:
  To use this plugin, you need to add a compileToWasmConfig section in your Hardhat config. Here is an example:

  module.exports = {
    ...,
    compileToWasmConfig: [
      {
        contractDir: "contracts/my_rust_contract", // The relative path to the Rust contract directory from the project root
        interfacePath: "contracts/IMyContract.sol" // The relative path to the Solidity interface that corresponds to the Rust contract
      }
    ],
    ...
  };

  Fields:
    - contractDir: The relative path to the Rust contract directory from the project root. For example, "contracts/my_rust_contract".
    - interfacePath: The relative path to the Solidity interface that corresponds to the Rust contract. For example, "contracts/IMyContract.sol`
).setAction(async (_, hre) => {
  console.log("Compiling Rust contracts...");
  const compileConfigs = hre.config.compileToWasmConfig;

  for (const cfg of compileConfigs) {
    compileContract(cfg, hre);
  }
});

task("compile", "Compiles the entire project, including Rust").setAction(
  async (_, hre, runSuper) => {
    await runSuper();
    await hre.run("compile-to-wasm");
  }
);

declare module "hardhat/types/config" {
  interface ContractCompileConfig {
    contractDir: string; // The relative path to the Rust contract directory from the project root. For example, "contracts/my_contract".
    interfacePath: string; // The relative path to the Solidity interface that corresponds to the Rust contract. For example, "contracts/IMyContract.sol".
  }
  interface HardhatUserConfig {
    compileToWasmConfig?: ContractCompileConfig[];
  }

  interface HardhatConfig {
    compileToWasmConfig: ContractCompileConfig[];
  }
}
