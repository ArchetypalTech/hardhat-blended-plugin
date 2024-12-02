import { task } from 'hardhat/config';
import { TASK_CLEAN } from 'hardhat/builtin-tasks/task-names';
import { RustCompiler } from '../../internal/compiler';

const TASK_CLEAN_RUST = 'clean:rust';

task(TASK_CLEAN_RUST, 'Cleans Rust artifacts').setAction(async (_, hre) => {
  const compiler = new RustCompiler(hre.config.fluent, hre);

  try {
    await compiler.clean();
  } catch (error) {
    throw error;
  }
});

task(TASK_CLEAN, 'Cleans the cache and deletes all artifacts').setAction(
  async (_, hre, runSuper) => {
    try {
      await runSuper();
      await hre.run(TASK_CLEAN_RUST);
    } catch (error) {
      throw error;
    }
  },
);
