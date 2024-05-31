import { ensureDirSync } from "fs-extra";
import path from "path";
import { ensureRustInstalled } from "./rustInstaller";
import { getBytecode, rmDirSync } from "./utils";
import { compileRustToWasm } from "./wasm";

const BIN_DIR_SLUG = "bin";

/**
 * Builds the Rust project by compiling it to WebAssembly (WASM) and returns wasm file path.
 * @param contractDir - The absolute path to the contract directory containing the Rust project.
 * @param pkgName - The name of the rust contract package. If the package name is "my_contract", the output file will be my_contract.wasm
 */
export function build(contractDir: string, pkgName: string): string {
  ensureRustInstalled();

  const outputDir = path.join(contractDir, BIN_DIR_SLUG);
  rmDirSync(outputDir);
  ensureDirSync(outputDir);

  return compileRustToWasm(contractDir, BIN_DIR_SLUG, pkgName);
}

/**
 * Compiles the Rust project located at the specified directory and returns the bytecode.
 *
 * @param contractDir The directory path of the Rust project to compile.
 * @returns The compiled bytecode as a string.
 * @throws If there is an error during the compilation process.
 */
export function compileAndGetBytecode(contractDir: string): string {
  const pkgName = path.basename(contractDir).replace("-", "_");
  try {
    const wasmOutputFile = build(contractDir, pkgName);

    return getBytecode(path.join(wasmOutputFile));
  } catch (error) {
    console.error("Failed to compile Rust project.");
    throw error;
  }
}
