import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { pathExists } from 'fs-extra';

export interface ContractCompileConfig {
  contractDir: string;
  test?: {
    command?: string;
    flags?: string[];
  };
}

interface RustTest {
  name: string;
  result: 'passed' | 'failed' | 'ignored';
  duration: string;
  error?: string;
}

interface TestResult {
  tests: RustTest[];
  totalDuration: string;
}

const DEFAULT_ENV = {
  CARGO_TERM_COLOR: 'always',
};

function parseTestOutput(output: string): TestResult {
  const tests: RustTest[] = [];
  const lines = output.split('\n');
  let currentTest: Partial<RustTest> = {};
  let totalDuration = '0.00s';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match test execution line
    const testMatch = line.match(/test ([\w:]+) \.\.\. (\w+)(?: \(([^\)]+)\))?/);
    if (testMatch) {
      const [, name, result, duration] = testMatch;
      currentTest = {
        name,
        result: result.toLowerCase() as 'passed' | 'failed' | 'ignored',
        duration: duration || '0.00s',
      };

      // If test failed, collect error message
      if (currentTest.result === 'failed') {
        const errorMsg: string[] = [];
        let j = i + 1;
        while (
          j < lines.length &&
          (lines[j].includes("thread '") || lines[j].includes('panicked at'))
        ) {
          errorMsg.push(lines[j].trim());
          j++;
        }
        currentTest.error = errorMsg.join('\n');
      }

      tests.push(currentTest as RustTest);
    }

    // Match total duration
    const durationMatch = line.match(/finished in ([\d.]+)s/);
    if (durationMatch) {
      totalDuration = durationMatch[1] + 's';
    }
  }

  return {
    tests,
    totalDuration,
  };
}

async function executeTestCommand(
  contractDir: string,
  command: string = 'cargo test',
  flags: string[] = [],
): Promise<TestResult> {
  if (!(await pathExists(path.join(contractDir, 'Cargo.toml')))) {
    throw new Error(`Cargo.toml not found in: ${contractDir}`);
  }

  const fullCommand = `${command} ${flags.join(' ')}`;

  try {
    const output = execSync(fullCommand, {
      cwd: contractDir,
      env: { ...process.env, ...DEFAULT_ENV },
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    return parseTestOutput(output);
  } catch (error: any) {
    if (error.stdout) {
      return parseTestOutput(error.stdout.toString());
    }
    throw error;
  }
}

export async function runContractTests(config: ContractCompileConfig): Promise<TestResult> {
  try {
    execSync('cargo --version', { stdio: 'ignore' });
    return await executeTestCommand(config.contractDir, config.test?.command, config.test?.flags);
  } catch (error: any) {
    if (error.message.includes('cargo --version')) {
      throw new Error('Cargo is not installed or not in PATH');
    }
    throw error;
  }
}

export async function runAllTests(contracts: ContractCompileConfig[]): Promise<TestResult[]> {
  return Promise.all(
    contracts.map(async (contract) => {
      return runContractTests(contract);
    }),
  );
}
