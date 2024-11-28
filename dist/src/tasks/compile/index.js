"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const compiler_1 = require("../../internal/compiler");
const logger_1 = require("../../utils/logger");
const TASK_COMPILE_RUST = 'compile:rust';
const logger = new logger_1.Logger({ showTimestamp: true });
(0, config_1.task)(TASK_COMPILE_RUST, 'Compiles Rust contracts to WASM').setAction(async (_, hre) => {
    const compiler = new compiler_1.RustCompiler(hre.config.fluent, hre);
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
    }
    catch (error) {
        logger.error('Compilation failed.', { error });
        throw error;
    }
});
(0, config_1.task)(task_names_1.TASK_COMPILE, 'Compiles the entire project').setAction(async (_, hre, runSuper) => {
    logger.info('Starting full project compilation...');
    await runSuper();
    logger.info('Compiling Rust contracts as part of the project...');
    await hre.run(TASK_COMPILE_RUST);
});
//# sourceMappingURL=index.js.map