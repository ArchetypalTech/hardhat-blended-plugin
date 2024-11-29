// config/schema.ts
import { z } from 'zod';
import { DEFAULT_SETTINGS } from './defaults';
import { ContractsResolver } from './contracts-resolver';

// Base schemas with required fields
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

// User input schemas (partial)
const UserCompileSettingsSchema = CompileSettingsSchema.partial();
const UserTestSettingsSchema = TestSettingsSchema.partial();
const UserNodeSettingsSchema = NodeSettingsSchema.deepPartial();

const UserContractConfigSchema = z.object({
  path: z.string(),
  interface: z.object({
    path: z.string(),
  }),
  compile: UserCompileSettingsSchema.optional(),
  test: UserTestSettingsSchema.optional(),
});

const ContractConfigSchema = z.object({
  path: z.string(),
  interface: z.object({
    path: z.string(),
  }),
  compile: CompileSettingsSchema,
  test: TestSettingsSchema,
});

// User config with automatic discovery disabling
const UserConfigSchema = z
  .object({
    compile: UserCompileSettingsSchema.optional(),
    test: UserTestSettingsSchema.optional(),
    node: UserNodeSettingsSchema.optional(),
    env: z.record(z.string()).optional(),
    contracts: z.array(UserContractConfigSchema).optional(),
    discovery: z
      .object({
        enabled: z.boolean().optional(),
        paths: z.array(z.string()).optional(),
        ignore: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contracts?.length) {
      if (!data.discovery) {
        data.discovery = { enabled: false };
      } else {
        data.discovery.enabled = false;
      }
    }
  });

export const FluentConfigSchema = UserConfigSchema.transform((config) => {
  const baseConfig = {
    ...DEFAULT_SETTINGS,
    ...config,
    compile: {
      ...DEFAULT_SETTINGS.compile,
      ...(config.compile || {}),
    },
    test: {
      ...DEFAULT_SETTINGS.test,
      ...(config.test || {}),
    },
    node: {
      docker: {
        ...DEFAULT_SETTINGS.node.docker,
        ...(config.node?.docker || {}),
      },
      network: {
        ...DEFAULT_SETTINGS.node.network,
        ...(config.node?.network || {}),
      },
    },
    env: {
      ...DEFAULT_SETTINGS.env,
      ...(config.env || {}),
    },
    discovery: {
      ...DEFAULT_SETTINGS.discovery,
      ...(config.discovery || {}),
    },
  };

  const resolver = new ContractsResolver();
  const contracts = resolver.resolve(config, baseConfig.compile, baseConfig.test);

  return {
    ...baseConfig,
    contracts,
  };
}).pipe(
  z.object({
    compile: CompileSettingsSchema,
    test: TestSettingsSchema,
    node: NodeSettingsSchema,
    env: z.record(z.string()),
    discovery: z.object({
      enabled: z.boolean(),
      paths: z.array(z.string()),
      ignore: z.array(z.string()),
    }),
    contracts: z.array(ContractConfigSchema),
  }),
);

export type UserConfig = z.infer<typeof UserConfigSchema>;
export type UserContractConfig = z.infer<typeof UserContractConfigSchema>;
export type CompileSettings = z.infer<typeof CompileSettingsSchema>;
export type TestSettings = z.infer<typeof TestSettingsSchema>;
export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
export type ContractConfig = z.infer<typeof ContractConfigSchema>;
export type FluentConfig = z.output<typeof FluentConfigSchema>;
