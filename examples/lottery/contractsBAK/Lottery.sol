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

    event WinnerSelected(
        address indexed winner,
        uint256 amount,
        uint256 timestamp
    );
    event ParticipantAdded(address indexed participant, uint256 ticketNumber);
    event LotteryFinished(uint256 timestamp);

    /// @notice Creates a new lottery
    /// @param _endTime Unix timestamp when the lottery ends and winner can be selected
    /// @param _randomGenerator Address of the Rust random number generator contract
    /// @param _ticketPrice Price in wei that each participant must pay to enter
    /// @dev All parameters are immutable and cannot be changed after deployment
    constructor(
        uint256 _endTime,
        address _randomGenerator,
        uint256 _ticketPrice
    ) Ownable(msg.sender) {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(
            _randomGenerator != address(0),
            "Invalid random generator address"
        );
        require(_ticketPrice > 0, "Ticket price must be greater than 0");

        endTime = _endTime;
        randomGenerator = IRandomGenerator(_randomGenerator);
        ticketPrice = _ticketPrice;
        isActive = true;
    }

    /// @notice Allows users to enter the lottery by paying the ticket price
    /// @dev Participants can enter multiple times by calling this function repeatedly
    function participate() external payable {
        require(isActive, "Lottery is not active");
        require(block.timestamp < endTime, "Lottery is already finished");
        require(msg.value == ticketPrice, "Incorrect ticket price");

        participants.push(msg.sender);
        emit ParticipantAdded(msg.sender, participants.length);
    }

    /// @notice Selects a winner using the Rust random number generator
    /// @param seed Initial value for random number generation
    /// @dev Can only be called by the owner after the lottery end time
    /// @dev Uses Checks-Effects-Interactions pattern to prevent reentrancy
    function selectWinner(uint256 seed) external onlyOwner nonReentrant {
        require(isActive, "Lottery is not active");
        require(block.timestamp >= endTime, "Lottery is still in progress");
        require(participants.length > 0, "No participants");

        uint256 winnerIndex = randomGenerator.getRandomNumber(seed) %
            participants.length;
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
    /// @return The current number of lottery participants
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    /// @notice Returns the list of all participants
    /// @return Array containing addresses of all participants
    /// @dev Participants may appear multiple times if they bought multiple tickets
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    /// @notice Calculates time remaining until lottery can be finalized
    /// @return Time remaining in seconds, returns 0 if lottery end time has passed
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }
}
