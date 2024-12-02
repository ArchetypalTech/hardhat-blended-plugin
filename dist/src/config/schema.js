"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentConfigSchema = void 0;
const zod_1 = require("zod");
const defaults_1 = require("./defaults");
const contracts_resolver_1 = require("./contracts-resolver");
// Base schemas with required fields
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
const ContractConfigSchema = zod_1.z.object({
    path: zod_1.z.string(),
    interface: zod_1.z.object({
        path: zod_1.z.string(),
    }),
    compile: CompileSettingsSchema,
    test: TestSettingsSchema,
});
exports.FluentConfigSchema = zod_1.z
    .object({
    compile: CompileSettingsSchema.partial().optional(),
    test: TestSettingsSchema.partial().optional(),
    node: NodeSettingsSchema.deepPartial().optional(),
    env: zod_1.z.record(zod_1.z.string()).optional(),
    contracts: zod_1.z
        .array(zod_1.z.object({
        path: zod_1.z.string(),
        interface: zod_1.z.object({
            path: zod_1.z.string(),
        }),
        compile: CompileSettingsSchema.partial().optional(),
        test: TestSettingsSchema.partial().optional(),
    }))
        .optional(),
    discovery: zod_1.z
        .object({
        enabled: zod_1.z.boolean(),
        paths: zod_1.z.array(zod_1.z.string()),
        ignore: zod_1.z.array(zod_1.z.string()),
    })
        .optional(),
})
    .transform((config) => {
    var _a, _b;
    if ((_a = config.contracts) === null || _a === void 0 ? void 0 : _a.length) {
        return Object.assign(Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS), config), { env: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.env), (config.env || {})), discovery: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.discovery), { enabled: false, ignore: [], paths: [] }), contracts: config.contracts.map((contract) => ({
                path: contract.path,
                interface: contract.interface,
                compile: Object.assign(Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.compile), (config.compile || {})), (contract.compile || {})),
                test: Object.assign(Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.test), (config.test || {})), (contract.test || {})),
            })) });
    }
    if (((_b = config.discovery) === null || _b === void 0 ? void 0 : _b.enabled) !== false) {
        const resolver = new contracts_resolver_1.ContractsResolver();
        const discoveredContracts = resolver.discoverContracts({
            discovery: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.discovery), (config.discovery || {})),
        });
        return Object.assign(Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS), config), { env: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.env), (config.env || {})), contracts: discoveredContracts.map((contract) => (Object.assign(Object.assign({}, contract), { compile: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.compile), (config.compile || {})), test: Object.assign(Object.assign({}, defaults_1.DEFAULT_SETTINGS.test), (config.test || {})) }))) });
    }
    throw new Error('No contracts configured and auto-discovery is disabled');
})
    .pipe(zod_1.z.object({
    compile: CompileSettingsSchema,
    test: TestSettingsSchema,
    node: NodeSettingsSchema,
    env: zod_1.z.record(zod_1.z.string()),
    discovery: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        paths: zod_1.z.array(zod_1.z.string()),
        ignore: zod_1.z.array(zod_1.z.string()),
    }),
    contracts: zod_1.z.array(ContractConfigSchema),
}));
//# sourceMappingURL=schema.js.map