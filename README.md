# hardhat-plugin

_A Hardhat plugin for seamless development of blended smart contract applications that combine Rust and Solidity contracts in the Fluent blockchain ecosystem._

- [hardhat-plugin](#hardhat-plugin)
  - [What](#what)
  - [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Documentation](#documentation)
    - [Tasks](#tasks)
      - [`hardhat compile` and `compile:rust`](#hardhat-compile-and-compilerust)
      - [`hardhat test` and `test:rust`](#hardhat-test-and-testrust)
      - [`hardhat node:fluent`](#hardhat-nodefluent)
      - [`hardhat clean`](#hardhat-clean)
    - [Configuration](#configuration)
      - [Basic Configuration](#basic-configuration)
      - [Contract Discovery](#contract-discovery)
        - [Auto-Discovery](#auto-discovery)
        - [Manual Contract Configuration](#manual-contract-configuration)
      - [Global Settings](#global-settings)
        - [Compilation Settings](#compilation-settings)
        - [Test Settings](#test-settings)
        - [Local Node Settings](#local-node-settings)
        - [Environment Variables](#environment-variables)
      - [Configuration Inheritance](#configuration-inheritance)
      - [Default Values](#default-values)
  - [Project Structure](#project-structure)
  - [Examples](#examples)
    - [Lottery Example](#lottery-example)
  - [Notes](#notes)
  - [Learn More](#learn-more)
  - [Contributing](#contributing)
    - [Code of Conduct](#code-of-conduct)
    - [Release Guide](#release-guide)
  - [License](#license)

## What

This plugin simplifies the development of blended applications by:

- Enabling seamless integration between Rust and Solidity contracts
- Automatically compiling Rust contracts to WebAssembly
- Generating Hardhat-compatible artifacts
- Providing unified testing environment for both Rust and Solidity contracts

## Installation

```bash
# npm
npm install @fluent.xyz/hardhat-plugin

# pnpm
pnpm add @fluent.xyz/hardhat-plugin
```

Import the plugin in your `hardhat.config.js`:

```js
require("@fluent.xyz/hardhat-plugin");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@fluent.xyz/hardhat-plugin";
```

## Prerequisites

- Node.js 16+
- [pnpm](https://pnpm.io/) 3+
- Rust and Cargo
- Docker (for local testing with Fluent node)

## Documentation

### Tasks

The plugin adds several tasks to Hardhat for working with Rust contracts:

#### `hardhat compile` and `compile:rust`

Compiles Rust contracts to WebAssembly and generates Hardhat artifacts. The `compile` task is extended to include Rust compilation in the standard Hardhat compilation flow.

```bash
npx hardhat compile          # Compile full project (Solidity + Rust)
npx hardhat compile:rust     # Compile only Rust contracts
```

#### `hardhat test` and `test:rust`

Executes Rust contract unit tests and presents results in Mocha format. The `test` task includes Rust tests in the standard Hardhat test suite.

```bash
npx hardhat test                         # Run all tests
npx hardhat test --network local         # Run with local Fluent node
npx hardhat test --skip-wasm-tests       # Skip Rust tests
npx hardhat test --skip-solidity-tests   # Skip Solidity tests
```

Note: The Hardhat network doesn't support WASM execution - use Fluent local node for running tests.

#### `hardhat node:fluent`

Starts a local Fluent node for development and testing.

```bash
npx hardhat node:fluent         # Start local node with default configuration
```

The node runs in a Docker container and is preconfigured for development use. Node data (chain data, logs, and configurations) is persisted in the `.local-node` directory, which should be added to your `.gitignore`:

```bash
# .gitignore
.local-node/
```

This ensures consistent state between restarts while keeping repository clean from local development data.

#### `hardhat clean`

Removes compilation artifacts and build directories:

- Rust `target` directories
- Generated WASM files
- Hardhat artifacts

```bash
npx hardhat clean         # Clean build artifacts
```

All tasks can be configured through the plugin settings in your `hardhat.config.ts`. See the [Configuration](#configuration) section for details.

### Configuration

The plugin can be configured through the `hardhat.config.ts` file. All configuration options are optional and come with sensible defaults.

#### Basic Configuration

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@fluent.xyz/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  fluent: {
    // Plugin configuration goes here
  }
};

export default config;
```

#### Contract Discovery

The plugin offers two ways to configure contracts: automatic discovery (default) and manual configuration.

##### Auto-Discovery

By default, the plugin automatically discovers Rust contracts in your project - you don't need to configure anything. The following configuration is applied automatically:

```typescript
fluent: {
  discovery: {
    enabled: true,              // Enable/disable auto-discovery
    paths: ['contracts', 'src'], // Directories to search
    ignore: ['**/target/**', '**/node_modules/**'] // Patterns to ignore
  }
}
```

This means writing:

```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.19",
  fluent: {}
};
```

is equivalent to explicitly configuring auto-discovery as shown above.

You can customize these settings by overriding any of the discovery options:

```typescript
fluent: {
  discovery: {
    paths: ['contracts', 'custom-contracts'], // Add custom search paths
    ignore: ['**/target/**', '**/tests/**']  // Custom ignore patterns
  }
}
```

##### Manual Contract Configuration

You can explicitly configure contracts instead of using auto-discovery. When contracts are manually configured, auto-discovery is automatically disabled.

```typescript
fluent: {
  contracts: [
    {
      path: "contracts/my-contract",
      interface: {
        path: "contracts/IMyContract.sol"
      },
      // Optional contract-specific settings
      compile: {
        debug: false,            // Override global compile settings
      },
      test: {
        timeout: 10000,         // Override global test settings
      }
    }
  ]
}
```

#### Global Settings

##### Compilation Settings

Control how your Rust contracts are compiled to WebAssembly:

```typescript
fluent: {
  compile: {
    target: "wasm32-unknown-unknown",  // Target architecture
    debug: false,                      // Enable debug mode
    options: [                         // Cargo build options
      "--release",
      "--target=wasm32-unknown-unknown",
      "--no-default-features",
      "-C link-arg=-zstack-size=131072",
      "-C target-feature=+bulk-memory",
      "-C opt-level=z",
      "-C strip=symbols"
    ]
  }
}
```

##### Test Settings

Configure how contract tests are executed:

```typescript
fluent: {
  test: {
    command: "cargo test",            // Test command
    options: ["--release"],           // Command options
    timeout: 5000,                    // Test timeout in milliseconds
    retries: 0                        // Number of retry attempts
  }
}
```

##### Local Node Settings

Configure the local Fluent node for development and testing:

```typescript
fluent: {
  node: {
    docker: {
      image: "ghcr.io/fluentlabs-xyz/fluent",
      tag: "latest",
      pull: "if-not-present"         // Docker pull policy
    },
    network: {
      chain: "dev",                  // Chain configuration
      dataDir: "./datadir",          // Data directory
      blockTime: "5sec",             // Block time
      port: 30305,                   // P2P port
      httpPort: 8545                 // HTTP RPC port
    }
  }
}
```

##### Environment Variables

Set environment variables for the compilation and test processes:

```typescript
fluent: {
  env: {
    RUST_LOG: "info"
    // Add any other environment variables
  }
}
```

#### Configuration Inheritance

Settings are merged with the following precedence (highest to lowest):

1. Contract-specific settings (`contracts[].compile`, `contracts[].test`)
2. Global plugin settings (`compile`, `test`, etc.)
3. Default settings

Example of inheritance:

```typescript
fluent: {
  // Global settings
  compile: {
    debug: true
  },
  test: {
    timeout: 5000
  },
  // Contract-specific settings override global ones
  contracts: [
    {
      path: "contracts/contract-a",
      interface: {
        path: "contracts/IContractA.sol"
      },
      compile: {
        debug: false     // Overrides global debug setting
      },
      test: {
        timeout: 10000  // Overrides global timeout setting
      }
    }
  ]
}
```

#### Default Values

The plugin comes with the following default settings:

```typescript
{
  compile: {
    target: "wasm32-unknown-unknown",
    debug: false,
    options: [
      "--release",
      "--target=wasm32-unknown-unknown",
      "--no-default-features",
      "-C link-arg=-zstack-size=131072",
      "-C target-feature=+bulk-memory",
      "-C opt-level=z",
      "-C strip=symbols",
    ],
  },
  test: {
    command: "cargo test",
    options: ["--release", "--test-threads=1"],
    timeout: 5000,
    retries: 0,
  },
  node: {
    docker: {
      image: "ghcr.io/fluentlabs-xyz/fluent",
      tag: "latest",
      pull: "if-not-present",
    },
    network: {
      chain: "dev",
      dataDir: "./datadir",
      blockTime: "5sec",
      port: 30305,
      httpPort: 8545,
    },
  },
  discovery: {
    enabled: true,
    paths: ["contracts", "src"],
    ignore: ["**/target/**", "**/node_modules/**"],
  },
  env: {
    RUST_LOG: "info",
  },
}
```

## Project Structure

Recommended project structure:

```bash
contracts/
├── IRandomGenerator.sol      # Solidity interface for Rust contract
├── Lottery.sol              # Solidity contract
└── random-generator/        # Rust contract
    ├── Cargo.toml
    └── lib.rs
test/
├── Lottery.ts              # Integration tests
└── RandomGenerator.ts
hardhat.config.ts          # Hardhat configuration
```

## Examples

Check out our example projects in the `examples` directory:

### Lottery Example

A complete lottery application demonstrating:

- Integration between Rust and Solidity contracts
- Random number generation in Rust
- Contract deployment using Ignition
- Integration tests
- Local development setup

```bash
cd examples/lottery
pnpm install
pnpm hardhat compile
# In a separate terminal
pnpm hardhat node:fluent
pnpm hardhat test --network local
```

## Notes

- The Hardhat network doesn't support WASM execution - use Fluent local node

## Learn More

- [Fluent Documentation](https://docs.fluentlabs.xyz)
- [Developer Preview](https://docs.fluentlabs.xyz/learn/developer-preview/connect-to-the-fluent-devnet)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

### Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/). We expect all contributors to be respectful and inclusive in all interactions. Key points:

- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Release Guide

1. **Prepare the Codebase**  
   Ensure the code is ready for release:
   - Run `pnpm run lint` to check for linting issues.
   - Run `pnpm run lint:fix` to automatically fix formatting issues.
   - Run all tests: `pnpm run test`.

2. **Build the Project**  
   Run `pnpm run build` to compile the project.

3. **Update the Version**  
   Choose the appropriate version bump:
   - For a patch release: `pnpm run version:patch`
   - For a minor release: `pnpm run version:minor`
   - For a major release: `pnpm run version:major`

4. **Push Changes**  
   - Push the updated code and tags to the main branch:

     ```bash
     git push origin main --follow-tags
     ```

5. **Automatic Deployment**  
   GitHub Actions will handle publishing the new version upon detecting the pushed tag.

That’s it! 🎉

## License

MIT License
