import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export function rmDirSync(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    execSync(`rm -rf ${dirPath}`);
  }
}

export function prepareOutputDir(outputDir: string) {
  rmDirSync(outputDir);
  fs.mkdirSync(outputDir);
}

export function getBytecode(wasmPath: string): string {
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`Bytecode file not found at ${wasmPath}`);
  }

  const wasmBinary = fs.readFileSync(wasmPath);

  return `0x${wasmBinary.toString("hex")}`;
}
