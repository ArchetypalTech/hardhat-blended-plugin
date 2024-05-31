import { execSync } from "child_process";

const CARGO_INSTALL_CMD =
  "cargo install --git https://github.com/fluentlabs-xyz/fluentbase fluentbase-bin";

export function ensureRwasmcInstalled() {
  try {
    execSync("command -v rwasmc", { stdio: "ignore" });
  } catch (error) {
    console.log("rwasmc is not installed. Installing rwasmc...");
    execSync(CARGO_INSTALL_CMD, { stdio: "inherit" });
    console.log("rwasmc installed successfully.");
  }
}

export function convertWasmToRwasm(
  wasmOutputFile: string,
  rwasmOutputFile: string
) {
  ensureRwasmcInstalled();
  execSync(
    `rwasmc --file-in-path="${wasmOutputFile}" --rwasm-file-out-path="${rwasmOutputFile}"`,
    { stdio: "inherit" }
  );
}
