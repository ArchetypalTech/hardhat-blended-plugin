import { expect } from 'chai';
import { ethers, artifacts, network } from 'hardhat';
import { Lottery, IRandomGenerator } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { EventLog, ContractTransactionReceipt } from 'ethers';

describe('Lottery Integration Tests', function () {
  let lottery: Lottery;
  let randomGenerator: IRandomGenerator;
  let deployer: HardhatEthersSigner;
  let participant1: HardhatEthersSigner;
  let participant2: HardhatEthersSigner;
  let lotteryEndTime: number;

  this.timeout(120000);

  async function logEvents(receipt: ContractTransactionReceipt) {
    for (const log of receipt.logs) {
      try {
        if (log instanceof EventLog) {
          console.log(`Event ${log.eventName}:`, {
            args: log.args,
            address: log.address,
          });
        } else {
          const parsed = lottery.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });
          if (parsed) {
            console.log(`Event ${parsed.name}:`, {
              args: parsed.args,
              address: log.address,
            });
          }
        }
      } catch (e) {
        console.log('Could not parse log:', log);
      }
    }
  }

  async function participateInLottery(participant: HardhatEthersSigner, ticketPrice: bigint) {
    const address = await participant.getAddress();
    console.log('Address:', address);
    console.log(
      'Balance:',
      ethers.formatEther(await participant.provider.getBalance(address)),
      'ETH',
    );

    try {
      const tx = await lottery.connect(participant).participate({
        value: ticketPrice,
        gasLimit: 200000,
      });

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();

      if (!receipt) throw new Error('Transaction receipt is null');
      if (!receipt.status) throw new Error('Transaction failed');

      await logEvents(receipt);
      return receipt;
    } catch (error: any) {
      if (error.transaction) {
        const tx = await ethers.provider.getTransaction(error.transaction.hash);
        const receipt = await tx?.wait();
        console.error('Transaction details:', {
          hash: error.transaction.hash,
          receipt: receipt,
        });
      }
      throw error;
    }
  }

  async function waitForLotteryEnd() {
    while (true) {
      const latestBlock = await ethers.provider.getBlock('latest');
      if (!latestBlock) throw new Error("Couldn't get latest block");

      const timeLeft = lotteryEndTime - latestBlock.timestamp;
      console.log(`Block ${latestBlock.number}, time left: ${timeLeft} seconds`);

      if (latestBlock.timestamp >= lotteryEndTime) break;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  async function selectWinner() {
    const seed = ethers.hexlify(ethers.randomBytes(32));
    console.log('Selecting winner with seed:', seed);

    const selectTx = await lottery.connect(deployer).selectWinner(seed);
    const receipt = await selectTx.wait();

    if (!receipt) throw new Error('Winner selection receipt is null');
    await logEvents(receipt);

    const winnerEvent = receipt.logs.find(
      (log): log is EventLog => log instanceof EventLog && log.eventName === 'WinnerSelected',
    );

    if (!winnerEvent) throw new Error('WinnerSelected event not found');
    return {
      winner: winnerEvent.args[0],
      prize: winnerEvent.args[1],
    };
  }

  before(async function () {
    if (network.name === 'hardhat') {
      console.warn('⚠️  WASM tests require a Fluent-compatible network');
      this.skip();
    }

    [deployer, participant1, participant2] = await ethers.getSigners();

    const randomGeneratorArtifact = await artifacts.readArtifact('RandomGenerator');
    const RandomGeneratorFactory =
      await ethers.getContractFactoryFromArtifact(randomGeneratorArtifact);
    const randomGeneratorContract = await RandomGeneratorFactory.deploy();
    await randomGeneratorContract.waitForDeployment();
    randomGenerator = randomGeneratorContract as unknown as IRandomGenerator;

    const latestBlock = await ethers.provider.getBlock('latest');
    if (!latestBlock?.timestamp) throw new Error('No block timestamp');

    const blockTimeInSeconds = 5;
    const blocksUntilEnd = 4;
    lotteryEndTime = latestBlock.timestamp + blocksUntilEnd * blockTimeInSeconds + 2;

    const ticketPrice = ethers.parseEther('0.1');
    lottery = (await ethers
      .getContractFactory('Lottery')
      .then((factory) =>
        factory.deploy(lotteryEndTime, randomGenerator.getAddress(), ticketPrice),
      )) as Lottery;
    await lottery.waitForDeployment();
  });

  it('should allow participation and winner selection', async function () {
    const ticketPrice = await lottery.ticketPrice();

    await participateInLottery(participant1, ticketPrice);
    const count1 = await lottery.getParticipantCount();
    console.log('Participants after first ticket:', count1);

    await participateInLottery(participant2, ticketPrice);
    const count2 = await lottery.getParticipantCount();
    console.log('Participants after second ticket:', count2);

    const participants = await lottery.getParticipants();
    console.log('All participants:', participants);

    expect(await lottery.getParticipantCount()).to.equal(2n);

    await waitForLotteryEnd();

    const { winner, prize } = await selectWinner();
    console.log('Winner:', winner);
    console.log('Prize amount:', ethers.formatEther(prize), 'ETH');

    const participantAddresses = [
      await participant1.getAddress(),
      await participant2.getAddress(),
    ].map((addr) => addr.toLowerCase());

    expect(participantAddresses).to.include(winner.toLowerCase());
  });
});
