import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { FluentConfig, ContractConfig } from '../../config/schema';
import { CompileResult, CompileOptions } from './types';
import { ArtifactBuilder } from './artifacts';
import { RustBuilder } from './build';
import { COMPILER_CONSTANTS } from './constants';
import { CompilerErrors } from './errors';
import fs from 'fs';
import path from 'path';

export class RustCompiler {
  private readonly artifactBuilder: ArtifactBuilder;
  private readonly rustBuilder: RustBuilder;

  constructor(
    private readonly config: FluentConfig,
    private readonly hre: HardhatRuntimeEnvironment,
  ) {
    this.artifactBuilder = new ArtifactBuilder(this.hre.config.paths.artifacts);
    this.rustBuilder = new RustBuilder();
  }

  async compile(options: CompileOptions = {}): Promise<CompileResult[]> {
    await this.rustBuilder.ensureRustInstalled();
    return Promise.all(
      this.config.contracts.map((contract) => this.compileContract(contract, options)),
    );
  }

  private async compileContract(
    contract: ContractConfig,
    options: CompileOptions,
  ): Promise<CompileResult> {
    try {
      const contractPath = path.resolve(this.hre.config.paths.root, contract.path);
      const interfacePath = path.resolve(this.hre.config.paths.root, contract.interface.path);

      const contractName = path.basename(this.artifactBuilder.formatContractPath(contractPath));
      const interfaceName = path.basename(interfacePath, path.extname(interfacePath));

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
      const interfaceABI = this.getInterfaceABI(contract, interfaceName);

      await this.artifactBuilder.saveArtifact(
        contract,
        interfaceABI,
        contractName,
        interfaceName,
        bytecode,
      );

      return {
        contractName,
        success: true,
        output: bytecode,
      };
    } catch (error: any) {
      return {
        contractName: contract.path,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getInterfaceABI(contract: ContractConfig, interfaceName: string): any[] {
    if (!contract.interface) {
      throw CompilerErrors.interfaceNotFound(contract.path);
    }

    const interfacePath = path.resolve(
      this.hre.config.paths.artifacts,
      contract.interface.path,
      `${interfaceName}.json`,
    );

    if (!fs.existsSync(interfacePath)) {
      throw CompilerErrors.interfaceNotFound(interfacePath);
    }
    return JSON.parse(fs.readFileSync(interfacePath, 'utf8')).abi;
  }

  private getBytecode(wasmPath: string): string {
    if (!fs.existsSync(wasmPath)) {
      throw CompilerErrors.wasmNotFound(wasmPath);
    }
    return `0x${fs.readFileSync(wasmPath).toString('hex')}`;
  }

  async clean(): Promise<void> {
    for (const contract of this.config.contracts!) {
      const contractPath = path.resolve(this.hre.config.paths.root, contract.path);
      const formattedPath = this.artifactBuilder.formatContractPath(contract.path);
      const dirs = [
        path.join(contractPath, COMPILER_CONSTANTS.DIRECTORIES.TARGET),
        path.join(this.hre.config.paths.artifacts, formattedPath + '.wasm'),
        path.join(contractPath, COMPILER_CONSTANTS.DIRECTORIES.BIN),
      ];

      for (const dir of dirs) {
        if (fs.existsSync(dir)) {
          await fs.promises.rm(dir, { recursive: true, force: true });
        }
      }
    }
  }
}
