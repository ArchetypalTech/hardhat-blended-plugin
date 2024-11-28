import { expect } from "chai";
import { FluentConfigSchema, UserConfig } from "../../src/config/schema";
import { DEFAULT_SETTINGS } from "../../src/config/defaults";
import * as sinon from "sinon";
import { ContractsResolver } from "../../src/config/contracts-resolver";

describe("FluentConfigSchema", () => {
  let sandbox: sinon.SinonSandbox;
  let resolveStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // Create a stub that returns mock contracts
    resolveStub = sandbox.stub(ContractsResolver.prototype, 'resolve').returns([{
      path: "mock/contract/path",
      interface: {
        path: "IMockContract.sol",
      },
      compile: DEFAULT_SETTINGS.compile,
      test: DEFAULT_SETTINGS.test,
    }]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Default Values", () => {
    it("should apply default values for empty config", () => {
      const userConfig = {};
      const config = FluentConfigSchema.parse(userConfig);

      expect(config.compile).to.deep.equal(DEFAULT_SETTINGS.compile);
      expect(config.test).to.deep.equal(DEFAULT_SETTINGS.test);
      expect(config.node).to.deep.equal(DEFAULT_SETTINGS.node);
      expect(config.discovery).to.deep.equal(DEFAULT_SETTINGS.discovery);
      expect(config.env).to.deep.equal(DEFAULT_SETTINGS.env);
      expect(config.contracts).to.have.lengthOf(1);
    });

    it("should merge user values with defaults", () => {
      const userConfig: UserConfig = {
        compile: {
          target: "custom-target",
          debug: true,
          options: ["--custom-option"],
        },
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.compile.target).to.equal("custom-target");
      expect(config.compile.debug).to.be.true;
      expect(config.compile.options).to.include("--custom-option");
      expect(config.test).to.deep.equal(DEFAULT_SETTINGS.test);
    });
  });

  describe("Contract Configuration", () => {
    it("should process explicitly configured contracts", () => {
      const userConfig: UserConfig = {
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

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.contracts).to.have.length(1);
      expect(config.contracts[0].compile.options).to.include("--custom-option");
      expect(config.contracts[0].test.options).to.include("--test-option");
    });

    it("should merge contract settings with global settings", () => {
      const userConfig: UserConfig = {
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
          test: DEFAULT_SETTINGS.test,
        },
        {
          path: "test/contract/path2",
          interface: {
            path: "ITestContract2.sol",
          }
        }
      ],
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.contracts[0].compile.target).to.equal("contract-target");
      expect(config.contracts[0].compile.options).to.include("--contract-option");
      expect(config.contracts[1].compile.target).to.equal("global-target");
      expect(config.compile.target).to.equal("global-target");

    });
  });

  describe("Discovery Settings", () => {
    it("should handle disabled discovery", () => {
      const userConfig: UserConfig = {
        discovery: {
          enabled: false,
        },
        contracts: [], // Empty contracts with disabled discovery
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.discovery.enabled).to.be.false;
      expect(config.contracts).to.be.an('array').that.is.empty;
    });

    it("should merge discovery settings", () => {
      const userConfig: UserConfig = {
        discovery: {
          paths: ["custom-path"],
        },
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.discovery.enabled).to.be.true;
      expect(config.discovery.paths).to.include("custom-path");
      expect(config.discovery.ignore).to.deep.equal(DEFAULT_SETTINGS.discovery.ignore);
    });
  });

  describe("Validation", () => {
    it("should validate docker pull policy", () => {
      const userConfig: UserConfig = {
        node: {
          docker: {
            image: "test-image",
            tag: "latest",
            pull: "invalid" as any,
          },
          network: DEFAULT_SETTINGS.node.network,
        },
      };

      expect(() => FluentConfigSchema.parse(userConfig)).to.throw();
    });

    it("should validate required contract fields", () => {
      const userConfig: UserConfig = {
        contracts: [{
          path: "test-path",
          // Missing interface field
        } as any],
      };

      expect(() => FluentConfigSchema.parse(userConfig)).to.throw();
    });
  });

  describe("Environment Variables", () => {
    it("should merge environment variables", () => {
      const userConfig: UserConfig = {
        env: {
          CUSTOM_VAR: "custom-value",
        },
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.env).to.include(DEFAULT_SETTINGS.env);
      expect(config.env.CUSTOM_VAR).to.equal("custom-value");
    });
  });
});
