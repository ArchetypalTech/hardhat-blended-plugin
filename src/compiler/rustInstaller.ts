import { execSync } from "child_process";

const RUST_INSTALL_CMD =
  "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y";

export function ensureRustInstalled() {
  try {
    execSync("rustc --version", { stdio: "ignore" });
  } catch (error) {
    console.log("Rust is not installed. Installing Rust...");
    execSync(RUST_INSTALL_CMD);
    process.env.PATH += `:${process.env.HOME}/.cargo/bin`;
    console.log("Rust installed successfully.");
  }
}
