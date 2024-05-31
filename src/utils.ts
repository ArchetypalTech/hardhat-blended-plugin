import path from "path";

export function getOutputDir(
  artifactsPath: string,
  contractDir: string
): string {
  return path.join(artifactsPath, contractDir);
}
