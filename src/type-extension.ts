import 'hardhat/types/config';
import 'hardhat/types/runtime';

export interface ContractCompileConfig {
  contractDir: string;
  interfacePath: string;
  test?: {
    command?: string;
    flags?: string[];
  };
}

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    compileToWasmConfig?: ContractCompileConfig[];
  }

  interface HardhatConfig {
    compileToWasmConfig: ContractCompileConfig[];
  }
}
