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

const ContractConfigSchema = z.object({
  path: z.string(),
  interface: z.object({
    path: z.string(),
  }),
  compile: CompileSettingsSchema,
  test: TestSettingsSchema,
});

export const FluentConfigSchema = z
  .object({
    compile: CompileSettingsSchema.partial().optional(),
    test: TestSettingsSchema.partial().optional(),
    node: NodeSettingsSchema.deepPartial().optional(),
    env: z.record(z.string()).optional(),
    contracts: z
      .array(
        z.object({
          path: z.string(),
          interface: z.object({
            path: z.string(),
          }),
          compile: CompileSettingsSchema.partial().optional(),
          test: TestSettingsSchema.partial().optional(),
        }),
      )
      .optional(),
    discovery: z
      .object({
        errorOnContractDiscovery: z.boolean(),
        enabled: z.boolean(),
        paths: z.array(z.string()),
        ignore: z.array(z.string()),
      })
      .optional(),
  })
  .transform((config) => {
    if (config.contracts?.length) {
      return {
        ...DEFAULT_SETTINGS,
        ...config,
        env: {
          ...DEFAULT_SETTINGS.env,
          ...(config.env || {}),
        },
        discovery: {
          ...DEFAULT_SETTINGS.discovery,
          errorOnContractDiscovery: false,
          enabled: false,
          ignore: [],
          paths: [],
        },
        contracts: config.contracts.map((contract) => ({
          path: contract.path,
          interface: contract.interface,
          compile: {
            ...DEFAULT_SETTINGS.compile,
            ...(config.compile || {}),
            ...(contract.compile || {}),
          },
          test: {
            ...DEFAULT_SETTINGS.test,
            ...(config.test || {}),
            ...(contract.test || {}),
          },
        })),
      };
    }

    if (config.discovery?.enabled !== false) {
      const resolver = new ContractsResolver();
      // we need to NOT error out when no contracts are in the project
      const discoveredContracts = resolver.discoverContracts({
        discovery: {
          ...DEFAULT_SETTINGS.discovery,
          ...(config.discovery || {}),
          errorOnContractDiscovery: config.discovery?.errorOnContractDiscovery ?? DEFAULT_SETTINGS.discovery.errorOnContractDiscovery,
        },
      });

      return {
        ...DEFAULT_SETTINGS,
        ...config,
        env: {
          ...DEFAULT_SETTINGS.env,
          ...(config.env || {}),
        },
        contracts: discoveredContracts.map((contract) => ({
          ...contract,
          compile: {
            ...DEFAULT_SETTINGS.compile,
            ...(config.compile || {}),
          },
          test: {
            ...DEFAULT_SETTINGS.test,
            ...(config.test || {}),
          },
        })),
      };
    }

    throw new Error('No contracts configured and auto-discovery is disabled');
  })
  .pipe(
    z.object({
      compile: CompileSettingsSchema,
      test: TestSettingsSchema,
      node: NodeSettingsSchema,
      env: z.record(z.string()),
      discovery: z.object({
        errorOnContractDiscovery: z.boolean(),
        enabled: z.boolean(),
        paths: z.array(z.string()),
        ignore: z.array(z.string()),
      }),
      contracts: z.array(ContractConfigSchema),
    }),
  );

export type UserConfig = z.input<typeof FluentConfigSchema>;
export type FluentConfig = z.output<typeof FluentConfigSchema>;
export type ContractConfig = z.infer<typeof ContractConfigSchema>;
export type CompileSettings = z.infer<typeof CompileSettingsSchema>;
export type TestSettings = z.infer<typeof TestSettingsSchema>;
export type NodeSettings = z.infer<typeof NodeSettingsSchema>;
