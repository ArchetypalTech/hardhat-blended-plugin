import { execSync } from 'child_process';
import { pathExists } from 'fs-extra';
import path from 'path';
import { ContractConfig, FluentConfig } from '../../config/schema';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { TestError, TestErrorCode } from './errors';

interface RustTest {
  name: string;
  status: 'passed' | 'failed' | 'ignored';
  duration: string;
  error?: string;
}

interface TestResult {
  contractPath: string;
  tests: RustTest[];
  totalDuration: string;
  success: boolean;
}

const DEFAULT_ENV = {
  CARGO_TERM_COLOR: 'always',
};

export class RustTester {
  private contracts: ContractConfig[] = [];

  constructor(
    private readonly config: FluentConfig,
    private hre: HardhatRuntimeEnvironment,
  ) {
    this.contracts = config.contracts;
  }

  async runTests(): Promise<TestResult[]> {
    await this.ensureCargoInstalled();
    return Promise.all(this.contracts.map((contract) => this.runContractTests(contract)));
  }

  private async runContractTests(contract: ContractConfig): Promise<TestResult> {
    const contractDir = path.resolve(this.hre.config.paths.root, contract.path);

    if (!(await pathExists(path.join(contractDir, 'Cargo.toml')))) {
      throw new Error(`Cargo.toml not found in: ${contractDir}`);
    }

    // Simplified command construction
    const command = `${contract.test.command} -- --nocapture`;

    try {
      const output = execSync(command, {
        cwd: contractDir,
        env: { ...process.env, ...DEFAULT_ENV },
        encoding: 'utf8',
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      const result = this.parseTestOutput(output);
      return {
        contractPath: contract.path,
        ...result,
        success: !result.tests.some((test) => test.status === 'failed'),
      };
    } catch (error: any) {
      if (error.stdout) {
        const result = this.parseTestOutput(error.stdout);
        return {
          contractPath: contract.path,
          ...result,
          success: false,
        };
      }
      throw new TestError(TestErrorCode.TEST_EXECUTION_FAILED, 'Test execution failed', [
        error instanceof Error ? error.message : String(error),
      ]);
    }
  }

  private parseTestOutput(output: string): Omit<TestResult, 'contractPath' | 'success'> {
    const tests: RustTest[] = [];
    const lines = output.split('\n');
    let totalDuration = '0.00s';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      const testMatch = line.match(/test ([\w:]+) \.\.\. (\w+)(?: \(([^\)]+)\))?/);
      if (testMatch) {
        const [, name, result, testDuration] = testMatch;
        let status: 'passed' | 'failed' | 'ignored';

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

        const test: RustTest = {
          name,
          status,
          duration: testDuration || '0.00s',
        };

        if (status === 'failed') {
          const errorLines: string[] = [];
          let j = i + 1;
          while (
            j < lines.length &&
            (lines[j].includes("thread '") || lines[j].includes('panicked at'))
          ) {
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

  private async ensureCargoInstalled(): Promise<void> {
    try {
      execSync('cargo --version', { stdio: 'ignore' });
    } catch {
      throw new Error('Cargo is not installed or not in PATH');
    }
  }
}
