import { execSync } from "child_process";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import path from "path";

const WASM_FORMAT = "hh-wasm-artifact-1";
const CARGO_INSTALL_CMD =
  "cargo install --git https://github.com/fluentlabs-xyz/fluentbase fluentbase-bin";
const RUST_INSTALL_CMD =
  "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y";
const RUSTFLAGS =
  "-C link-arg=-zstack-size=131072 -C target-feature=+bulk-memory -C opt-level=z -C strip=symbols";

interface BuildOptions {
  contractDir: string;
  pkgName: string;
  absolutePath: string;
}

function ensureRustInstalled() {
  try {
    execSync("rustc --version", { stdio: "ignore" });
    console.log("Rust is already installed.");
  } catch (error) {
    console.log("Rust is not installed. Installing Rust...");
    execSync(RUST_INSTALL_CMD);
    process.env.PATH += `:${process.env.HOME}/.cargo/bin`;
    console.log("Rust installed successfully.");
  }
}

function rmDirSync(dirPath: string) {
  if (existsSync(dirPath)) {
    execSync(`rm -rf ${dirPath}`);
  }
}

function prepareOutputDir(outputDir: string) {
  rmDirSync(outputDir);
  mkdirSync(outputDir);
}

function compileToWasm(
  projectPath: string,
  outputDir: string,
  pkgName: string
): string {
  const wasmTarget = path.join(
    projectPath,
    `target/wasm32-unknown-unknown/release/${pkgName}.wasm`
  );
  const wasmOutputFile = path.join(outputDir, `${pkgName}.wasm`);
  const wasmWatFile = path.join(outputDir, `${pkgName}.wat`);

  console.log(`Compiling Rust project at ${projectPath}`);

  try {
    execSync(
      `cargo build --release --target=wasm32-unknown-unknown --no-default-features`,
      {
        cwd: projectPath,
        env: { ...process.env, RUSTFLAGS },
        stdio: "inherit",
      }
    );

    console.log("Rust project compiled successfully.");

    console.log("Copying the wasm file to the output directory...");
    copyFileSync(wasmTarget, wasmOutputFile);

    console.log("Converting wasm to wat...");
    execSync(`wasm2wat ${wasmOutputFile} > ${wasmWatFile}`, {
      stdio: "inherit",
    });

    return wasmOutputFile;
  } catch (error) {
    console.error("Failed to compile Rust project.");
    throw error;
  }
}

function ensureRwasmcInstalled() {
  try {
    execSync("command -v rwasmc", { stdio: "ignore" });
    console.log("rwasmc is already installed.");
  } catch (error) {
    console.log("rwasmc is not installed. Installing rwasmc...");
    execSync(CARGO_INSTALL_CMD, { stdio: "inherit" });
    console.log("rwasmc installed successfully.");
  }
}

function convertWasmToRwasm(wasmOutputFile: string, rwasmOutputFile: string) {
  ensureRwasmcInstalled();

  console.log("Converting wasm to rwasm...");
  execSync(
    `rwasmc --file-in-path="${wasmOutputFile}" --rwasm-file-out-path="${rwasmOutputFile}"`,
    { stdio: "inherit" }
  );
}

export function build({ contractDir, pkgName, absolutePath }: BuildOptions) {
  const projectPath = path.resolve(absolutePath, contractDir);
  const outputDir = path.join(projectPath, "bin");
  const rwasmOutputFile = path.join(outputDir, `${pkgName}.rwasm`);

  console.log(
    `Building Rust project at ${projectPath}, package name: ${pkgName}`
  );

  ensureRustInstalled();
  prepareOutputDir(outputDir);
  const wasmOutputFile = compileToWasm(projectPath, outputDir, pkgName);
  convertWasmToRwasm(wasmOutputFile, rwasmOutputFile);

  console.log(`Build completed. WASM and rWASM files are in ${outputDir}`);
}
