import { expect } from 'chai';
import { FluentConfigSchema, UserConfig } from '../../src/config/schema';
import { DEFAULT_SETTINGS } from '../../src/config/defaults';
import * as sinon from 'sinon';
import { ContractsResolver } from '../../src/config/contracts-resolver';

describe('FluentConfigSchema', () => {
  let sandbox: sinon.SinonSandbox;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let resolveStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    resolveStub = sandbox.stub(ContractsResolver.prototype, 'discoverContracts').returns([
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
      const config = FluentConfigSchema.parse(userConfig);

      expect(config.compile).to.deep.equal(DEFAULT_SETTINGS.compile);
      expect(config.test).to.deep.equal(DEFAULT_SETTINGS.test);
      expect(config.node).to.deep.equal(DEFAULT_SETTINGS.node);
      expect(config.discovery).to.deep.equal(DEFAULT_SETTINGS.discovery);
      expect(config.env).to.deep.equal(DEFAULT_SETTINGS.env);
      expect(config.contracts).to.have.lengthOf(1);
    });

    it('should merge user values with defaults', () => {
      const userConfig: UserConfig = {
        compile: {
          target: 'custom-target',
          debug: true,
          options: ['--custom-option'],
        },
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.compile.target).to.equal('custom-target');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(config.compile.debug).to.be.true;
      expect(config.compile.options).to.deep.equal(['--custom-option']);
      expect(config.test).to.deep.equal(DEFAULT_SETTINGS.test);
    });
  });

  describe('Contract Configuration', () => {
    it('should process explicitly configured contracts', () => {
      const userConfig: UserConfig = {
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

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.contracts).to.have.length(1);
      expect(config.contracts[0].compile.options).to.deep.equal(['--custom-option']);
      expect(config.contracts[0].test.options).to.deep.equal(['--test-option']);
    });

    it('should merge contract settings with global settings', () => {
      const userConfig: UserConfig = {
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

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.contracts[0].compile.target).to.equal('contract-target');
      expect(config.contracts[0].compile.options).to.deep.equal(['--contract-option']);
      expect(config.contracts[1].compile.target).to.equal('global-target');
      expect(config.contracts[1].compile.options).to.deep.equal(['--global-option']);
      expect(config.compile.target).to.equal('global-target');
    });
  });

  describe('Discovery Settings', () => {
    it('should throw error when discovery is disabled and no contracts provided', () => {
      const userConfig: UserConfig = {
        discovery: {
          enabled: false,
          paths: ['contracts', 'src'],
          ignore: ['**/target/**', '**/node_modules/**'],
        },
        contracts: [], // Empty contracts with disabled discovery
      };

      expect(() => FluentConfigSchema.parse(userConfig)).to.throw(
        'No contracts configured and auto-discovery is disabled',
      );
    });

    it('should disable discovery when contracts are provided', () => {
      const userConfig: UserConfig = {
        discovery: {
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

      const config = FluentConfigSchema.parse(userConfig);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(config.discovery.enabled).to.be.false;
      expect(config.contracts).to.have.lengthOf(1);
    });
  });

  describe('Validation', () => {
    it('should validate docker pull policy', () => {
      const userConfig: UserConfig = {
        node: {
          docker: {
            image: 'test-image',
            tag: 'latest',
            pull: 'invalid' as any,
          },
        },
      };

      expect(() => FluentConfigSchema.parse(userConfig)).to.throw();
    });

    it('should validate required contract fields', () => {
      const userConfig: UserConfig = {
        contracts: [
          {
            path: 'test-path',
            // Missing interface field
          } as any,
        ],
      };

      expect(() => FluentConfigSchema.parse(userConfig)).to.throw();
    });
  });

  describe('Environment Variables', () => {
    it('should merge environment variables', () => {
      const userConfig: UserConfig = {
        env: {
          CUSTOM_VAR: 'custom-value',
        },
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.env).to.deep.include({
        RUST_LOG: 'info',
        CUSTOM_VAR: 'custom-value',
      });
    });

    it('should allow overriding default env variables', () => {
      const userConfig: UserConfig = {
        env: {
          RUST_LOG: 'debug',
          CUSTOM_VAR: 'custom-value',
        },
      };

      const config = FluentConfigSchema.parse(userConfig);

      expect(config.env).to.deep.equal({
        RUST_LOG: 'debug',
        CUSTOM_VAR: 'custom-value',
      });
    });
  });
});
