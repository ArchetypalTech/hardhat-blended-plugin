import '@nomicfoundation/hardhat-ethers';
import chalk from 'chalk';
import fs from 'fs';
import { ensureDirSync } from 'fs-extra';
import { TASK_COMPILE, TASK_TEST } from 'hardhat/builtin-tasks/task-names';
import { extendConfig, subtask, task } from 'hardhat/config';
import { HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig } from 'hardhat/types';
import path from 'path';
import { compileAndGetBytecode } from './compiler';
import { runContractTests } from './tester';
import './type-extension';
import { ContractCompileConfig } from './type-extension';
import { getInterfaceArtifact } from './utils';

const WASM_ARTIFACT_FORMAT = 'hh-wasm-artifact-1';

async function ensureInterfaceCompiled(
  interfacePath: string,
  hre: HardhatRuntimeEnvironment,
): Promise<void> {
  const artifactPath = path.join(
    hre.config.paths.artifacts,
    interfacePath,
    `${path.basename(interfacePath, '.sol')}.json`,
  );

  if (!fs.existsSync(artifactPath)) {
    // Trigger Solidity compilation if artifact doesn't exist
    await hre.run('compile:solidity');

    // Verify the artifact was created
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Interface compilation failed - artifact not found at ${artifactPath}`);
    }
  }
}

async function compileContract(cfg: ContractCompileConfig, hre: HardhatRuntimeEnvironment) {
  await ensureInterfaceCompiled(cfg.interfacePath, hre);

  const interfaceArtifact = getInterfaceArtifact(cfg.interfacePath, hre.config.paths.artifacts);

  const contractPath = cfg.contractDir;
  const lastPart = path.basename(contractPath);
  const wasmName = `${lastPart.replace(/-/g, '_')}.wasm`;

  const artifactDir = path.join(path.dirname(contractPath), wasmName);
  console.log('artifactDir', artifactDir);

  const outputDir = path.join(hre.config.paths.artifacts, artifactDir);
  const bytecode = compileAndGetBytecode(path.join(hre.config.paths.root, cfg.contractDir));

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

  ensureDirSync(outputDir);
  const artifactPath = path.join(outputDir, `${wasmName}.json`);
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

  console.log(`Compiled Rust contract: ${wasmName}`);
}

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  config.compileToWasmConfig =
    userConfig.compileToWasmConfig?.map((cfg) => ({
      contractDir: cfg.contractDir,
      interfacePath: cfg.interfacePath,
      test: {
        command: cfg.test?.command || 'cargo test',
        flags: cfg.test?.flags || [],
      },
    })) ?? [];
});

// Compile Rust contracts to WASM
subtask('compile:rust', 'Compiles Rust contracts to WASM').setAction(async (_, hre) => {
  console.log(chalk.cyan.bold('\nCompiling Rust contracts'));
  const contracts = hre.config.compileToWasmConfig;

  if (contracts.length === 0) {
    console.log(chalk.yellow('No Rust contracts to compile'));
    return;
  }

  for (const cfg of contracts) {
    try {
      await compileContract(cfg, hre);
    } catch (error: any) {
      console.error(chalk.red(`\nFailed to compile ${path.basename(cfg.contractDir)}:`));
      console.error(chalk.red(`  ${error.message}`));
      throw error;
    }
  }

  console.log(chalk.green.bold('\n✨ All contracts compiled successfully'));
});

// Override main compile task to include WASM compilation
task(TASK_COMPILE, 'Compiles the entire project, building Solidity first, then Rust').setAction(
  async (_, hre, runSuper) => {
    // First compile Solidity contracts (as usual)
    await runSuper();

    // Then compile Rust contracts
    await hre.run('compile:rust');
  },
);

// Rust test subtask
subtask('test:rust', 'Runs Rust contract tests').setAction(async (_, hre) => {
  const contracts = hre.config.compileToWasmConfig;
  if (contracts.length === 0) {
    return true;
  }

  const Mocha = require('mocha');
  const mocha = new Mocha({ ...hre.config.mocha, color: true });

  return new Promise<void>((resolve, reject) => {
    const contractsToTest = contracts.map((cfg) => ({
      ...cfg,
      contractDir: path.resolve(hre.config.paths.root, cfg.contractDir),
    }));

    // Create test suites for each Rust contract
    (async () => {
      try {
        await Promise.all(
          contractsToTest.map(async (contract) => {
            const suite = Mocha.Suite.create(
              mocha.suite,
              `Rust Contract: ${path.basename(contract.contractDir)}`,
            );

            const result = await runContractTests(contract);

            // Create individual test cases for each Rust test
            result.tests.forEach((test) => {
              const testFn = function (this: Mocha.Context) {
                if (test.result === 'failed') {
                  throw new Error(test.error || 'Test failed');
                }
                if (test.result === 'ignored') {
                  this.skip();
                }
              };
              suite.addTest(new Mocha.Test(test.name, testFn));
            });
          }),
        );

        // Run all test suites
        mocha.run((failures) => {
          if (failures) {
            reject(new Error('Rust tests failed'));
          } else {
            resolve();
          }
        });
      } catch (error: any) {
        reject(error);
      }
    })();
  });
});

// Main test task
task(TASK_TEST)
  .addFlag('skipWasmTests', 'Skip Rust contract tests')
  .addFlag('skipSolidityTests', 'Skip Solidity tests')
  .setAction(async (args, hre, runSuper) => {
    if (args.skipWasmTests && args.skipSolidityTests) {
      console.log(chalk.yellow('Both Rust and Solidity tests are skipped'));
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
    } catch (error: any) {
      console.error(chalk.red('\nTest execution failed:'));
      console.error(chalk.red(`  ${error.message}`));
      process.exit(1);
    }
  });
