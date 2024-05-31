/**
 * Builds the Rust project by compiling it to WebAssembly (WASM) and converting it to rWASM.
 * @param contractDir - The absolute path to the contract directory containing the Rust project.
 * @param pkgName - The name of the rust contract package. If the package name is "my_contract", the output files will be my_contract.wasm and my_contract.rwasm.
 */
export declare function build(contractDir: string, pkgName: string): {
    wasmOutputFile: string;
    rwasmOutputFile: string;
};
/**
 * Compiles the Rust project located at the specified directory and returns the bytecode.
 *
 * @param contractDir The directory path of the Rust project to compile.
 * @returns The compiled bytecode as a string.
 * @throws If there is an error during the compilation process.
 */
export declare function compileAndGetBytecode(contractDir: string): string;
//# sourceMappingURL=index.d.ts.map