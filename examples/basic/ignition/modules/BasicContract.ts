import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const BasicContractModule = buildModule('BasicContractModule', (m) => {
  const basicContract = m.contract('BasicContract', []);

  return { basicContract };
});

export default BasicContractModule;
