import { ensureDirSync } from 'fs-extra';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FluentArtifact } from './types';
import { ContractConfig } from '../../config/schema';
import { CompilerInput, CompilerOutputContract } from 'hardhat/types';
import { COMPILER_CONSTANTS } from './constants';
import { RustBuildInfo } from './types';

/**
 * Handles creation and storage of compilation artifacts
 */
export class ArtifactBuilder {
  constructor(private readonly artifactsPath: string) {}

  /**
   * Saves contract artifact and associated files
   */
  async saveArtifact(
    config: ContractConfig,
    interfaceABI: any[],
    contractName: string,
    bytecode: string,
  ): Promise<void> {
    const formattedPath = this.formatContractPath(config.path);
    const artifactDir = path.join(this.artifactsPath, formattedPath + '.wasm');
    const artifactPath = path.join(artifactDir, `${contractName}.json`);

    const buildInfoPath = await this.saveBuildInfo(config, contractName, interfaceABI, bytecode);

    const artifact: FluentArtifact = {
      _format: COMPILER_CONSTANTS.ARTIFACTS.FORMATS.WASM,
      contractName,
      sourceName: config.path,
      interfaceName: config.interface.name,
      interfacePath: config.interface.path,
      abi: interfaceABI,
      bytecode,
      deployedBytecode: bytecode,
      linkReferences: {},
      deployedLinkReferences: {},
    };

    ensureDirSync(artifactDir);
    await fs.promises.writeFile(artifactPath, JSON.stringify(artifact, null, 2));
    await this.saveDebugArtifact(artifactDir, contractName, buildInfoPath);
  }

  /**
   * Formats contract path for artifact storage
   */
  public formatContractPath(contractPath: string): string {
    const parts = path.parse(contractPath);
    return path.join(
      parts.dir,
      parts.base
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(''),
    );
  }

  /**
   * Saves build info file and returns relative path
   */
  private async saveBuildInfo(
    config: ContractConfig,
    contractName: string,
    interfaceABI: any[],
    bytecode: string,
  ): Promise<string> {
    const buildId = crypto.randomBytes(16).toString('hex');
    const buildInfoDir = path.join(this.artifactsPath, COMPILER_CONSTANTS.DIRECTORIES.BUILD_INFO);
    const buildInfoPath = path.join(buildInfoDir, `${buildId}.json`);

    const buildInfo = this.createBuildInfo(config, contractName, interfaceABI, bytecode, buildId);

    ensureDirSync(buildInfoDir);
    await fs.promises.writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2));

    const formattedPath = this.formatContractPath(config.path);
    const contractArtifactPath = path.join(this.artifactsPath, formattedPath + '.wasm');
    const relativeToArtifacts = path.relative(this.artifactsPath, contractArtifactPath);
    const upDirs = relativeToArtifacts
      .split(path.sep)
      .map(() => '..')
      .join('/');

    return path.join(upDirs, COMPILER_CONSTANTS.DIRECTORIES.BUILD_INFO, `${buildId}.json`);
  }

  /**
   * Creates build info object containing compilation metadata
   */
  private createBuildInfo(
    config: ContractConfig,
    contractName: string,
    interfaceABI: any[],
    bytecode: string,
    buildId: string,
  ): RustBuildInfo {
    const bytecodeObject = {
      object: bytecode,
      opcodes: '',
      sourceMap: '',
      linkReferences: {},
      immutableReferences: {},
    };

    const contractOutput: CompilerOutputContract = {
      abi: interfaceABI,
      evm: {
        bytecode: bytecodeObject,
        deployedBytecode: bytecodeObject,
        methodIdentifiers: {},
      },
    };

    return {
      _format: COMPILER_CONSTANTS.ARTIFACTS.FORMATS.BUILD_INFO,
      solcVersion: COMPILER_CONSTANTS.ARTIFACTS.VERSION,
      solcLongVersion: COMPILER_CONSTANTS.ARTIFACTS.VERSION,
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
  private createCompilerInput(config: ContractConfig): CompilerInput {
    return {
      language: COMPILER_CONSTANTS.ARTIFACTS.LANGUAGE,
      sources: {
        [config.path]: {
          content: '',
        },
      },
      settings: {
        optimizer: {
          enabled: true, // Always enabled as it's controlled by options now
          runs: COMPILER_CONSTANTS.ARTIFACTS.OPTIMIZER_RUNS,
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
  private async saveDebugArtifact(
    artifactDir: string,
    contractName: string,
    buildInfoPath: string,
  ): Promise<void> {
    const debugInfo = {
      _format: COMPILER_CONSTANTS.ARTIFACTS.FORMATS.DEBUG,
      buildInfo: buildInfoPath,
    };

    const debugPath = path.join(artifactDir, `${contractName}.dbg.json`);
    await fs.promises.writeFile(debugPath, JSON.stringify(debugInfo, null, 2));
  }
}
