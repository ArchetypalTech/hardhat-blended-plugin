import { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai from 'chai';
import fs from 'fs';
import path from 'path';
import { getArtifactPath, getInterfaceArtifact } from '../src/utils';

chai.use(sinonChai);

describe('Artifact Utils', () => {
  const artifactsPath = '/path/to/artifacts';
  const interfacePath = 'contracts/LibInterface/IAAAA/IBBBB/IBBBB.sol';
  const contractName = 'IBBBB';
  const artifactPath = path.join(
    artifactsPath,
    'contracts',
    'LibInterface/IAAAA/IBBBB/IBBBB.sol',
    `${contractName}.json`,
  );

  beforeEach(() => {
    sinon.restore();
  });

  it('getArtifactPath returns correct path', () => {
    sinon.stub(fs, 'existsSync').returns(true);

    const result = getArtifactPath(interfacePath, artifactsPath);

    expect(result).to.equal(artifactPath);
    expect(fs.existsSync).to.have.been.calledWith(artifactPath);
  });

  it('getArtifactPath throws error if file does not exist', () => {
    sinon.stub(fs, 'existsSync').returns(false);

    expect(() => getArtifactPath(interfacePath, artifactsPath)).to.throw(
      `ABI file not found at ${artifactPath}`,
    );
  });

  it('getInterfaceArtifact returns correct artifact', () => {
    const mockArtifact = { abi: [] };
    sinon.stub(fs, 'existsSync').returns(true);
    sinon.stub(fs, 'readFileSync').returns(JSON.stringify(mockArtifact));

    const result = getInterfaceArtifact(interfacePath, artifactsPath);

    expect(result).to.deep.equal(mockArtifact);
    expect(fs.existsSync).to.have.been.calledWith(artifactPath);
    expect(fs.readFileSync).to.have.been.calledWith(artifactPath, 'utf8');
  });

  it('getInterfaceArtifact throws error if file does not exist', () => {
    sinon.stub(fs, 'existsSync').returns(false);

    expect(() => getInterfaceArtifact(interfacePath, artifactsPath)).to.throw(
      `ABI file not found at ${artifactPath}`,
    );
  });
});
