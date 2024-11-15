#![cfg_attr(not(feature = "std"), no_std)]
extern crate alloc;
extern crate fluentbase_sdk;

use alloc::string::String;
use fluentbase_sdk::{
    basic_entrypoint,
    derive::{function_id, router, Contract},
    SharedAPI,
};

#[derive(Contract)]
struct ROUTER<SDK> {
    sdk: SDK,
}

pub trait RouterAPI {
    fn greeting(&self, message: String) -> String;
}

#[router(mode = "solidity")]
impl<SDK: SharedAPI> RouterAPI for ROUTER<SDK> {
    #[function_id("greeting(string)")]
    fn greeting(&self, message: String) -> String {
        message
    }
}

impl<SDK: SharedAPI> ROUTER<SDK> {
    fn deploy(&self) {
        // any custom deployment logic here
    }
}

basic_entrypoint!(ROUTER);

#[cfg(test)]
mod tests {
    use super::*;
    use fluentbase_sdk::{journal::JournalState, runtime::TestingContext};

    #[test]
    fn test_contract_works() {
        let s = String::from("Hello, World!!");

        let greeting_call = GreetingCall::new((s.clone(),));

        let input = greeting_call.encode();

        let extected_input = "f8194e480000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e48656c6c6f2c20576f726c642121000000000000000000000000000000000000";

        assert_eq!(hex::encode(&input), extected_input);

        println!("Input: {:?}", hex::encode(&input));
        println!("call contract...");
        let sdk = TestingContext::empty().with_input(input);
        let mut router = ROUTER::new(JournalState::empty(sdk.clone()));
        router.deploy();
        router.main();

        let encoded_output = &sdk.take_output();
        println!("output: {:?}", hex::encode(&encoded_output));
        let output = GreetingReturn::decode(&encoded_output.as_slice()).unwrap();
        println!("output: {:?}", &output.0);
        assert_eq!(output.0 .0, s);
    }
    #[test]
    fn test_contract_works_with_long_msg() {
        let s = String::from("A".repeat(1000));

        let greeting_call = GreetingCall::new((s.clone(),));

        let input = greeting_call.encode();

        println!("Input: {:?}", hex::encode(&input));
        println!("call contract...");
        let sdk = TestingContext::empty().with_input(input);
        let mut router = ROUTER::new(JournalState::empty(sdk.clone()));
        router.deploy();
        router.main();

        let encoded_output = &sdk.take_output();
        println!("output: {:?}", hex::encode(&encoded_output));
        let output = GreetingReturn::decode(&encoded_output.as_slice()).unwrap();
        println!("output: {:?}", &output.0);
        assert_eq!(output.0 .0, s);
        assert_eq!(true, true);
    }
}
