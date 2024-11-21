import { HardhatUserConfig } from 'hardhat/types';
import '@nomicfoundation/hardhat-toolbox';
import '@fluent.xyz/hardhat-plugin';

require('dotenv').config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';

const config: HardhatUserConfig = {
  defaultNetwork: 'local',
  networks: {
    local: {
      url: 'http://127.0.0.1:8545',
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    dev: {
      url: 'https://rpc.dev.gblend.xyz/',
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 20993,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  compileToWasmConfig: [
    {
      contractDir: './contracts/basic-contract',
      interfacePath: './contracts/IBasicContract.sol',
    },
  ],
};

export default config;
