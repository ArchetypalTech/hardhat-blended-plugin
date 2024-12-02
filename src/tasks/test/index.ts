import { task } from 'hardhat/config';
import { TASK_TEST } from 'hardhat/builtin-tasks/task-names';
import { RustTester } from '../../internal/tester';
import { Logger } from '../../utils/logger';
import Mocha from 'mocha';

const TASK_TEST_RUST = 'test:rust';
interface TestTaskArgs {
  skipWasmTests?: boolean;
  skipSolidityTests?: boolean;
}

interface MochaContext {
  skip(): void;
  timeout(n: number): void;
}

const logger = new Logger({ showTimestamp: true });

task(TASK_TEST_RUST, 'Runs Rust contract tests').setAction(async (_, hre) => {
  const tester = new RustTester(hre.config.fluent, hre);
  const mocha = new Mocha({ ...hre.config.mocha, color: true });

  logger.title('Running Rust contract tests...');

  return new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        const results = await tester.runTests();
        const rootSuite = Mocha.Suite.create(mocha.suite, 'Rust Contracts');

        for (const result of results) {
          const contractSuite = Mocha.Suite.create(rootSuite, `Contract: ${result.contractPath}`);

          result.tests.forEach((test) => {
            const testCase = new Mocha.Test(test.name, function (this: MochaContext) {
              switch (test.status) {
                case 'failed':
                  throw new Error(test.error || 'Test failed');
                case 'ignored':
                  this.skip();
                  break;
                case 'passed':
                  break;
              }
            });

            const duration = parseInt(test.duration) || 0;
            Object.defineProperty(testCase, 'duration', {
              value: duration,
              writable: true,
              enumerable: true,
            });

            contractSuite.addTest(testCase);
          });

          Object.defineProperty(contractSuite, 'duration', {
            value: parseInt(result.totalDuration) || 0,
            writable: true,
            enumerable: true,
          });
        }

        mocha.run((failures) => {
          if (failures) {
            reject(new Error(`${failures} test(s) failed`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        logger.error('Test execution failed.', { error });
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    })();
  });
});

task(TASK_TEST)
  .addFlag('skipWasmTests', 'Skip Rust contract tests')
  .addFlag('skipSolidityTests', 'Skip Solidity tests')
  .setAction(async (args: TestTaskArgs, hre, runSuper) => {
    const { skipWasmTests = false, skipSolidityTests = false } = args;

    if (skipWasmTests && skipSolidityTests) {
      logger.warn('Both Rust and Solidity tests are skipped');
      return;
    }

    try {
      const testFiles = await hre.run('test:get-test-files');

      if (!skipSolidityTests && testFiles.length > 0) {
        logger.info('Running Solidity tests...');
        await runSuper(args);
      }

      if (!skipWasmTests) {
        logger.info('Running Rust tests...');
        await hre.run(TASK_TEST_RUST);
      }

      if (skipSolidityTests || testFiles.length === 0) {
        logger.info('No Solidity tests to run');
      }
    } catch (error) {
      logger.error('Test execution failed.', { error });
      process.exitCode = 1;
      throw error;
    }
  });
