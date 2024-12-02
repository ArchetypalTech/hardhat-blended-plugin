import { expect } from 'chai';
import { ethers, artifacts, network } from 'hardhat';
import { IBasicContract } from '../typechain-types';

describe('BasicContract', function () {
  // We need an interface to interact with the contract
  let basicContract: IBasicContract;
  this.timeout(60000);

  before(async function () {
    /**
     * WASM Contract Testing Configuration
     *
     * These tests cannot run on the Hardhat Network as it doesn't support WASM execution.
     * You need either:
     *
     * 1. Local Fluent Network:
     *    Run your own local Fluent node using Docker:
     *    ```bash
     *    docker run --rm -it -p 8545:8545 ghcr.io/fluentlabs-xyz/fluent:v0.1.0-dev.8 \
     *      --chain=dev \
     *      node \
     *      --datadir=./datadir \
     *      --dev \
     *      --full \
     *      --http \
     *      --http.addr=0.0.0.0 \
     *      --port=30305 \
     *      --engine.legacy
     *    ```
     *    Then update your hardhat.config.ts to use http://localhost:8545
     *
     * 2. Fluent Devnet:
     *    Use the public devnet RPC endpoint.
     *    See: https://docs.fluentlabs.xyz/learn/developer-preview/connect-to-the-fluent-devnet
     *
     * For more information about Fluent and WASM contract development:
     * - Documentation: https://docs.fluentlabs.xyz
     * - GitHub: https://github.com/fluentlabs-xyz/fluent
     */
    if (network.name === 'hardhat') {
      console.warn(
        '\n⚠️  WASM tests require a Fluent-compatible network (local or devnet).' +
          '\n   See test comments for setup instructions.' +
          '\n   Skipping tests...\n',
      );
      this.skip();
    }

    // Read the contract artifact
    const artifact = await artifacts.readArtifact('BasicContract');

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log('Deployer:', await deployer.getAddress());
    const balance = (await deployer.provider.getBalance(deployer.getAddress())).toString();
    console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');

    // Create a factory for the contract
    const BasicContractFactory = await ethers.getContractFactoryFromArtifact(artifact);

    const contract = await BasicContractFactory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log('Contract deployed to:', contractAddress);

    basicContract = contract as unknown as IBasicContract;
  });

  it('should return greeting message', async function () {
    const message = 'Hello, World!!';
    const result = await basicContract.greeting(message);
    expect(result).to.equal(message);
  });

  it('should handle empty message', async function () {
    const message = '';
    const result = await basicContract.greeting(message);
    expect(result).to.equal(message);
  });

  it('should handle long message', async function () {
    const message = 'A'.repeat(1000);
    const result = await basicContract.greeting(message);
    expect(result).to.equal(message);
  });

  afterEach(async function () {
    // Wait for 1 second to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
