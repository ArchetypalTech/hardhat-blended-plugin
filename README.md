# hardhat-compile-to-wasm

_A Hardhat plugin for seamless compilation and testing of Rust contracts to WebAssembly (WASM) in the Fluent blockchain ecosystem._

## What

This plugin streamlines the development of WASM smart contracts by:

- Automatically compiling Rust contracts to WebAssembly
- Generating Hardhat-compatible artifacts
- Integrating Rust unit tests with Hardhat's test runner
- Supporting both Rust and Solidity tests in a single test suite

## Installation

```bash
# npm
npm install @fluentxyz/hardhat-compile-to-wasm

# pnpm
pnpm add @fluentxyz/hardhat-compile-to-wasm
```

Import the plugin in your `hardhat.config.js`:

```js
require("@fluentxyz/hardhat-compile-to-wasm");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@fluentxyz/hardhat-compile-to-wasm";
```

## Tasks

The plugin adds and modifies the following tasks:

### Compilation

- `compile:rust`: Compiles Rust contracts to WASM
- `compile`: Extended to include WASM compilation after Solidity

### Testing

- `test:rust`: Runs Rust contract tests
- `test`: Extended with flags:
  - `--skip-wasm-tests`: Skip Rust contract tests
  - `--skip-solidity-tests`: Skip Solidity tests

## Prerequisites

- Node.js 16+
- [pnpm](https://pnpm.io/) 3+
- Rust and Cargo
- Docker (for local testing with Fluent node)

## Configuration

The plugin extends `HardhatUserConfig` with the optional `compileToWasmConfig` field:

```typescript
interface ContractCompileConfig {
  contractDir: string;      // Path to Rust contract directory
  interfacePath: string;    // Path to Solidity interface
  test?: {
    command?: string;       // Custom test command (default: "cargo test")
    flags?: string[];       // Additional test flags
  };
}
```

Example configuration:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@fluentxyz/hardhat-compile-to-wasm";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
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
      contractDir: "contracts/my-contract",
      interfacePath: "contracts/IMyContract.sol",
      test: {
        command: "cargo test",  // optional
        flags: ["--release"]    // optional
      }
    }
  ]
};

export default config;
```

## Usage

### Compilation task

```bash
npx hardhat compile
```

This will:

1. Compile Solidity contracts (interfaces)
2. Compile Rust contracts to WASM
3. Generate Hardhat artifacts

### Testing task

```bash
# Run all tests (requires local Fluent node)
npx hardhat test --network local

# Run only Rust tests
npx hardhat test --skip-solidity-tests

# Run only Solidity tests
npx hardhat test --skip-wasm-tests --network local
```

## Example Project

A complete example project is available in `test/fixtures/basic/`, demonstrating:

- Project structure
- Contract implementation
- Test setup
- Local development

Key features:

- Combined Rust and Solidity test suites
- Local Fluent node setup
- Environment configuration
- Integration tests

To try the example:

```bash
cd test/fixtures/basic
pnpm install
pnpm hardhat test --network local
```

## Project Structure

Recommended project structure:

```bash
contracts/
├── IMyContract.sol         # Solidity interface
└── my-contract/            # Rust contract
    ├── Cargo.toml          # Rust config
    └── lib.rs              # Contract implementation
test/
└── MyContract.test.ts      # Integration tests
hardhat.config.ts           # Hardhat configuration
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

### 2. Run Tests

```bash
# Ensure you're using the local network
npx hardhat test --network local
```

## Notes

- The Hardhat network doesn't support WASM execution - use Fluent local node
- Rust tests are automatically integrated into the test suite
- Contract name must match the package name in Cargo.toml

## CI/CD

This project uses GitHub Actions for automated testing and publishing. The workflow is designed to maintain code quality and streamline the release process.

### Continuous Integration

On every pull request and push to main:

- Runs linting checks
- Executes all tests (both Rust and Solidity)
- Verifies build process

### Release Process

We use semantic versioning (MAJOR.MINOR.PATCH). To publish a new version:

1. Ensure you're on the `main` branch with latest changes:

```bash
git checkout main
git pull origin main
```

2. Run tests and create a new version:

```bash
# For patch releases (bug fixes):
pnpm run version:patch

# For minor releases (new features):
pnpm run version:minor

# For major releases (breaking changes):
pnpm run version:major
```

These commands will automatically:

- Run all tests
- Update version in package.json
- Create a git commit for the version bump
- Create a git tag
- Push changes and tags to GitHub

3. The GitHub Actions workflow will then:

- Build the project
- Run final verification tests
- Publish to NPM registry if all checks pass

### Manual Release (if needed)

If you need more control over the release process:

1. Update version in package.json manually
2. Create and push a tag:

```bash
git add package.json
git commit -m "chore: release version x.x.x"
git tag vx.x.x
git push && git push --tags
```

### Release Scripts

Available npm scripts for version management:

- `release` - Run tests and build before release
- `version:patch` - Bump patch version (0.0.X)
- `version:minor` - Bump minor version (0.X.0)
- `version:major` - Bump major version (X.0.0)

### Version Commit Convention

Version commits should follow the format:

```bash
chore: release version x.x.x
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

## Learn More

- [Fluent Documentation](https://docs.fluentlabs.xyz)
- [Developer Preview](https://docs.fluentlabs.xyz/learn/developer-preview/connect-to-the-fluent-devnet)

## License

MIT License - see LICENSE file for details.
