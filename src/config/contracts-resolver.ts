import fs from 'fs';
import glob from 'glob';
import path from 'path';
import { ConfigurationError, ErrorCode } from './errors';
import { UserConfig } from './schema';

interface DiscoveredContract {
  path: string;
  interface?: {
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
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }

      throw new ConfigurationError(
        'Failed to read Cargo.toml',
        [(error as Error).message],
        ErrorCode.CARGO_READ_ERROR,
      );
    }
  }

  /**
   * Checks if a directory contains a valid Rust contract
   */
  private isValidContractDirectory(directoryPath: string): boolean {
    try {
      const cargoPath = path.join(directoryPath, 'Cargo.toml');
      if (!fs.existsSync(cargoPath)) {
        return false;
      }
      const cargoContent = fs.readFileSync(cargoPath, 'utf8');
      return cargoContent.includes('fluentbase');
    } catch {
      return false;
    }
  }

  /**
   * Finds a Solidity interface file for a contract
   */
  private findContractInterface(contractDir: string, contractName: string): { path: string } {
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
      path: path.relative(process.cwd(), interfacePath),
    };
  }

  /**
   * Discovers contracts in the project
   */
  public discoverContracts(config: Pick<UserConfig, 'discovery'>): DiscoveredContract[] {
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
          } catch (error) {
            if (!(error instanceof Error)) {
              continue;
            }

            if (
              error instanceof ConfigurationError &&
              error.code === ErrorCode.INTERFACE_NOT_FOUND
            ) {
              const details = error.details?.join('\n  ') ?? '';
              console.warn(
                `Warning: ${error.message} for contract in ${contractDir}\n  ${details}`,
              );
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
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }

      if (!(error instanceof Error)) {
        throw new ConfigurationError(
          'Failed to discover contracts',
          ['Unknown error occurred'],
          ErrorCode.DISCOVERY_ERROR,
        );
      }

      throw new ConfigurationError(
        'Failed to discover contracts',
        [error.message],
        ErrorCode.DISCOVERY_ERROR,
      );
    }
  }
}
