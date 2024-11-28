import { extendConfig } from 'hardhat/config';
import { HardhatConfig, HardhatUserConfig } from 'hardhat/types';
import { FluentConfigSchema } from './config/schema';
import './type-extensions';
import './tasks';

// Extend Hardhat's config with Fluent plugin configuration
extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  // Parse and validate config using Zod schema
  const fluentConfig = FluentConfigSchema.parse(userConfig.fluent || {});

  // Assign the parsed and validated configuration
  config.fluent = fluentConfig;
});

// Re-export configuration types and utilities
export * from './config';
