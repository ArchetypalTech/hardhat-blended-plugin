import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const LotteryModule = buildModule("LotteryModule", (m) => {
  const endTime = m.getParameter(
    "endTime",
    Math.floor(Date.now() / 1000) + 60 * 60 // Default to 1 hour from now
  );
  const ticketPrice = m.getParameter(
    "ticketPrice",
    hre.ethers.parseEther("0.1")
  );

  // Deploy RandomGenerator
  const randomGenerator = m.contract("RandomGenerator");

  // Deploy Lottery with RandomGenerator address
  const lottery = m.contract(
    "Lottery",
    [
      endTime,
      randomGenerator,
      ticketPrice,
    ],
  );

  return { randomGenerator, lottery };
});

export default LotteryModule;
