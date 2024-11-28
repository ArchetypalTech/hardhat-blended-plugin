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
        // Initialize ChaCha20 RNG with seed
        let mut rng = ChaCha20Rng::from_seed(seed.to_be_bytes());

        // Generate random bytes and convert to U256
        let mut random_bytes = [0u8; 32];
        rng.fill_bytes(&mut random_bytes);
        U256::from_be_slice(&random_bytes)
    }
}

impl<SDK: SharedAPI> RandomGenerator<SDK> {
    fn deploy(&self) {}
}

basic_entrypoint!(RandomGenerator);

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
