import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { FluentConfig } from '../../config/schema';
import { CompileResult, CompileOptions } from './types';
export declare class RustCompiler {
    private readonly config;
    private readonly hre;
    private readonly artifactBuilder;
    private readonly rustBuilder;
    constructor(config: FluentConfig, hre: HardhatRuntimeEnvironment);
    compile(options?: CompileOptions): Promise<CompileResult[]>;
    private compileContract;
    private getInterfaceABI;
    private getBytecode;
    clean(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map