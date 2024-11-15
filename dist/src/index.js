"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-ethers");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = require("fs-extra");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const config_1 = require("hardhat/config");
const path_1 = __importDefault(require("path"));
const compiler_1 = require("./compiler");
const tester_1 = require("./tester");
require("./type-extension");
const utils_1 = require("./utils");
const WASM_ARTIFACT_FORMAT = 'hh-wasm-artifact-1';
async function ensureInterfaceCompiled(interfacePath, hre) {
    const artifactPath = path_1.default.join(hre.config.paths.artifacts, interfacePath, `${path_1.default.basename(interfacePath, '.sol')}.json`);
    if (!fs_1.default.existsSync(artifactPath)) {
        // Trigger Solidity compilation if artifact doesn't exist
        await hre.run('compile:solidity');
        // Verify the artifact was created
        if (!fs_1.default.existsSync(artifactPath)) {
            throw new Error(`Interface compilation failed - artifact not found at ${artifactPath}`);
        }
    }
}
async function compileContract(cfg, hre) {
    await ensureInterfaceCompiled(cfg.interfacePath, hre);
    const interfaceArtifact = (0, utils_1.getInterfaceArtifact)(cfg.interfacePath, hre.config.paths.artifacts);
    const contractPath = cfg.contractDir;
    const lastPart = path_1.default.basename(contractPath);
    const wasmName = `${lastPart.replace(/-/g, '_')}.wasm`;
    const artifactDir = path_1.default.join(path_1.default.dirname(contractPath), wasmName);
    console.log('artifactDir', artifactDir);
    const outputDir = path_1.default.join(hre.config.paths.artifacts, artifactDir);
    const bytecode = (0, compiler_1.compileAndGetBytecode)(path_1.default.join(hre.config.paths.root, cfg.contractDir));
    const artifact = {
        format: WASM_ARTIFACT_FORMAT,
        contractName: wasmName,
        sourceName: artifactDir,
        interfaceName: cfg.interfacePath,
        abi: interfaceArtifact.abi,
        bytecode,
        deployedBytecode: bytecode,
        linkReferences: {},
        deployedLinkReferences: {},
    };
    (0, fs_extra_1.ensureDirSync)(outputDir);
    const artifactPath = path_1.default.join(outputDir, `${wasmName}.json`);
    fs_1.default.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
    console.log(`Compiled Rust contract: ${wasmName}`);
}
(0, config_1.extendConfig)((config, userConfig) => {
    var _a, _b;
    config.compileToWasmConfig =
        (_b = (_a = userConfig.compileToWasmConfig) === null || _a === void 0 ? void 0 : _a.map((cfg) => {
            var _a, _b;
            return ({
                contractDir: cfg.contractDir,
                interfacePath: cfg.interfacePath,
                test: {
                    command: ((_a = cfg.test) === null || _a === void 0 ? void 0 : _a.command) || 'cargo test',
                    flags: ((_b = cfg.test) === null || _b === void 0 ? void 0 : _b.flags) || [],
                },
            });
        })) !== null && _b !== void 0 ? _b : [];
});
// Compile Rust contracts to WASM
(0, config_1.subtask)('compile:rust', 'Compiles Rust contracts to WASM').setAction(async (_, hre) => {
    console.log(chalk_1.default.cyan.bold('\nCompiling Rust contracts'));
    const contracts = hre.config.compileToWasmConfig;
    if (contracts.length === 0) {
        console.log(chalk_1.default.yellow('No Rust contracts to compile'));
        return;
    }
    for (const cfg of contracts) {
        try {
            await compileContract(cfg, hre);
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nFailed to compile ${path_1.default.basename(cfg.contractDir)}:`));
            console.error(chalk_1.default.red(`  ${error.message}`));
            throw error;
        }
    }
    console.log(chalk_1.default.green.bold('\n✨ All contracts compiled successfully'));
});
// Override main compile task to include WASM compilation
(0, config_1.task)(task_names_1.TASK_COMPILE, 'Compiles the entire project, building Solidity first, then Rust').setAction(async (_, hre, runSuper) => {
    // First compile Solidity contracts (as usual)
    await runSuper();
    // Then compile Rust contracts
    await hre.run('compile:rust');
});
// Rust test subtask
(0, config_1.subtask)('test:rust', 'Runs Rust contract tests').setAction(async (_, hre) => {
    const contracts = hre.config.compileToWasmConfig;
    if (contracts.length === 0) {
        return true;
    }
    const Mocha = require('mocha');
    const mocha = new Mocha(Object.assign(Object.assign({}, hre.config.mocha), { color: true }));
    return new Promise((resolve, reject) => {
        const contractsToTest = contracts.map((cfg) => (Object.assign(Object.assign({}, cfg), { contractDir: path_1.default.resolve(hre.config.paths.root, cfg.contractDir) })));
        // Create test suites for each Rust contract
        (async () => {
            try {
                await Promise.all(contractsToTest.map(async (contract) => {
                    const suite = Mocha.Suite.create(mocha.suite, `Rust Contract: ${path_1.default.basename(contract.contractDir)}`);
                    const result = await (0, tester_1.runContractTests)(contract);
                    // Create individual test cases for each Rust test
                    result.tests.forEach((test) => {
                        const testFn = function () {
                            if (test.result === 'failed') {
                                throw new Error(test.error || 'Test failed');
                            }
                            if (test.result === 'ignored') {
                                this.skip();
                            }
                        };
                        suite.addTest(new Mocha.Test(test.name, testFn));
                    });
                }));
                // Run all test suites
                mocha.run((failures) => {
                    if (failures) {
                        reject(new Error('Rust tests failed'));
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        })();
    });
});
// Main test task
(0, config_1.task)(task_names_1.TASK_TEST)
    .addFlag('skipWasmTests', 'Skip Rust contract tests')
    .addFlag('skipSolidityTests', 'Skip Solidity tests')
    .setAction(async (args, hre, runSuper) => {
    if (args.skipWasmTests && args.skipSolidityTests) {
        console.log(chalk_1.default.yellow('Both Rust and Solidity tests are skipped'));
        return;
    }
    try {
        // Get all test files
        const testFiles = await hre.run('test:get-test-files');
        // Run regular tests only if there are test files and not skipped
        if (!args.skipSolidityTests && testFiles.length > 0) {
            await runSuper(args);
        }
        // Run Rust tests if not skipped
        if (!args.skipWasmTests) {
            await hre.run('test:rust');
        }
        // If we're skipping Solidity tests or there are no test files,
        // and we only ran Rust tests, we don't need to show empty stats
        if (args.skipSolidityTests || testFiles.length === 0) {
            return;
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('\nTest execution failed:'));
        console.error(chalk_1.default.red(`  ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map