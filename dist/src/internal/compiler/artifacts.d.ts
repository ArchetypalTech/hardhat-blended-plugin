import { ContractConfig } from '../../config/schema';
/**
 * Handles creation and storage of compilation artifacts
 */
export declare class ArtifactBuilder {
    private readonly artifactsPath;
    constructor(artifactsPath: string);
    /**
     * Saves contract artifact and associated files
     */
    saveArtifact(config: ContractConfig, interfaceABI: any[], contractName: string, interfaceName: string, bytecode: string): Promise<void>;
    /**
     * Formats contract path for artifact storage
     */
    formatContractPath(contractPath: string): string;
    /**
     * Saves build info file and returns relative path
     */
    private saveBuildInfo;
    /**
     * Creates build info object containing compilation metadata
     */
    private createBuildInfo;
    /**
     * Creates compiler input configuration
     */
    private createCompilerInput;
    /**
     * Saves debug artifact file containing build info reference
     */
    private saveDebugArtifact;
}
//# sourceMappingURL=artifacts.d.ts.map