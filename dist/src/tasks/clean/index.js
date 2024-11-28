"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const compiler_1 = require("../../internal/compiler");
const TASK_CLEAN_RUST = 'clean:rust';
(0, config_1.task)(TASK_CLEAN_RUST, 'Cleans Rust artifacts').setAction(async (_, hre) => {
    const compiler = new compiler_1.RustCompiler(hre.config.fluent, hre);
    try {
        await compiler.clean();
    }
    catch (error) {
        throw error;
    }
});
(0, config_1.task)(task_names_1.TASK_CLEAN, 'Cleans the cache and deletes all artifacts').setAction(async (_, hre, runSuper) => {
    try {
        await runSuper();
        await hre.run(TASK_CLEAN_RUST);
    }
    catch (error) {
        throw error;
    }
});
//# sourceMappingURL=index.js.map