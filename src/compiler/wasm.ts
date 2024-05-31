import { execSync } from "child_process";
import { copyFileSync } from "fs";
import path from "path";

const RUSTFLAGS =
  "-C link-arg=-zstack-size=131072 -C target-feature=+bulk-memory -C opt-level=z -C strip=symbols";

export function compileRustToWasm(
  projectPath: string,
  outputDir: string,
  pkgName: string,
): string {
  const wasmTarget = path.join(
    projectPath,
    `target/wasm32-unknown-unknown/release/${pkgName}.wasm`,
  );
  const wasmOutputFile = path.join(projectPath, outputDir, `${pkgName}.wasm`);

  try {
    execSync(
      `cargo build --release --target=wasm32-unknown-unknown --no-default-features`,
      {
        cwd: projectPath,
        env: { ...process.env, RUSTFLAGS },
        stdio: "inherit",
      },
    );

    copyFileSync(wasmTarget, wasmOutputFile);

    return wasmOutputFile;
  } catch (error) {
    console.error("Failed to compile Rust project.");
    throw error;
  }
}
