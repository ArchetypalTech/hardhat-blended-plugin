import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';

import { RustCompiler } from '../../internal/compiler';
import { Logger } from '../../utils/logger';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const TASK_COMPILE_RUST = 'compile:rust';
const logger = new Logger({ showTimestamp: true });

task(TASK_COMPILE_RUST, 'Compiles Rust contracts to WASM').setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    const compiler = new RustCompiler(hre.config.fluent, hre);

    logger.title('Compiling Rust contracts...');

    try {
      const results = await compiler.compile();

      results.forEach((result) => {
        if (!result.success) {
          logger.error('Failed to compile contract.', {
            contractName: result.contractName,
            error: result.error,
          });
        }
      });

      const failedCount = results.filter((r) => !r.success).length;
      if (failedCount > 0) {
        logger.warn(`${failedCount} contracts failed to compile.`);
        throw new Error(`${failedCount} contracts failed to compile`);
      }

      logger.result('✨ All contracts compiled successfully!');
    } catch (error) {
      logger.error('Compilation failed.', { error });
      throw error;
    }
  },
);

task(TASK_COMPILE, 'Compiles the entire project').setAction(async (_, hre, runSuper) => {
  logger.info('Starting full project compilation...');
  await runSuper();

  logger.info('Compiling Rust contracts as part of the project...');
  await hre.run(TASK_COMPILE_RUST);
});
