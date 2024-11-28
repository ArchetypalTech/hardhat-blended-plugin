import fs from 'fs';
import glob from 'glob';
import path from 'path';
import { ConfigurationError, ErrorCode } from './errors';
import { CompileSettings, ContractConfig, TestSettings, UserConfig } from './schema';

/**
 * Represents basic contract information discovered during the scanning process
 */
interface DiscoveredContract {
  path: string;
  interface: {
    path: string;
  };
}

export class ContractsResolver {
  /**
   * Converts kebab-case or snake_case to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Generates Solidity interface name from contract name
   */
  private getInterfaceName(contractName: string): string {
    return `I${this.toPascalCase(contractName)}`;
  }

  /**
   * Resolves contract name from Cargo.toml manifest
   * @throws {ConfigurationError} if Cargo.toml is invalid or cannot be read
   */
  private resolveContractName(contractPath: string): string {
    const cargoPath = path.join(
      contractPath.endsWith('Cargo.toml') ? path.dirname(contractPath) : contractPath,
      'Cargo.toml',
    );

    try {
      const content = fs.readFileSync(cargoPath, 'utf8');
      const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
      if (!nameMatch) {
        throw new ConfigurationError(
          'Invalid Cargo.toml',
          [`Could not find package name in ${cargoPath}`],
          ErrorCode.INVALID_CARGO_TOML,
        );
      }
      return nameMatch[1];
    } catch (error: any) {
      if (error instanceof ConfigurationError) throw error;
      throw new ConfigurationError(
        'Failed to read Cargo.toml',
        [error.message],
        ErrorCode.CARGO_READ_ERROR,
      );
    }
  }

  /**
   * Finds a Solidity interface file for a contract
   * @throws {ConfigurationError} if interface file is not found
   */
  private findContractInterface(
    contractDir: string,
    contractName: string,
  ): { name: string; path: string } {
    const interfaceName = this.getInterfaceName(contractName);
    const interfacePath = path.join(path.dirname(contractDir), `${interfaceName}.sol`);

    if (!fs.existsSync(interfacePath)) {
      throw new ConfigurationError(
        'Interface file not found',
        [
          `Expected interface file at: ${interfacePath}`,
          `Interface should be named: ${interfaceName}.sol`,
          'Make sure the interface file exists and follows the naming convention',
        ],
        ErrorCode.INTERFACE_NOT_FOUND,
      );
    }

    return {
      name: interfaceName,
      path: path.relative(process.cwd(), interfacePath),
    };
  }

  /**
   * Validates and normalizes a contract path
   * @throws {ConfigurationError} if path is invalid or Cargo.toml is missing
   */
  private validateContractPath(contractPath: string): string {
    const normalizedPath = path.normalize(contractPath);

    if (normalizedPath.endsWith('Cargo.toml')) {
      if (!fs.existsSync(normalizedPath)) {
        throw new ConfigurationError(
          'Invalid contract path',
          [`Path does not exist: ${normalizedPath}`],
          ErrorCode.INVALID_PATH,
        );
      }
      return normalizedPath;
    }

    const cargoPath = path.join(normalizedPath, 'Cargo.toml');
    if (!fs.existsSync(cargoPath)) {
      throw new ConfigurationError(
        'Invalid contract path',
        [`Cargo.toml not found in directory: ${normalizedPath}`],
        ErrorCode.MISSING_CARGO,
      );
    }

    return normalizedPath;
  }

  /**
   * Checks if a directory contains a valid Rust contract
   * Validates presence of Cargo.toml and fluentbase dependency
   */
  private isValidContractDirectory(directoryPath: string): boolean {
    try {
      const cargoPath = path.join(directoryPath, 'Cargo.toml');
      if (!fs.existsSync(cargoPath)) return false;
      const cargoContent = fs.readFileSync(cargoPath, 'utf8');
      return cargoContent.includes('fluentbase');
    } catch {
      return false;
    }
  }

  /**
   * Discovers base contract information in the project
   * @throws {ConfigurationError} if no valid contracts are found
   */
  private discoverContracts(config: UserConfig): DiscoveredContract[] {
    const projectRoot = process.cwd();
    const searchPaths = config.discovery?.paths
      ? config.discovery.paths.map((p) => `${p}/**/Cargo.toml`)
      : ['contracts/**/Cargo.toml', 'src/**/Cargo.toml'];

    const ignorePatterns = config.discovery?.ignore ?? ['**/target/**', '**/node_modules/**'];
    const discoveredContracts: DiscoveredContract[] = [];
    const processedDirs = new Set<string>();

    try {
      for (const pattern of searchPaths) {
        const cargoFiles = glob.sync(pattern, {
          cwd: projectRoot,
          ignore: ignorePatterns,
        });

        for (const cargoPath of cargoFiles) {
          const contractDir = path.dirname(path.resolve(projectRoot, cargoPath));

          if (processedDirs.has(contractDir)) continue;
          processedDirs.add(contractDir);

          if (!this.isValidContractDirectory(contractDir)) continue;

          try {
            const contractName = this.resolveContractName(contractDir);
            const interface_ = this.findContractInterface(contractDir, contractName);

            discoveredContracts.push({
              path: path.relative(projectRoot, contractDir),
              interface: interface_,
            });
          } catch (error: any) {
            if (error.code === 'INTERFACE_NOT_FOUND') {
              console.warn(`Warning: ${error.message} for contract in ${contractDir}`);
              console.warn(error.details?.join('\n  '));
            } else {
              console.warn(
                `Warning: Failed to process contract in ${contractDir}: ${error.message}`,
              );
            }
          }
        }
      }

      if (discoveredContracts.length === 0) {
        throw new ConfigurationError(
          'No contracts found',
          ['Could not find any valid contracts in the project'],
          ErrorCode.NO_CONTRACTS,
        );
      }

      return discoveredContracts;
    } catch (error: any) {
      if (error instanceof ConfigurationError) throw error;
      throw new ConfigurationError(
        'Failed to discover contracts',
        [error.message],
        ErrorCode.DISCOVERY_ERROR,
      );
    }
  }

  /**
   * Creates full contract configurations by merging discovered contracts with settings
   */
  private createContractConfigs(
    discoveredContracts: DiscoveredContract[],
    globalCompileConfig: CompileSettings,
    globalTestConfig: TestSettings,
  ): ContractConfig[] {
    return discoveredContracts.map((contract) => ({
      ...contract,
      compile: { ...globalCompileConfig },
      test: { ...globalTestConfig },
    }));
  }

  /**
   * Resolves complete contract configurations.
   * Handles both explicitly configured contracts and auto-discovered ones.
   */
  resolve(
    config: UserConfig,
    globalCompileConfig: CompileSettings,
    globalTestConfig: TestSettings,
  ): ContractConfig[] {
    if (config.discovery?.enabled === false && !config.contracts) {
      throw new ConfigurationError(
        'Invalid configuration',
        ['No contracts configured and auto-discovery is disabled'],
        ErrorCode.INVALID_CONFIGURATION,
      );
    }

    let contracts: ContractConfig[] = [];

    if (config.contracts) {
      contracts = config.contracts.map((contract) => ({
        path: this.validateContractPath(contract.path),
        interface: contract.interface,
        compile: contract.compile ?? { ...globalCompileConfig },
        test: contract.test ?? { ...globalTestConfig },
      }));
    }

    // Discover contracts if none are explicitly configured
    if (contracts.length == 0 && config.discovery?.enabled !== false) {
      const discoveredContracts = this.discoverContracts(config);
      const discoveredConfigs = this.createContractConfigs(
        discoveredContracts,
        globalCompileConfig,
        globalTestConfig,
      );
      contracts = [...contracts, ...discoveredConfigs];
    }

    if (contracts.length === 0) {
      throw new ConfigurationError(
        'No contracts found',
        ['Could not find any contracts in the project'],
        ErrorCode.NO_CONTRACTS,
      );
    }

    return contracts;
  }
}
