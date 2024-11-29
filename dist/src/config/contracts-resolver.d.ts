import { CompileSettings, ContractConfig, TestSettings, UserConfig } from './schema';
export declare class ContractsResolver {
    /**
     * Converts kebab-case or snake_case to PascalCase
     */
    private toPascalCase;
    /**
     * Generates Solidity interface name from contract name
     */
    private getInterfaceName;
    /**
     * Resolves contract name from Cargo.toml manifest
     * @throws {ConfigurationError} if Cargo.toml is invalid or cannot be read
     */
    private resolveContractName;
    /**
     * Finds a Solidity interface file for a contract
     * @throws {ConfigurationError} if interface file is not found
     */
    private findContractInterface;
    /**
     * Validates and normalizes a contract path
     * @throws {ConfigurationError} if path is invalid or Cargo.toml is missing
     */
    private validateContractPath;
    /**
     * Checks if a directory contains a valid Rust contract
     * Validates presence of Cargo.toml and fluentbase dependency
     */
    private isValidContractDirectory;
    /**
     * Discovers base contract information in the project
     * @throws {ConfigurationError} if no valid contracts are found
     */
    private discoverContracts;
    resolve(config: UserConfig, globalCompileConfig: CompileSettings, globalTestConfig: TestSettings): ContractConfig[];
}
//# sourceMappingURL=contracts-resolver.d.ts.map