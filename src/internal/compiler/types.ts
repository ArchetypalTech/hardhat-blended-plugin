import { BuildInfo, Artifact } from 'hardhat/types';

export interface CompileResult {
  contractName: string;
  success: boolean;
  output?: string;
  error?: string;
}

export interface CompileOptions {
  force?: boolean;
  quiet?: boolean;
  verbose?: boolean;
}

export interface RustBuildInfo extends BuildInfo {
  rustSettings: {
    target: string;
    debug: boolean;
    options: string[];
  };
}

export interface FluentArtifact extends Artifact {
  interfaceName: string;
  interfacePath: string;
}
