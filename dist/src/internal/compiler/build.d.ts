import { CompileSettings } from '../../config/schema';
export declare class RustBuilder {
    /**
     * Generates WASM filename from contract path
     */
    private getWasmName;
    /**
     * Separates Rust flags from Cargo options
     */
    private separateOptions;
    /**
     * Builds WASM file from Rust contract
     */
    buildWasm(contractPath: string, settings: CompileSettings): string;
    ensureRustInstalled(): void;
}
//# sourceMappingURL=build.d.ts.map