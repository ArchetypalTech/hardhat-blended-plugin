"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentConfigSchema = void 0;
const zod_1 = require("zod");
const defaults_1 = require("./defaults");
const contracts_resolver_1 = require("./contracts-resolver");
const CompileSettingsSchema = zod_1.z.object({
    target: zod_1.z.string(),
    debug: zod_1.z.boolean(),
    options: zod_1.z.array(zod_1.z.string()),
});
const TestSettingsSchema = zod_1.z.object({
    command: zod_1.z.string(),
    options: zod_1.z.array(zod_1.z.string()),
    timeout: zod_1.z.number(),
    retries: zod_1.z.number(),
});
const NodeSettingsSchema = zod_1.z.object({
    docker: zod_1.z.object({
        image: zod_1.z.string(),
        tag: zod_1.z.string(),
        pull: zod_1.z.enum(['always', 'if-not-present', 'never']),
    }),
    network: zod_1.z.object({
        chain: zod_1.z.string(),
        dataDir: zod_1.z.string(),
        blockTime: zod_1.z.string(),
        port: zod_1.z.number(),
        httpPort: zod_1.z.number(),
    }),
});
const UserContractConfigSchema = zod_1.z.object({
    path: zod_1.z.string(),
    interface: zod_1.z.object({
        path: zod_1.z.string(),
    }),
    compile: CompileSettingsSchema.optional(),
    test: TestSettingsSchema.optional(),
});
const ContractConfigSchema = zod_1.z.object({
    path: zod_1.z.string(),
    interface: zod_1.z.object({
        path: zod_1.z.string(),
    }),
    compile: CompileSettingsSchema,
    test: TestSettingsSchema,
});
// User config, all settings are optional - we will use UserConfig to enrich DEFAULT_SETTINGS
const UserConfigSchema = zod_1.z.object({
    compile: CompileSettingsSchema.optional(),
    test: TestSettingsSchema.optional(),
    node: NodeSettingsSchema.optional(),
    env: zod_1.z.record(zod_1.z.string()).optional(),
    contracts: zod_1.z.array(UserContractConfigSchema).optional(),
    discovery: zod_1.z
        .object({
        enabled: zod_1.z.boolean().optional(),
        paths: zod_1.z.array(zod_1.z.string()).optional(),
        ignore: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
exports.FluentConfigSchema = UserConfigSchema.transform((config) => {
    const baseConfig = Object.assign(Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS), config), { env: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.env), (config.env || {})), discovery: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.discovery), config.discovery) });
    const resolver = new contracts_resolver_1.ContractsResolver();
    let contracts = [];
    if (config.contracts && config.contracts.length > 0) {
        contracts = config.contracts;
    }
    else if (baseConfig.discovery.enabled !== false) {
        contracts = resolver.resolve(baseConfig, baseConfig.compile, baseConfig.test);
    }
    // Process contracts with proper inheritance
    const processedContracts = contracts.map((contract) => (Object.assign(Object.assign({}, contract), { compile: Object.assign(Object.assign({}, baseConfig.compile), contract.compile), test: Object.assign(Object.assign({}, baseConfig.test), contract.test) })));
    return Object.assign(Object.assign({}, baseConfig), { contracts: processedContracts });
});
//# sourceMappingURL=schema.js.map