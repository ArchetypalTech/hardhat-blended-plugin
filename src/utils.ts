import fs from 'fs';
import path from 'path';

/**
 * Get the path to the artifact JSON file for the given interface path.
 * @param interfacePath - The path to the Solidity interface file.
 * @param artifactsPath - The root path to the Hardhat artifacts.
 * @returns The path to the artifact JSON file.
 */
export function getArtifactPath(interfacePath: string, artifactsPath: string): string {
  const contractName = path.basename(interfacePath, '.sol');
  const artifactPath = path.join(artifactsPath, interfacePath, `${contractName}.json`);

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`ABI file not found at ${artifactPath}`);
  }

  return artifactPath;
}

/**
 * Get the artifact object for the given interface path.
 * @param interfacePath - The path to the Solidity interface file.
 * @param artifactsPath - The root path to the Hardhat artifacts.
 * @returns The artifact object.
 */
export function getInterfaceArtifact(interfacePath: string, artifactsPath: string) {
  const artifactPath = getArtifactPath(interfacePath, artifactsPath);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return artifact;
}
