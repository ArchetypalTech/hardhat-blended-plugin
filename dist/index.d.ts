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
export {};
//# sourceMappingURL=index.d.ts.map