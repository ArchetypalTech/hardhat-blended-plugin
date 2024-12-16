"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const schema_1 = require("../../src/config/schema");
const defaults_1 = require("../../src/config/defaults");
const sinon = __importStar(require("sinon"));
const contracts_resolver_1 = require("../../src/config/contracts-resolver");
describe('FluentConfigSchema', () => {
    let sandbox;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let resolveStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        resolveStub = sandbox.stub(contracts_resolver_1.ContractsResolver.prototype, 'discoverContracts').returns([
            {
                path: 'mock/contract/path',
                interface: {
                    path: 'IMockContract.sol',
                },
            },
        ]);
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('Default Values', () => {
        it('should apply default values for empty config', () => {
            const userConfig = {};
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.compile).to.deep.equal(defaults_1.DEFAULT_SETTINGS.compile);
            (0, chai_1.expect)(config.test).to.deep.equal(defaults_1.DEFAULT_SETTINGS.test);
            (0, chai_1.expect)(config.node).to.deep.equal(defaults_1.DEFAULT_SETTINGS.node);
            (0, chai_1.expect)(config.discovery).to.deep.equal(defaults_1.DEFAULT_SETTINGS.discovery);
            (0, chai_1.expect)(config.env).to.deep.equal(defaults_1.DEFAULT_SETTINGS.env);
            (0, chai_1.expect)(config.contracts).to.have.lengthOf(1);
        });
        it('should merge user values with defaults', () => {
            const userConfig = {
                compile: {
                    target: 'custom-target',
                    debug: true,
                    options: ['--custom-option'],
                },
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.compile.target).to.equal('custom-target');
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (0, chai_1.expect)(config.compile.debug).to.be.true;
            (0, chai_1.expect)(config.compile.options).to.deep.equal(['--custom-option']);
            (0, chai_1.expect)(config.test).to.deep.equal(defaults_1.DEFAULT_SETTINGS.test);
        });
    });
    describe('Contract Configuration', () => {
        it('should process explicitly configured contracts', () => {
            const userConfig = {
                contracts: [
                    {
                        path: 'test/contract/path',
                        interface: {
                            path: 'ITestContract.sol',
                        },
                        compile: {
                            target: 'wasm32-unknown-unknown',
                            debug: false,
                            options: ['--custom-option'],
                        },
                        test: {
                            command: 'cargo test',
                            options: ['--test-option'],
                            timeout: 1000,
                            retries: 0,
                        },
                    },
                ],
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.contracts).to.have.length(1);
            (0, chai_1.expect)(config.contracts[0].compile.options).to.deep.equal(['--custom-option']);
            (0, chai_1.expect)(config.contracts[0].test.options).to.deep.equal(['--test-option']);
        });
        it('should merge contract settings with global settings', () => {
            const userConfig = {
                compile: {
                    target: 'global-target',
                    debug: true,
                    options: ['--global-option'],
                },
                contracts: [
                    {
                        path: 'test/contract/path',
                        interface: {
                            path: 'ITestContract.sol',
                        },
                        compile: {
                            target: 'contract-target',
                            debug: false,
                            options: ['--contract-option'],
                        },
                    },
                    {
                        path: 'test/contract/path2',
                        interface: {
                            path: 'ITestContract2.sol',
                        },
                    },
                ],
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.contracts[0].compile.target).to.equal('contract-target');
            (0, chai_1.expect)(config.contracts[0].compile.options).to.deep.equal(['--contract-option']);
            (0, chai_1.expect)(config.contracts[1].compile.target).to.equal('global-target');
            (0, chai_1.expect)(config.contracts[1].compile.options).to.deep.equal(['--global-option']);
            (0, chai_1.expect)(config.compile.target).to.equal('global-target');
        });
    });
    describe('Discovery Settings', () => {
        it('should throw error when discovery is disabled and no contracts provided', () => {
            const userConfig = {
                discovery: {
                    errorOnContractDiscovery: true,
                    enabled: false,
                    paths: ['contracts', 'src'],
                    ignore: ['**/target/**', '**/node_modules/**'],
                },
                contracts: [], // Empty contracts with disabled discovery
            };
            (0, chai_1.expect)(() => schema_1.FluentConfigSchema.parse(userConfig)).to.throw('No contracts configured and auto-discovery is disabled');
        });
        it('should disable discovery when contracts are provided', () => {
            const userConfig = {
                discovery: {
                    errorOnContractDiscovery: true,
                    enabled: true,
                    paths: ['contracts', 'src'],
                    ignore: ['**/target/**', '**/node_modules/**'],
                },
                contracts: [
                    {
                        path: 'test/contract',
                        interface: { path: 'test/interface' },
                    },
                ],
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (0, chai_1.expect)(config.discovery.enabled).to.be.false;
            (0, chai_1.expect)(config.contracts).to.have.lengthOf(1);
        });
    });
    describe('Validation', () => {
        it('should validate docker pull policy', () => {
            const userConfig = {
                node: {
                    docker: {
                        image: 'test-image',
                        tag: 'latest',
                        pull: 'invalid',
                    },
                },
            };
            (0, chai_1.expect)(() => schema_1.FluentConfigSchema.parse(userConfig)).to.throw();
        });
        it('should validate required contract fields', () => {
            const userConfig = {
                contracts: [
                    {
                        path: 'test-path',
                        // Missing interface field
                    },
                ],
            };
            (0, chai_1.expect)(() => schema_1.FluentConfigSchema.parse(userConfig)).to.throw();
        });
    });
    describe('Environment Variables', () => {
        it('should merge environment variables', () => {
            const userConfig = {
                env: {
                    CUSTOM_VAR: 'custom-value',
                },
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.env).to.deep.include({
                RUST_LOG: 'info',
                CUSTOM_VAR: 'custom-value',
            });
        });
        it('should allow overriding default env variables', () => {
            const userConfig = {
                env: {
                    RUST_LOG: 'debug',
                    CUSTOM_VAR: 'custom-value',
                },
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.env).to.deep.equal({
                RUST_LOG: 'debug',
                CUSTOM_VAR: 'custom-value',
            });
        });
    });
});
//# sourceMappingURL=schema.test.js.map