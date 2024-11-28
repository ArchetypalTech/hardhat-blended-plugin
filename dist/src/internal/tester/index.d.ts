import { FluentConfig } from '../../config/schema';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
interface RustTest {
    name: string;
    status: 'passed' | 'failed' | 'ignored';
    duration: string;
    error?: string;
}
interface TestResult {
    contractPath: string;
    tests: RustTest[];
    totalDuration: string;
    success: boolean;
}
export declare class RustTester {
    private readonly config;
    private hre;
    private contracts;
    constructor(config: FluentConfig, hre: HardhatRuntimeEnvironment);
    runTests(): Promise<TestResult[]>;
    private runContractTests;
    private parseTestOutput;
    private ensureCargoInstalled;
}
export {};
//# sourceMappingURL=index.d.ts.map