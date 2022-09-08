const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
chai.use(solidity);

describe('OG Vesting Contract', () => {
  describe('Non-time Dependent Tests', () => {
    let VestingFactory;
    let vestingC;
    let ruTokenFactory;
    let ruTokenC;
    let recipient;
    let tokenOwner;
    let addr1;

    const vestingAmount = ethers.utils.parseUnits('10000', 'ether');
    const vestingBegin = 1662832835;
    const vestingCliff = 1663437635;
    const vestingEnd = 1665424835;
    beforeEach(async () => {
      [deployer, recipient, tokenOwner, addr1] = await ethers.getSigners();
      ruTokenFactory = await ethers.getContractFactory('GovernanceToken');
      ruTokenC = await ruTokenFactory.deploy(tokenOwner.address, 'Zaru', 'Ru');

      VestingFactory = await ethers.getContractFactory('Vesting');
      vestingC = await VestingFactory.deploy(
        ruTokenC.address,
        recipient.address,
        vestingAmount,
        vestingBegin,
        vestingCliff,
        vestingEnd
      );

      //transfer 10,000 tokens to vesting contract
      await ruTokenC
        .connect(tokenOwner)
        .transfer(vestingC.address, vestingAmount);
    });

    describe('Deployment', () => {
      it('should have set the correct constructor arguments', async () => {
        const ruToken = await vestingC.ruToken();
        const contractRecipient = await vestingC.recipient();
        const contractVestingAmount = await vestingC.vestingAmount();
        const contractVestingBegin = await vestingC.vestingBegin();
        const contractVestingCliff = await vestingC.vestingCliff();
        const contractVestingEnd = await vestingC.vestingEnd();

        expect(ruToken).to.equal(ruTokenC.address);
        expect(contractRecipient).to.equal(recipient.address);
        expect(contractVestingAmount).to.equal(vestingAmount);
        expect(contractVestingBegin).to.equal(vestingBegin);
        expect(contractVestingCliff).to.equal(vestingCliff);
        expect(contractVestingEnd).to.equal(vestingEnd);
      });

      it('should set lastUpdate variable correctly', async () => {
        const vestingBegin = await vestingC.vestingBegin();
        const lastUpdate = await vestingC.lastUpdate();
        expect(lastUpdate).to.equal(vestingBegin);
      });
    });

    describe('setRecipient Functions', () => {
      it('should setRecipeint to a new address', async () => {
        await vestingC.connect(recipient).setRecipient(addr1.address);
        const newRecipient = await vestingC.recipient();
        expect(newRecipient).to.equal(addr1.address);
      });
      it('should revert when setReciept function is called by the non recipient', async () => {
        await expect(
          vestingC.connect(addr1).setRecipient(addr1.address)
        ).to.be.revertedWith('TreasuryVester.setRecipient: unauthorized');
      });
    });

    // it('should set lastUpdate to new block timestamp after transfer', async () => {
    //   const time_travel = 1663437635; // 1 week
    //   await network.provider.send('evm_setNextBlockTimestamp', [time_travel]);
    //   await network.provider.send('evm_mine');

    //   const lastUpdateBeg = await vestingC.lastUpdate();
    //   await vestingC.connect(recipient).claim();

    //   const lastUpdate = await vestingC.lastUpdate();
    //   const expected = lastUpdateBeg.add(time_travel);
    //   expect(lastUpdate).to.be.closeTo(expected, expected.add(1));
    // });
  });

  describe('Time dependent tests', () => {
    let VestingFactory2;
    let vestingC2;
    let ruTokenFactory2;
    let ruTokenC2;
    let recipient;
    let tokenOwner;

    const vestingAmount = ethers.utils.parseUnits('10000', 'ether');
    const vestingBegin = 1662832835;
    const vestingCliff = 1663437635;
    const vestingEnd = 1665424835;

    before(async () => {
      [deployer, recipient, tokenOwner, addr1] = await ethers.getSigners();
      ruTokenFactory2 = await ethers.getContractFactory('GovernanceToken');
      ruTokenC2 = await ruTokenFactory2.deploy(tokenOwner.address, 'Zaru', 'Ru');

      VestingFactory2 = await ethers.getContractFactory('Vesting');
      vestingC2 = await VestingFactory2.deploy(
        ruTokenC2.address,
        recipient.address,
        vestingAmount,
        vestingBegin,
        vestingCliff,
        vestingEnd
      );

      //transfer 10,000 tokens to vesting contract
      await ruTokenC2
        .connect(tokenOwner)
        .transfer(vestingC2.address, vestingAmount);
    });

    describe('claim function', () => {
      it('should revert with message if vestingCliff time not met', async () => {
        expect(vestingC2.connect(recipient).claim()).to.be.revertedWith(
          'TreasuryVester.claim: not time yet'
        );
      });

      it('1should transfer correct amount of tokens after vestingCliff finished', async () => {
        const time_travel = 1663437635; // 1 week + 10 hours for current time
        const onePercent = ethers.utils.parseUnits('.01', 'ether');
        await network.provider.send('evm_setNextBlockTimestamp', [time_travel]);
        await network.provider.send('evm_mine');

        await vestingC2.connect(recipient).claim();
        const userBalance = await ruTokenC2.balanceOf(recipient.address);
        const contractStart = await vestingC2.vestingBegin();
        const contractEnd = await vestingC2.vestingEnd();
        const timeStamp = await ethers.provider.getBlock('latest');
        const currentBlock = ethers.BigNumber.from(timeStamp.timestamp);

        const actualBalance = vestingAmount
          .mul(currentBlock.sub(contractStart))
          .div(contractEnd.sub(contractStart));

        expect(userBalance).to.be.within(
          actualBalance,
          actualBalance.add(onePercent)
        );
      });

      it('should transfer correct amount of tokens during a random claim call', async () => {
        const one_week = 7 * 24 * 60 * 60;
        const onePercent = ethers.utils.parseUnits('.0155', 'ether');

        await network.provider.send('evm_increaseTime', [one_week]);
        await network.provider.send('evm_mine');

        // first claim
        await vestingC2.connect(recipient).claim();

        const userBalance = await ruTokenC2.balanceOf(recipient.address);
        const contractStart = await vestingC2.vestingBegin();
        const contractEnd = await vestingC2.vestingEnd();
        const timeStamp = await ethers.provider.getBlock('latest');
        const currentBlock = ethers.BigNumber.from(timeStamp.timestamp);

        const actualBalance = vestingAmount
          .mul(currentBlock.sub(contractStart))
          .div(contractEnd.sub(contractStart));

        expect(userBalance).to.be.within(
          actualBalance,
          actualBalance.add(onePercent)
        );
      });

      it('should transfer correct amount of tokens when vestingContract ends', async () => {
        const time_travel = 1665424835;
        await network.provider.send('evm_setNextBlockTimestamp', [time_travel]);
        await network.provider.send('evm_mine');
        await vestingC2.connect(recipient).claim();
        const userBalance = await ruTokenC2.balanceOf(recipient.address);
        expect(userBalance).to.equal(vestingAmount);
      });

    });
  });
});
