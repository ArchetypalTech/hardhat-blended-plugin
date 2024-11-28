# Integrating Fluent WASM Contracts into Hardhat Projects

## Introduction

Fluent's [blended execution](https://mirror.xyz/fluentlabs.eth/8IelEprNblwr1HENCzbp9WFEc7FieEapD5SAiBNUBGA) allows smart contracts from different virtual machines to interact within a unified environment. While Fluent supports any programming language that compiles to WebAssembly, this guide focuses on Rust as the primary example.

The `@fluent.xyz/hardhat-plugin` enables:

- Development of both Solidity and WASM contracts in a single Hardhat project
- Unified compilation and testing process
- Direct interaction between contracts written in different languages
- Seamless integration with existing Hardhat workflows

## Prerequisites

- Node.js 16+
- Rust and Cargo
- Docker (for local testing)

## Guide Overview

This guide walks through integrating Fluent WASM contracts into a Hardhat project. You can either:

- Follow the step-by-step guide to create a new project from scratch using `npx hardhat init`
- Add Fluent support to your existing Hardhat project
- Clone a complete [example project](https://github.com/fluentlabs-xyz/hardhat-plugin-ts-template) for reference

### What We'll Build

We'll create a lottery smart contract that demonstrates Fluent's blended execution capabilities:

- A Solidity contract handling the lottery logic and payments
- A Rust contract providing cryptographically secure random number generation
- Integration tests demonstrating interoperability between Solidity and Rust contracts.

This example demonstrates how to leverage each language's strengths:

- Solidity for handling blockchain-specific operations
- Rust for complex computations using its rich ecosystem of libraries

### Quick Start

If you want to see the final result first:

```bash
# Clone the example project
git clone https://github.com/fluentlabs-xyz/hardhat-plugin-ts-template
cd hardhat-plugin-ts-template

# Install dependencies
npm install

# Start local Fluent node
npx hardhat node:fluent

# Run tests
npx hardhat test --network local


# Deploy contracts to Fluent devnet
npx hardhat ignition deploy ignition/modules/Lottery.ts --network dev
```

## Project Setup

This section will guide you through creating a new Hardhat project with Fluent integration from scratch. If you already have a Hardhat project, skip to the [Update Configuration](#update-configuration) section.

### Initialize Project

1. Create a new directory and initialize the project:

```bash
mkdir fluent-lottery
cd fluent-lottery
```

2. Initialize a Hardhat project:

```bash
npx hardhat init
```

Select the following options:

- Create a TypeScript project
- Add .gitignore
- Install dependencies with npm

1. Install the Fluent plugin:

```bash
npm install --save-dev @fluent.xyz/hardhat-plugin 
```

### Project Structure

Create the following directory structure:

```
fluent-lottery/
├── contracts/
│   ├── Lottery.sol           # Solidity lottery contract
│   ├── IRandomGenerator.sol  # Solidity interface for rust contract
│   └── random-generator/     # Rust random number generator
│       ├── Cargo.toml
│       └── lib.rs
├── test/
│   └── Lottery.test.ts      # Integration tests
└── hardhat.config.ts
```

Next, we'll implement our contracts and set up the development environment.

### Update Configuration

Update your `hardhat.config.ts` to include the Fluent plugin and specify network settings:

> [!TIP]
> Check the [Connect to the Fluent Devnet](https://docs.fluentlabs.xyz/learn/developer-preview/connect-to-the-fluent-devnet) section for actual network settings.

```typescript
import { HardhatUserConfig } from "hardhat/config";
// Import required Hardhat plugins
import "@nomicfoundation/hardhat-ignition"; // For deployments
import "@nomicfoundation/hardhat-toolbox"; // Collection of essential Hardhat plugins
import "@fluent.xyz/hardhat-plugin"; // For WASM contract support

// Load environment variables from .env file
require("dotenv").config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  // Set default network for commands that don't specify --network
  defaultNetwork: "local",

  // Configure available networks
  networks: {
    // Local network configuration for development
    local: {
      url: "http://127.0.0.1:8545", // Local Fluent node URL
      accounts: [DEPLOYER_PRIVATE_KEY], // Account used for deployment
      chainId: 1337, // Local network chain ID
    },
    // Fluent devnet configuration
    dev: {
      url: "https://rpc.dev.gblend.xyz/", // Fluent devnet RPC endpoint
      accounts: [DEPLOYER_PRIVATE_KEY], // Account used for deployment
      chainId: 20993, // Fluent devnet chain ID
    },
  },

  // Solidity compiler configuration
  solidity: {
    version: "0.8.20", // Solidity version to use
    settings: {
      optimizer: {
        enabled: true, // Enable Solidity optimizer
        runs: 200, // Optimize for average number of runs
      },
    },
  },
};

export default config;
```

Create a `.env` file in the project root and add your deployer private key:

```bash
DEPLOYER_PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> [!IMPORTANT]
> Never expose your private key in public repositories. Use environment variables or other secure methods to protect sensitive information.

## Contract Development

Our lottery system demonstrates Fluent's blended execution capability by combining:

- A Solidity contract that handles lottery logic, participant management, and prize distribution
- A Rust contract that provides secure random number generation

The contracts interact through a Solidity interface, allowing seamless cross-VM communication while leveraging each language's strengths.

### Solidity Contract

1. First, create the interface for our Rust random number generator:

```solidity
// contracts/IRandomGenerator.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRandomGenerator {
    /// @notice Generates a random number using the provided seed
    /// @param seed Value used to generate the random number
    /// @return A random uint256 number
    function getRandomNumber(uint256 seed) external returns (uint256);
}
```

2. Create the main lottery contract:

```solidity
// contracts/Lottery.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IRandomGenerator.sol";

/// @title Lottery Contract
/// @notice A lottery contract that uses Rust-based random number generation through Fluent's blended execution
contract Lottery is ReentrancyGuard, Ownable {
    uint256 public immutable endTime;
    IRandomGenerator public immutable randomGenerator;
    uint256 public immutable ticketPrice;
    address[] public participants;
    bool public isActive;

    event WinnerSelected(address indexed winner, uint256 amount, uint256 timestamp);
    event ParticipantAdded(address indexed participant, uint256 ticketNumber);
    event LotteryFinished(uint256 timestamp);

    /// @notice Creates a new lottery
    /// @param _endTime Unix timestamp when the lottery ends and winner can be selected
    /// @param _randomGenerator Address of the Rust random number generator contract
    /// @param _ticketPrice Price in wei that each participant must pay to enter
    constructor(
        uint256 _endTime,
        address _randomGenerator,
        uint256 _ticketPrice
    ) Ownable(msg.sender) {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_randomGenerator != address(0), "Invalid random generator address");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");

        endTime = _endTime;
        randomGenerator = IRandomGenerator(_randomGenerator);
        ticketPrice = _ticketPrice;
        isActive = true;
    }

    /// @notice Allows users to enter the lottery by paying the ticket price
    function participate() external payable {
        require(isActive, "Lottery is not active");
        require(block.timestamp < endTime, "Lottery is already finished");
        require(msg.value == ticketPrice, "Incorrect ticket price");

        participants.push(msg.sender);
        emit ParticipantAdded(msg.sender, participants.length);
    }

    /// @notice Selects a winner using the Rust random number generator
    /// @param seed Initial value for random number generation
    function selectWinner(uint256 seed) external onlyOwner nonReentrant {
        require(isActive, "Lottery is not active");
        require(block.timestamp >= endTime, "Lottery is still in progress");
        require(participants.length > 0, "No participants");

        uint256 winnerIndex = randomGenerator.getRandomNumber(seed) % participants.length;
        address payable winner = payable(participants[winnerIndex]);
        uint256 prize = address(this).balance;

        isActive = false;
        delete participants;

        (bool success, ) = winner.call{value: prize}("");
        require(success, "Failed to send prize to winner");

        emit WinnerSelected(winner, prize, block.timestamp);
        emit LotteryFinished(block.timestamp);
    }

    /// @notice Returns the total number of participants
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    /// @notice Returns the list of all participants
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    /// @notice Calculates time remaining until lottery can be finalized
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }
}
```

The Solidity contract includes:

- Secure prize distribution using reentrancy protection
- Access control for administrative functions
- Event emission for frontend integration
- View functions for contract state inspection
- Cross-VM interaction with the Rust random number generator

Next, we'll implement the Rust contract to provide secure random number generation.

### Rust Contract

The Rust contract implementation demonstrates how to create a WASM contract that can interact with Solidity contracts through Fluent's blended execution.

#### Rust Project Structure

In the `contracts/random-generator` directory, create:

1. `Cargo.toml` - Project configuration:

```toml
[package]
edition = "2021"
name = "random-generator"
version = "0.1.0"

[dependencies]
fluentbase-sdk = { git = "https://github.com/fluentlabs-xyz/fluentbase", branch = "devel", default-features = false }
rand_chacha = { version = "0.3", default-features = false }

[lib]
crate-type = ["cdylib", "staticlib"]
path = "lib.rs"

[features]
default = ["std"]
std = ["fluentbase-sdk/std"]
```

2. `lib.rs` - Contract implementation:

```rust
#![cfg_attr(not(feature = "std"), no_std)]
extern crate alloc;
extern crate fluentbase_sdk;

use fluentbase_sdk::{
    basic_entrypoint,
    derive::{function_id, router, Contract},
    SharedAPI, U256,
};
use rand_chacha::{
    rand_core::{RngCore, SeedableRng},
    ChaCha20Rng,
};

#[derive(Contract)]
struct RandomGenerator<SDK> {
    sdk: SDK,
}

pub trait RandomGeneratorAPI {
    fn get_random_number(&self, seed: U256) -> U256;
}

#[router(mode = "solidity")]
impl<SDK: SharedAPI> RandomGeneratorAPI for RandomGenerator<SDK> {
    #[function_id("getRandomNumber(uint256)")]
    fn get_random_number(&self, seed: U256) -> U256 {
        let mut rng = ChaCha20Rng::from_seed(seed.to_be_bytes());
        let mut random_bytes = [0u8; 32];
        rng.fill_bytes(&mut random_bytes);
        U256::from_be_slice(&random_bytes)
    }
}

impl<SDK: SharedAPI> RandomGenerator<SDK> {
    fn deploy(&self) {}
}

basic_entrypoint!(RandomGenerator);
```

#### Key Components Explained

1. **No Standard Library Configuration**

```rust
#![cfg_attr(not(feature = "std"), no_std)]
extern crate alloc;
```

These lines configure the contract to work without the Rust standard library, which is necessary for WASM contracts. The `alloc` crate provides essential allocation functions.

2. **Contract Structure and Traits**

```rust
#[derive(Contract)]
struct RandomGenerator<SDK> {
    sdk: SDK,
}
```

- The `Contract` derive macro generates necessary boilerplate for contract functionality
- The generic `SDK` parameter provides access to the Fluent runtime

3. **API Definition**

```rust
pub trait RandomGeneratorAPI {
    fn get_random_number(&self, seed: U256) -> U256;
}
```

This trait defines the contract's public interface, matching the Solidity interface.

4. **Router Implementation**

```rust
#[router(mode = "solidity")]
impl<SDK: SharedAPI> RandomGeneratorAPI for RandomGenerator<SDK> {
    #[function_id("getRandomNumber(uint256)")]
    fn get_random_number(&self, seed: U256) -> U256 {
        // implementation
    }
}
```

- `#[router(mode = "solidity")]` enables Solidity ABI compatibility
- `#[function_id("getRandomNumber(uint256)")]` specifies the Solidity function signature. If the function signature doesn't match, the contract will fail to compile. If the function signature is omitted, the contract will generate function ID from the function name and parameters.
- `SharedAPI` trait provides access to the Fluent runtime functions

5. **Contract Entry Point**

```rust
basic_entrypoint!(RandomGenerator);
```

This macro generates the necessary WASM entry points for the contract.

## Testing

Now that we have created our contracts, let's test them. The `@fluent.xyz/hardhat-plugin` provides comprehensive testing capabilities, allowing you to run both Rust unit tests and Solidity integration tests.

### Running Rust Unit Tests

So first, let's write some Rust unit tests for our random number generator contract.

> [!NOTE]
> Add the following code to the end of your `lib.rs` file to include unit tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use fluentbase_sdk::{
        bytes::BytesMut, codec::SolidityABI, journal::JournalState, runtime::TestingContext,
    };

    #[test]
    fn test_random_generation() {
        let test_seeds = vec![
            U256::from(0),
            U256::from(1),
            U256::from(u128::MAX),
            U256::from(42),
        ];

        for seed in test_seeds {
            let call = GetRandomNumberCall::new((seed,)).encode();

            let sdk = TestingContext::empty().with_input(call);
            let mut generator = RandomGenerator::new(JournalState::empty(sdk.clone()));
            generator.deploy();
            generator.main();

            let output = sdk.take_output();
            let mut decode_buf = BytesMut::new();
            decode_buf.extend_from_slice(&U256::from(32).to_be_bytes::<32>());
            decode_buf.extend_from_slice(&output);

            let decoded_output: U256 =
                SolidityABI::decode(&decode_buf.freeze(), 0).expect("Failed to decode output");

            assert_ne!(decoded_output, seed, "Output should be different from seed");
            assert_ne!(decoded_output, U256::from(0), "Output should not be zero");
        }
    }

    #[test]
    fn test_deterministic_output() {
        let seed = U256::from(42);
        let call = GetRandomNumberCall::new((seed,)).encode();

        // First call
        let sdk1 = TestingContext::empty().with_input(call.clone());
        let mut generator1 = RandomGenerator::new(JournalState::empty(sdk1.clone()));
        generator1.deploy();
        generator1.main();

        let output1 = sdk1.take_output();
        let mut decode_buf1 = BytesMut::new();
        decode_buf1.extend_from_slice(&U256::from(32).to_be_bytes::<32>());
        decode_buf1.extend_from_slice(&output1);
        let decoded_output1: U256 =
            SolidityABI::decode(&decode_buf1.freeze(), 0).expect("Failed to decode first output");

        // Second call
        let sdk2 = TestingContext::empty().with_input(call);
        let mut generator2 = RandomGenerator::new(JournalState::empty(sdk2.clone()));
        generator2.deploy();
        generator2.main();

        let output2 = sdk2.take_output();
        let mut decode_buf2 = BytesMut::new();
        decode_buf2.extend_from_slice(&U256::from(32).to_be_bytes::<32>());
        decode_buf2.extend_from_slice(&output2);
        let decoded_output2: U256 =
            SolidityABI::decode(&decode_buf2.freeze(), 0).expect("Failed to decode second output");

        assert_eq!(
            decoded_output1, decoded_output2,
            "Same seed should produce same output"
        );
    }
}
```

The plugin automatically integrates Rust unit tests into the Hardhat test suite. You can run them directly using the Hardhat test command from the project root:

```bash
npx hardhat test --skip-solidity-tests
```

These tests verify:

1. Random number generation with different seeds
2. Deterministic behavior (same seed produces same output)
3. Proper Solidity ABI encoding/decoding
4. Contract state management

When you run `npx hardhat test`, you'll see output similar to:

```bash
  Rust Contract: random-generator
    ✔ tests::test_deterministic_output
    ✔ tests::test_random_generation

  2 passing (2ms)
```

### Plugin Configuration

The plugin provides a comprehensive configuration system to customize compilation, testing, and deployment settings. You can define global settings and override them for specific contracts. By default default configuration is used, so in most cases, you don't need to provide any configuration. However, you can customize the settings by adding a `fluent` key to your `hardhat.config.ts`:

```typescript
const userConfig: UserConfig = {
  // Compilation settings
  compile?: {
    target: "custom-target", // Target for compilation, e.g., "wasm32-unknown-unknown"
    debug: true,            // Enable or disable debug information
    options: ["--custom-option"], // Additional options for the compiler
  },

  // Test settings
  test?: {
    command: "cargo test",        // Command to run tests
    options: ["--test-option"],   // Additional options for the test command
    timeout: 1000,                // Timeout for tests in milliseconds
    retries: 1,                   // Number of retries for failed tests
  },

  // Node settings
  node?: {
    docker: {
      image: "custom-docker-image", // Docker image for the node
      tag: "custom-tag",            // Docker image tag
      pull: "always",               // Pull policy: "always", "if-not-present", or "never"
    },
    network: {
      chain: "custom-chain",        // Blockchain chain identifier
      dataDir: "./custom-datadir",  // Directory for blockchain data
      blockTime: "10sec",           // Block time in seconds
      port: 30310,                  // Port for P2P communication
      httpPort: 8550,               // HTTP port for RPC communication
    },
  },

  // Environment variables
  env?: {
    CUSTOM_ENV: "custom-value", // User-defined environment variables
    RUST_LOG: "debug",          // Log level for Rust components
  },

  // Contract-specific configuration
  contracts?: [
    {
      path: "test/contract/path", // Path to the contract source
      interface: {
        path: "ITestContract.sol", // Path to the contract's interface
      },
      compile: {
        target: "contract-target",   // Contract-specific compilation target
        debug: false,                // Override debug setting for this contract
        options: ["--contract-option"], // Specific compiler options for this contract
      },
      test: {
        command: "cargo test",         // Command to test this contract
        options: ["--contract-test"],  // Specific test options for this contract
        timeout: 2000,                 // Contract-specific test timeout
        retries: 0,                    // Retries for this contract
      },
    },
    {
      path: "test/contract/path2", // Path to a second contract
      interface: {
        path: "ITestContract2.sol", // Path to the second contract's interface
      },
      // Inherits global compile and test settings if not explicitly overridden
    },
  ],

  // Discovery settings
  discovery?: {
    enabled: false,                 // Enable or disable auto-discovery
    paths: ["custom-path"],        // Paths to search for contracts
    ignore: ["**/ignore/**"],      // Patterns to exclude during discovery
  },
};

```

### Test Options

The plugin provides several testing options:

- `--skip-solidity-tests`: Run only Rust tests
- `--skip-wasm-tests`: Run only Solidity tests
- No flags: Run all tests

Next, we'll look at writing integration tests that demonstrate the interaction between our Solidity and Rust contracts.

### Integration Testing

Before writing integration tests, we need to generate TypeScript types for our contracts:

```bash
npx hardhat typechain
```

Now let's write integration tests to verify the interaction between our Solidity lottery contract and Rust random number generator.

> [!IMPORTANT]
> Due to WASM execution requirements, integration tests must run on either:
>
> - Local Fluent node
> - Fluent devnet
>
> The Hardhat Network does not support WASM execution.

Create `test/Lottery.test.ts`:

```typescript
import { expect } from "chai";
import { ethers, artifacts, network } from "hardhat";
import { Lottery, IRandomGenerator } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { EventLog, ContractTransactionReceipt } from "ethers";

describe("Lottery Integration Tests", function () {
  let lottery: Lottery;
  let randomGenerator: IRandomGenerator;
  let deployer: HardhatEthersSigner;
  let participant1: HardhatEthersSigner;
  let participant2: HardhatEthersSigner;
  let lotteryEndTime: number;

  this.timeout(120000);

  async function logEvents(receipt: ContractTransactionReceipt) {
    for (const log of receipt.logs) {
      try {
        if (log instanceof EventLog) {
          console.log(`Event ${log.eventName}:`, {
            args: log.args,
            address: log.address,
          });
        } else {
          const parsed = lottery.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          if (parsed) {
            console.log(`Event ${parsed.name}:`, {
              args: parsed.args,
              address: log.address,
            });
          }
        }
      } catch (e) {
        console.log("Could not parse log:", log);
      }
    }
  }

  async function participateInLottery(
    participant: HardhatEthersSigner,
    ticketPrice: bigint
  ) {
    const address = await participant.getAddress();
    console.log("Address:", address);
    console.log(
      "Balance:",
      ethers.formatEther(await participant.provider.getBalance(address)),
      "ETH"
    );

    try {
      const tx = await lottery.connect(participant).participate({
        value: ticketPrice,
        gasLimit: 200000,
      });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();

      if (!receipt) throw new Error("Transaction receipt is null");
      if (!receipt.status) throw new Error("Transaction failed");

      await logEvents(receipt);
      return receipt;
    } catch (error: any) {
      if (error.transaction) {
        const tx = await ethers.provider.getTransaction(error.transaction.hash);
        const receipt = await tx?.wait();
        console.error("Transaction details:", {
          hash: error.transaction.hash,
          receipt: receipt,
        });
      }
      throw error;
    }
  }

  async function waitForLotteryEnd() {
    while (true) {
      const latestBlock = await ethers.provider.getBlock("latest");
      if (!latestBlock) throw new Error("Couldn't get latest block");

      const timeLeft = lotteryEndTime - latestBlock.timestamp;
      console.log(
        `Block ${latestBlock.number}, time left: ${timeLeft} seconds`
      );

      if (latestBlock.timestamp >= lotteryEndTime) break;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  async function selectWinner() {
    const seed = ethers.hexlify(ethers.randomBytes(32));
    console.log("Selecting winner with seed:", seed);

    const selectTx = await lottery.connect(deployer).selectWinner(seed);
    const receipt = await selectTx.wait();

    if (!receipt) throw new Error("Winner selection receipt is null");
    await logEvents(receipt);

    const winnerEvent = receipt.logs.find(
      (log): log is EventLog =>
        log instanceof EventLog && log.eventName === "WinnerSelected"
    );

    if (!winnerEvent) throw new Error("WinnerSelected event not found");
    return {
      winner: winnerEvent.args[0],
      prize: winnerEvent.args[1],
    };
  }

  before(async function () {
    if (network.name === "hardhat") {
      console.warn("⚠️  WASM tests require a Fluent-compatible network");
      this.skip();
      return;
    }

    [deployer, participant1, participant2] = await ethers.getSigners();

    const randomGeneratorArtifact = await artifacts.readArtifact(
      "random_generator.wasm"
    );
    const RandomGeneratorFactory = await ethers.getContractFactoryFromArtifact(
      randomGeneratorArtifact
    );
    const randomGeneratorContract = await RandomGeneratorFactory.deploy();
    await randomGeneratorContract.waitForDeployment();
    randomGenerator = randomGeneratorContract as unknown as IRandomGenerator;

    const latestBlock = await ethers.provider.getBlock("latest");
    if (!latestBlock?.timestamp) throw new Error("No block timestamp");

    const blockTimeInSeconds = 5;
    const blocksUntilEnd = 4;
    lotteryEndTime =
      latestBlock.timestamp + blocksUntilEnd * blockTimeInSeconds + 2;

    const ticketPrice = ethers.parseEther("0.1");
    lottery = (await ethers
      .getContractFactory("Lottery")
      .then((factory) =>
        factory.deploy(
          lotteryEndTime,
          randomGenerator.getAddress(),
          ticketPrice
        )
      )) as Lottery;
    await lottery.waitForDeployment();
  });

  it("should allow participation and winner selection", async function () {
    const ticketPrice = await lottery.ticketPrice();

    await participateInLottery(participant1, ticketPrice);
    const count1 = await lottery.getParticipantCount();
    console.log("Participants after first ticket:", count1);

    await participateInLottery(participant2, ticketPrice);
    const count2 = await lottery.getParticipantCount();
    console.log("Participants after second ticket:", count2);

    const participants = await lottery.getParticipants();
    console.log("All participants:", participants);

    expect(await lottery.getParticipantCount()).to.equal(2n);

    await waitForLotteryEnd();

    const { winner, prize } = await selectWinner();
    console.log("Winner:", winner);
    console.log("Prize amount:", ethers.formatEther(prize), "ETH");

    const participantAddresses = [
      await participant1.getAddress(),
      await participant2.getAddress(),
    ].map((addr) => addr.toLowerCase());

    expect(participantAddresses).to.include(winner.toLowerCase());
  });
});
```

### Running Integration Tests

To run the tests, first start a local Fluent node:

```bash
docker run --rm -it -p 8545:8545 ghcr.io/fluentlabs-xyz/fluent:latest \
  --chain=dev \
  node \
  --datadir=./datadir \
  --dev \
  --full \
  --http \
  --http.addr=0.0.0.0 \
  --port=30305 \
  --engine.legacy
```

Then run the tests:

```bash
npx hardhat test --network local
```

### Key Testing Points

The integration tests verify:

1. Contract deployment and initialization
2. Participation in the lottery
3. Random number generation across contracts
4. Winner selection process
5. Event emission
6. Cross-contract interaction between Solidity and Rust

### Testing Considerations

1. **Network Requirements**
   - Tests must run on Fluent-compatible networks
   - Local node recommended for development
   - Devnet available for staging

2. **Time Management**
   - Local network allows time manipulation
   - Devnet requires actual time passage

3. **Gas and Values**
   - Use appropriate ETH values for ticket prices
   - Consider gas costs for complex operations

4. **Error Handling**
   - Test invalid inputs and edge cases
   - Verify proper error messages

Next, we'll look at deploying our contracts to the Fluent network.
