// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IRandomGenerator {
    function getRandomNumber(uint seed) external view returns (uint);
}
