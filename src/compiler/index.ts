import { ensureRustInstalled } from "./rustInstaller";
import { prepareOutputDir } from "./utils";
import { compileRustToWasm } from "./wasm";
import { convertWasmToRwasm } from "./rwasm";
import path from "path";
import { getBytecode } from "./utils";

/**
 * Builds the Rust project by compiling it to WebAssembly (WASM) and converting it to rWASM.
 * @param contractDir - The absolute path to the contract directory containing the Rust project.
 * @param pkgName - The name of the rust contract package. If the package name is "my_contract", the output files will be my_contract.wasm and my_contract.rwasm.
 */
export function build(
  contractDir: string,
  pkgName: string
): {
  wasmOutputFile: string;
  rwasmOutputFile: string;
} {
  const bin = "bin";
  const rwasmOutputFile = path.join(contractDir, bin, `${pkgName}.rwasm`);

  ensureRustInstalled();
  prepareOutputDir(bin);

  const wasmOutputFile = compileRustToWasm(contractDir, bin, pkgName);
  convertWasmToRwasm(wasmOutputFile, rwasmOutputFile);

  return { wasmOutputFile, rwasmOutputFile };
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
    const { wasmOutputFile } = build(contractDir, pkgName);

    return getBytecode(path.join(wasmOutputFile));
  } catch (error) {
    console.error("Failed to compile Rust project.");
    throw error;
  }
}
