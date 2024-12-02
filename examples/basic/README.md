# Basic WASM Contract Example

A minimal example project showcasing WASM smart contract development with Hardhat and Fluent blockchain, using the `hardhat-plugin` plugin.

## Project Structure

```
contracts/
├── IBasicContract.sol         # Solidity interface for the WASM contract
└── basic-contract/            # Rust WASM contract implementation
    ├── Cargo.toml             # Rust package configuration
    └── lib.rs                 # Contract source code with Rust tests
test/
└── BasicContract.test.ts      # Integration tests
```

## Prerequisites

- Node.js 16+
- [pnpm](https://pnpm.io/)
- Rust and Cargo
- Docker (for local testing)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment:

```bash
cp .env.example .env
```

## Testing

The test suite includes both Rust unit tests and TypeScript integration tests. They can be run together or separately.

### Run All Tests

This will run both Rust unit tests and integration tests:

```bash
pnpm hardhat test --network local
```

Example output:

```
Compiling Rust contracts
artifactDir contracts/basic_contract.wasm
    Finished `release` profile [optimized] target(s) in 0.31s
Compiled Rust contract: basic_contract.wasm
✨ All contracts compiled successfully

BasicContract
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployer balance: 99999.9290455009895356 ETH
Contract deployed to: 0x0165878A594ca255338adfa4d48449f69242Eb8F
    ✔ should return greeting message
    ✔ should handle empty message
    ✔ should handle long message

Rust Contract: basic-contract
    ✔ tests::test_contract_works
    ✔ tests::test_contract_works_with_long_msg
```

### Test Options

Run only Rust tests:

```bash
pnpm hardhat test --skip-solidity-tests
```

Run only Solidity/Integration tests:

```bash
pnpm hardhat test --skip-wasm-tests --network local
```

## Local Development

### 1. Start Local Fluent Node

```bash
docker run --rm -it -p 8545:8545 ghcr.io/fluentlabs-xyz/fluent:v0.1.0-dev.8 \
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

### 2. Configure Hardhat

```typescript
// hardhat.config.ts
{
  solidity: "0.8.19",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    }
  },
  compileToWasmConfig: [
    {
      contractDir: "contracts/basic-contract",
      interfacePath: "contracts/IBasicContract.sol",
      test: {
        command: "cargo test",  // optional, defaults to "cargo test"
        flags: []               // optional additional flags
      }
    }
  ]
}
```

## Available Commands

```bash
# Compile contracts
pnpm hardhat compile

# Run all tests
# NOTE: we need to use the local network to run solidity tests - the hardhat network doesn't support WASM execution
pnpm hardhat test --network local

# Run specific test suites
pnpm hardhat test --skip-wasm-tests
pnpm hardhat test --skip-solidity-tests --network local

# Clean artifacts and cache
pnpm hardhat clean
```

## Notes

- The Hardhat network cannot be used for testing as it doesn't support WASM execution
- Integration tests require a running Fluent node (local or devnet)
- Rust tests are run automatically as part of the test suite

## Learn More

- [Fluent Documentation](https://docs.fluentlabs.xyz)
- [Fluent Developer Preview](https://docs.fluentlabs.xyz/learn/developer-preview/connect-to-the-fluent-devnet)
