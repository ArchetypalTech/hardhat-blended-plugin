"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RustTester = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const errors_1 = require("./errors");
const DEFAULT_ENV = {
    CARGO_TERM_COLOR: 'always',
};
class RustTester {
    constructor(config, hre) {
        this.config = config;
        this.hre = hre;
        this.contracts = [];
        this.contracts = config.contracts;
    }
    async runTests() {
        this.ensureCargoInstalled();
        return Promise.all(this.contracts.map((contract) => this.runContractTests(contract)));
    }
    async runContractTests(contract) {
        const contractDir = path_1.default.resolve(this.hre.config.paths.root, contract.path);
        if (!(await (0, fs_extra_1.pathExists)(path_1.default.join(contractDir, 'Cargo.toml')))) {
            throw new Error(`Cargo.toml not found in: ${contractDir}`);
        }
        // Simplified command construction
        const command = `${contract.test.command} -- --nocapture`;
        try {
            const output = (0, child_process_1.execSync)(command, {
                cwd: contractDir,
                env: Object.assign(Object.assign({}, process.env), DEFAULT_ENV),
                encoding: 'utf8',
                stdio: ['inherit', 'pipe', 'pipe'],
            });
            const result = this.parseTestOutput(output);
            return Object.assign(Object.assign({ contractPath: contract.path }, result), { success: !result.tests.some((test) => test.status === 'failed') });
        }
        catch (error) {
            const execError = error;
            if (execError.stdout) {
                const result = this.parseTestOutput(execError.stdout.toString());
                return Object.assign(Object.assign({ contractPath: contract.path }, result), { success: false });
            }
            throw new errors_1.TestError(errors_1.TestErrorCode.TEST_EXECUTION_FAILED, 'Test execution failed', [
                error instanceof Error ? error.message : String(error),
            ]);
        }
    }
    parseTestOutput(output) {
        const tests = [];
        const lines = output.split('\n');
        let totalDuration = '0.00s';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const testMatch = line.match(/test ([\w:]+) \.\.\. (\w+)(?: \(([^\)]+)\))?/);
            if (testMatch) {
                const [, name, result, testDuration] = testMatch;
                let status;
                switch (result.toLowerCase()) {
                    case 'ok':
                        status = 'passed';
                        break;
                    case 'failed':
                        status = 'failed';
                        break;
                    case 'ignored':
                        status = 'ignored';
                        break;
                    default:
                        status = 'failed';
                }
                const test = {
                    name,
                    status,
                    duration: testDuration || '0.00s',
                };
                if (status === 'failed') {
                    const errorLines = [];
                    let j = i + 1;
                    while (j < lines.length &&
                        (lines[j].includes("thread '") || lines[j].includes('panicked at'))) {
                        errorLines.push(lines[j].trim());
                        j++;
                    }
                    test.error = errorLines.join('\n');
                }
                tests.push(test);
            }
            const summaryMatch = line.match(/test result:.+finished in ([0-9.]+)s/);
            if (summaryMatch) {
                totalDuration = `${summaryMatch[1]}s`;
            }
        }
        return { tests, totalDuration };
    }
    ensureCargoInstalled() {
        try {
            (0, child_process_1.execSync)('cargo --version', { stdio: 'ignore' });
        }
        catch (_a) {
            throw new Error('Cargo is not installed or not in PATH');
        }
    }
}
exports.RustTester = RustTester;
//# sourceMappingURL=index.js.map