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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const schema_1 = require("../../src/config/schema");
const defaults_1 = require("../../src/config/defaults");
const sinon = __importStar(require("sinon"));
const contracts_resolver_1 = require("../../src/config/contracts-resolver");
describe("FluentConfigSchema", () => {
    let sandbox;
    let resolveStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Create a stub that returns mock contracts
        resolveStub = sandbox.stub(contracts_resolver_1.ContractsResolver.prototype, 'resolve').returns([{
                path: "mock/contract/path",
                interface: {
                    path: "IMockContract.sol",
                },
                compile: defaults_1.DEFAULT_SETTINGS.compile,
                test: defaults_1.DEFAULT_SETTINGS.test,
            }]);
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe("Default Values", () => {
        it("should apply default values for empty config", () => {
            const userConfig = {};
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.compile).to.deep.equal(defaults_1.DEFAULT_SETTINGS.compile);
            (0, chai_1.expect)(config.test).to.deep.equal(defaults_1.DEFAULT_SETTINGS.test);
            (0, chai_1.expect)(config.node).to.deep.equal(defaults_1.DEFAULT_SETTINGS.node);
            (0, chai_1.expect)(config.discovery).to.deep.equal(defaults_1.DEFAULT_SETTINGS.discovery);
            (0, chai_1.expect)(config.env).to.deep.equal(defaults_1.DEFAULT_SETTINGS.env);
            (0, chai_1.expect)(config.contracts).to.have.lengthOf(1);
        });
        it("should merge user values with defaults", () => {
            const userConfig = {
                compile: {
                    target: "custom-target",
                    debug: true,
                    options: ["--custom-option"],
                },
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.compile.target).to.equal("custom-target");
            (0, chai_1.expect)(config.compile.debug).to.be.true;
            (0, chai_1.expect)(config.compile.options).to.include("--custom-option");
            (0, chai_1.expect)(config.test).to.deep.equal(defaults_1.DEFAULT_SETTINGS.test);
        });
    });
    describe("Contract Configuration", () => {
        it("should process explicitly configured contracts", () => {
            const userConfig = {
                discovery: { enabled: false },
                contracts: [{
                        path: "test/contract/path",
                        interface: {
                            path: "ITestContract.sol",
                        },
                        compile: {
                            target: "wasm32-unknown-unknown",
                            debug: false,
                            options: ["--custom-option"],
                        },
                        test: {
                            command: "cargo test",
                            options: ["--test-option"],
                            timeout: 1000,
                            retries: 0,
                        },
                    }],
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.contracts).to.have.length(1);
            (0, chai_1.expect)(config.contracts[0].compile.options).to.include("--custom-option");
            (0, chai_1.expect)(config.contracts[0].test.options).to.include("--test-option");
        });
        it("should merge contract settings with global settings", () => {
            const userConfig = {
                compile: {
                    target: "global-target",
                    debug: true,
                    options: ["--global-option"],
                },
                contracts: [{
                        path: "test/contract/path",
                        interface: {
                            path: "ITestContract.sol",
                        },
                        compile: {
                            target: "contract-target",
                            debug: false,
                            options: ["--contract-option"],
                        },
                        test: defaults_1.DEFAULT_SETTINGS.test,
                    },
                    {
                        path: "test/contract/path2",
                        interface: {
                            path: "ITestContract2.sol",
                        }
                    }
                ],
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.contracts[0].compile.target).to.equal("contract-target");
            (0, chai_1.expect)(config.contracts[0].compile.options).to.include("--contract-option");
            (0, chai_1.expect)(config.contracts[1].compile.target).to.equal("global-target");
            (0, chai_1.expect)(config.compile.target).to.equal("global-target");
        });
    });
    describe("Discovery Settings", () => {
        it("should handle disabled discovery", () => {
            const userConfig = {
                discovery: {
                    enabled: false,
                },
                contracts: [], // Empty contracts with disabled discovery
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.discovery.enabled).to.be.false;
            (0, chai_1.expect)(config.contracts).to.be.an('array').that.is.empty;
        });
        it("should merge discovery settings", () => {
            const userConfig = {
                discovery: {
                    paths: ["custom-path"],
                },
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.discovery.enabled).to.be.true;
            (0, chai_1.expect)(config.discovery.paths).to.include("custom-path");
            (0, chai_1.expect)(config.discovery.ignore).to.deep.equal(defaults_1.DEFAULT_SETTINGS.discovery.ignore);
        });
    });
    describe("Validation", () => {
        it("should validate docker pull policy", () => {
            const userConfig = {
                node: {
                    docker: {
                        image: "test-image",
                        tag: "latest",
                        pull: "invalid",
                    },
                    network: defaults_1.DEFAULT_SETTINGS.node.network,
                },
            };
            (0, chai_1.expect)(() => schema_1.FluentConfigSchema.parse(userConfig)).to.throw();
        });
        it("should validate required contract fields", () => {
            const userConfig = {
                contracts: [{
                        path: "test-path",
                        // Missing interface field
                    }],
            };
            (0, chai_1.expect)(() => schema_1.FluentConfigSchema.parse(userConfig)).to.throw();
        });
    });
    describe("Environment Variables", () => {
        it("should merge environment variables", () => {
            const userConfig = {
                env: {
                    CUSTOM_VAR: "custom-value",
                },
            };
            const config = schema_1.FluentConfigSchema.parse(userConfig);
            (0, chai_1.expect)(config.env).to.include(defaults_1.DEFAULT_SETTINGS.env);
            (0, chai_1.expect)(config.env.CUSTOM_VAR).to.equal("custom-value");
        });
    });
});
//# sourceMappingURL=schema.test.js.map