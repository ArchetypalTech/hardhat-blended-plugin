import { UserConfig } from './schema';
interface DiscoveredContract {
    path: string;
    interface?: {
        path: string;
    };
}
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
     */
    private resolveContractName;
    /**
     * Checks if a directory contains a valid Rust contract
     */
    private isValidContractDirectory;
    /**
     * Finds a Solidity interface file for a contract
     */
    private findContractInterface;
    /**
     * Discovers contracts in the project
     */
    discoverContracts(config: Pick<UserConfig, 'discovery'>): DiscoveredContract[];
}
export {};
//# sourceMappingURL=contracts-resolver.d.ts.map