# hardhat-compile-to-wasm

_A Hardhat plugin to compile Rust contracts to WebAssembly (WASM) and generate Hardhat artifacts._

## What

This plugin simplifies the process of compiling Rust contracts to WebAssembly (WASM) and generating corresponding Hardhat artifacts, allowing seamless integration of Rust-based smart contracts in your Hardhat project. As simple as running `npx hardhat compile`, this plugin will compile your Solidity contracts as usual and automatically compile your Rust contracts to WASM, generating the corresponding artifacts in the Hardhat artifacts directory.

## Installation

Follow these steps to install the plugin:

```bash
npm install hardhat-compile-to-wasm
```

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-compile-to-wasm");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-compile-to-wasm";
```

## Required plugins

This plugin requires the following Hardhat plugins:

- [@nomiclabs/hardhat-web3](https://github.com/nomiclabs/hardhat/tree/master/packages/hardhat-web3)

## Tasks

This plugin adds the `compile-to-wasm` subtask and extends the `compile` task to include Rust contracts compilation:

- **compile-to-wasm**: Compiles the Rust contracts to WebAssembly and generates Hardhat artifacts.

To see the help run:
`npx hardhat help compile-to-wasm`;

## Environment extensions

This plugin does not extend the Hardhat Runtime Environment.

## Configuration

This plugin extends the `HardhatUserConfig` with an optional `compileToWasmConfig` field, which is an array of objects, each representing a contract compile configuration.

Each configuration object should have the following fields:

- `contractDir`: The relative path to the Rust contract directory from the project root. For example, `"contracts/my_contract"`. Keep in mind that the Rust contract directory should contain a `Cargo.toml` file. And contract name should be the same as the rust package name in the `Cargo.toml` file.
- `interfacePath`: The relative path to the Solidity interface that corresponds to the Rust contract. For example, `"contracts/IMyContract.sol"`.

Here is an example of how to set it:

```ts
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-compile-to-wasm";

const config: HardhatUserConfig = {
  compileToWasmConfig: [
    {
      contractDir: "./contracts/rust/contract",
      interfacePath: "./contracts/IRustContract.sol",
    },
  ],
};

export default config;
```

## Usage

To use this plugin, simply run the compile task, and it will automatically compile your Rust contracts to WASM and generate the corresponding artifacts:

```bash
npx hardhat compile
```

The plugin will look for the `compileToWasmConfig` field in your `hardhat.config.js` or `hardhat.config.ts` and compile the specified Rust contracts, generating artifacts in the Hardhat artifacts directory.

### Example Usage

Here is an example of a `hardhat.config.ts` that includes the plugin configuration:

```ts
import { HardhatUserConfig } from "hardhat/types";
import "hardhat-compile-to-wasm";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  compileToWasmConfig: [
    {
      contractDir: "contracts/my_contract",
      interfacePath: "contracts/IMyContract.sol"
    }
  ]
};

export default config;
```

This configuration will ensure that your Rust contracts are compiled to WASM and the corresponding artifacts are generated whenever you run `npx hardhat compile`.
