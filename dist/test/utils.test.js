"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const chai_2 = __importDefault(require("chai"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../src/utils");
chai_2.default.use(sinon_chai_1.default);
describe("Artifact Utils", () => {
    const artifactsPath = "/path/to/artifacts";
    const interfacePath = "contracts/LibInterface/IAAAA/IBBBB/IBBBB.sol";
    const contractName = "IBBBB";
    const artifactPath = path_1.default.join(artifactsPath, "contracts", "LibInterface/IAAAA/IBBBB/IBBBB.sol", `${contractName}.json`);
    beforeEach(() => {
        sinon_1.default.restore();
    });
    it("getArtifactPath returns correct path", () => {
        sinon_1.default.stub(fs_1.default, "existsSync").returns(true);
        const result = utils_1.getArtifactPath(interfacePath, artifactsPath);
        chai_1.expect(result).to.equal(artifactPath);
        chai_1.expect(fs_1.default.existsSync).to.have.been.calledWith(artifactPath);
    });
    it("getArtifactPath throws error if file does not exist", () => {
        sinon_1.default.stub(fs_1.default, "existsSync").returns(false);
        chai_1.expect(() => utils_1.getArtifactPath(interfacePath, artifactsPath)).to.throw(`ABI file not found at ${artifactPath}`);
    });
    it("getInterfaceArtifact returns correct artifact", () => {
        const mockArtifact = { abi: [] };
        sinon_1.default.stub(fs_1.default, "existsSync").returns(true);
        sinon_1.default.stub(fs_1.default, "readFileSync").returns(JSON.stringify(mockArtifact));
        const result = utils_1.getInterfaceArtifact(interfacePath, artifactsPath);
        chai_1.expect(result).to.deep.equal(mockArtifact);
        chai_1.expect(fs_1.default.existsSync).to.have.been.calledWith(artifactPath);
        chai_1.expect(fs_1.default.readFileSync).to.have.been.calledWith(artifactPath, "utf8");
    });
    it("getInterfaceArtifact throws error if file does not exist", () => {
        sinon_1.default.stub(fs_1.default, "existsSync").returns(false);
        chai_1.expect(() => utils_1.getInterfaceArtifact(interfacePath, artifactsPath)).to.throw(`ABI file not found at ${artifactPath}`);
    });
});
//# sourceMappingURL=utils.test.js.map