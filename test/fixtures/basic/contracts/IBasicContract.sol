// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

// IBasicContract.sol
interface IBasicContract {
  function greeting(string memory message) external view returns (string memory);
}
