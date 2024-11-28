import { z } from 'zod';
import { DEFAULT_SETTINGS } from './defaults';
import { ContractsResolver } from './contracts-resolver';

const CompileSettingsSchema = z.object({
  target: z.string(),
  debug: z.boolean(),
  options: z.array(z.string()),
});

const TestSettingsSchema = z.object({
  command: z.string(),
  options: z.array(z.string()),
  timeout: z.number(),
  retries: z.number(),
});

const NodeSettingsSchema = z.object({
  docker: z.object({
    image: z.string(),
    tag: z.string(),
    pull: z.enum(['always', 'if-not-present', 'never']),
  }),
  network: z.object({
    chain: z.string(),
    dataDir: z.string(),
    blockTime: z.string(),
    port: z.number(),
    httpPort: z.number(),
  }),
});

const ContractConfigSchema = z.object({
  path: z.string(),
  interface: z.object({
    name: z.string(),
    path: z.string(),
  }),
  compile: CompileSettingsSchema,
  test: TestSettingsSchema,
});

// User config, all settings are optional - we will use UserConfig to enrich DEFAULT_SETTINGS
const UserConfigSchema = z.object({
  compile: CompileSettingsSchema.optional(),
  test: TestSettingsSchema.optional(),
  node: NodeSettingsSchema.optional(),
  env: z.record(z.string()).optional(),
  contracts: z.array(ContractConfigSchema).optional(),
  discovery: z
    .object({
      enabled: z.boolean().optional(),
      paths: z.array(z.string()).optional(),
      ignore: z.array(z.string()).optional(),
    })
    .optional(),
});

export const FluentConfigSchema = UserConfigSchema.transform((config) => {
  const baseConfig = {
    ...DEFAULT_SETTINGS,
    ...config,
    discovery: {
      ...DEFAULT_SETTINGS.discovery,
      ...config.discovery,
    },
  };

  const resolver = new ContractsResolver();
  let contracts: z.infer<typeof ContractConfigSchema>[] = [];

  // If contracts are provided, use them
  if (config.contracts && config.contracts.length > 0) {
    contracts = config.contracts;
  }
  // Otherwise, try to discover contracts
  else if (baseConfig.discovery.enabled !== false) {
    contracts = resolver.resolve(baseConfig);
  }

  // Merge contract settings with base settings
  const processedContracts = contracts.map((contract) => ({
    ...contract,
    compile: {
      ...baseConfig.compile,
      ...contract.compile,
    },
    test: {
      ...baseConfig.test,
      ...contract.test,
    },
  }));

  return {
    ...baseConfig,
    contracts: processedContracts,
  };
});

export type UserConfig = z.infer<typeof UserConfigSchema>;
export type CompileSettings = z.infer<typeof CompileSettingsSchema>;
export type TestSettings = z.infer<typeof TestSettingsSchema>;
export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
export type ContractConfig = z.infer<typeof ContractConfigSchema>;
export type FluentConfig = z.output<typeof FluentConfigSchema>;
