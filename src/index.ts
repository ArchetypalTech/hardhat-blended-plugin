import { extendConfig, task, subtask } from "hardhat/config";
import {
  HardhatUserConfig,
  HardhatConfig,
  HardhatRuntimeEnvironment,
} from "hardhat/types";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { getOutputDir } from "./utils";
import { build } from "./compiler";
import { ensureDirSync } from "fs-extra";

const WASM_FORMAT = "hh-wasm-artifact-1";

interface ContractCompileConfig {
  contractDir: string;
  interfacePath: string;
}

function getBytecode(wasmPath: string): string {
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`Bytecode file not found at ${wasmPath}`);
  }

  const wasmBinary = fs.readFileSync(wasmPath);

  return `0x${wasmBinary.toString("hex")}`;
}

function compileToWasm(rootPath: string, contractDir: string): string {
  console.log(`Compiling Rust project at ${contractDir}`);
  const pkgName = path.basename(contractDir).replace("-", "_");
  try {
    build({
      contractDir: contractDir,
      pkgName: pkgName,
      absolutePath: rootPath,
    });
    console.log("Rust project compiled successfully.");
    return getBytecode(
      path.join(rootPath, contractDir, "bin", `${pkgName}.wasm`)
    );
  } catch (error) {
    console.error("Failed to compile Rust project.");
    throw error;
  }
}

function getInterfaceArtifact(interfacePath: string, artifactsPath: string) {
  // Generate artifact object using ABI from Hardhat artifacts
  const contractName = path.basename(interfacePath, ".sol");
  const artifactPath = path.join(
    artifactsPath,
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`ABI file not found at ${artifactPath}`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact;
}

function compileContract(
  cfg: ContractCompileConfig,
  hre: HardhatRuntimeEnvironment
) {
  const outputDir = getOutputDir(hre.config.paths.artifacts, cfg.contractDir);
  console.log(`${hre.config.paths.root}`);
  // Get the interface artifact
  const interfaceArtifact = getInterfaceArtifact(
    cfg.interfacePath,
    hre.config.paths.artifacts
  );

  const contractName = path.basename(cfg.contractDir);

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

subtask("compile-to-wasm", "Compiles the Rust project").setAction(
  async (_, hre) => {
    const compileConfigs = hre.config.compileToWasmConfig;

    for (const cfg of compileConfigs) {
      compileContract(cfg, hre);
    }
  }
);

task("compile", "Compiles the entire project, including Rust").setAction(
  async (_, hre, runSuper) => {
    await runSuper();
    await hre.run("compile-to-wasm");
  }
);

declare module "hardhat/types/config" {
  interface ContractCompileConfig {
    contractDir: string;
    interfacePath: string;
  }
  interface HardhatUserConfig {
    compileToWasmConfig?: ContractCompileConfig[];
  }

  interface HardhatConfig {
    compileToWasmConfig: ContractCompileConfig[];
  }
}
