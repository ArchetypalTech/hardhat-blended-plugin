import { execSync } from 'child_process';
import { ensureDirSync } from 'fs-extra';
import path from 'path';
import { CompileSettings } from '../../config/schema';
import { COMPILER_CONSTANTS } from './constants';
import { CompilerErrors } from './errors';

export class RustBuilder {
  /**
   * Generates WASM filename from contract path
   */
  private getWasmName(contractPath: string): string {
    const baseName = path.basename(contractPath);
    return `${baseName.replace(/-/g, '_')}.wasm`;
  }

  /**
   * Separates Rust flags from Cargo options
   */
  private separateOptions(options: string[]): {
    cargoOptions: string[];
    rustFlags: string[];
  } {
    return {
      cargoOptions: options.filter(
        (opt) => !opt.startsWith('-C') && !opt.includes('--rustc-flags'),
      ),
      rustFlags: options.filter((opt) => opt.startsWith('-C')),
    };
  }

  /**
   * Builds WASM file from Rust contract
   */
  buildWasm(contractPath: string, settings: CompileSettings): string {
    const wasmName = this.getWasmName(contractPath);
    const outputDir = path.join(
      contractPath,
      COMPILER_CONSTANTS.DIRECTORIES.TARGET,
      settings.target,
      'release',
    );
    const wasmPath = path.join(outputDir, wasmName);

    ensureDirSync(outputDir);

    try {
      const { cargoOptions, rustFlags } = this.separateOptions(settings.options);

      const buildCommand = ['cargo build', ...cargoOptions].join(' ');

      execSync(buildCommand, {
        cwd: contractPath,
        stdio: 'inherit',
        env: {
          ...process.env,
          RUSTFLAGS: rustFlags.join(' '),
        },
      });

      return wasmPath;
    } catch (error: unknown) {
      throw CompilerErrors.compilationFailed(
        contractPath,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  ensureRustInstalled(): void {
    try {
      execSync('rustc --version', { stdio: 'ignore' });
    } catch {
      try {
        execSync("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y", {
          stdio: 'inherit',
        });
        process.env.PATH += `:${process.env.HOME}/.cargo/bin`;
      } catch (_error: unknown) {
        throw CompilerErrors.rustNotInstalled();
      }
    }
  }
}
