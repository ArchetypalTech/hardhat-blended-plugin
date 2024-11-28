export const DEFAULT_SETTINGS = {
  // By default we use auto discovery for contracts
  contracts: [],
  compile: {
    target: 'wasm32-unknown-unknown',
    debug: false,
    options: [
      '--release',
      '--target=wasm32-unknown-unknown',
      '--no-default-features',
      '-C link-arg=-zstack-size=131072',
      '-C target-feature=+bulk-memory',
      '-C opt-level=z',
      '-C strip=symbols',
    ],
  },
  test: {
    command: 'cargo test',
    options: ['--release', '--test-threads=1'],
    timeout: 5000,
    retries: 0,
  },
  node: {
    docker: {
      image: 'ghcr.io/fluentlabs-xyz/fluent',
      tag: 'latest',
      pull: 'if-not-present' as const,
    },
    network: {
      chain: 'dev',
      dataDir: './datadir',
      blockTime: '5sec',
      port: 30305,
      httpPort: 8545,
    },
  },
  // By default we use auto discovery for contracts
  discovery: {
    enabled: true,
    paths: ['contracts', 'src'],
    ignore: ['**/target/**', '**/node_modules/**'],
  },
  // Environment variables
  env: {
    RUST_LOG: 'info',
  },
};
