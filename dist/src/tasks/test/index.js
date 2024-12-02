"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const tester_1 = require("../../internal/tester");
const logger_1 = require("../../utils/logger");
const mocha_1 = __importDefault(require("mocha"));
const TASK_TEST_RUST = 'test:rust';
const logger = new logger_1.Logger({ showTimestamp: true });
(0, config_1.task)(TASK_TEST_RUST, 'Runs Rust contract tests').setAction(async (_, hre) => {
    const tester = new tester_1.RustTester(hre.config.fluent, hre);
    const mocha = new mocha_1.default(Object.assign(Object.assign({}, hre.config.mocha), { color: true }));
    logger.title('Running Rust contract tests...');
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const results = await tester.runTests();
                const rootSuite = mocha_1.default.Suite.create(mocha.suite, 'Rust Contracts');
                for (const result of results) {
                    const contractSuite = mocha_1.default.Suite.create(rootSuite, `Contract: ${result.contractPath}`);
                    result.tests.forEach((test) => {
                        const testCase = new mocha_1.default.Test(test.name, function () {
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
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (error) {
                logger.error('Test execution failed.', { error });
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        })();
    });
});
(0, config_1.task)(task_names_1.TASK_TEST)
    .addFlag('skipWasmTests', 'Skip Rust contract tests')
    .addFlag('skipSolidityTests', 'Skip Solidity tests')
    .setAction(async (args, hre, runSuper) => {
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
    }
    catch (error) {
        logger.error('Test execution failed.', { error });
        process.exitCode = 1;
        throw error;
    }
});
//# sourceMappingURL=index.js.map