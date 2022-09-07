const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const BN = require('bn.js');
chai.use(solidity);

describe('Zaru Vesting Contract', () => {
  let VestingFactory;
  let vestingC;
  let ruTokenFactory;
  let ruTokenC;
  let recipient;
  let tokenOwner;
  let addr1;

  const vestingCliffDuration = 7 * 24 * 60 * 60; // 7days x 24hours x 60minutes x 60seconds - 1 week
  const vestingDuration = 4 * 7 * 24 * 60 * 60; // 4weeks x 7days x 24hours x 60minutes x 60seconds - 1 month
  const vestingAmount = ethers.utils.parseUnits('10000', 'ether');
  

  beforeEach(async () => {
    [deployer, recipient, tokenOwner, addr1] = await ethers.getSigners();
    ruTokenFactory = await ethers.getContractFactory('GovernanceToken');
    ruTokenC = await ruTokenFactory.deploy(tokenOwner.address, 'Zaru', 'Ru');

    VestingFactory = await ethers.getContractFactory('VestingZaru');
    vestingC = await VestingFactory.deploy(
      ruTokenC.address,
      recipient.address,
      vestingAmount,
      vestingCliffDuration,
      vestingDuration
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
      const contractVestingDuration = await vestingC.vestingDuration();
      const contractVestingCliff = await vestingC.vestingCliff();
      const vestingBegin = await vestingC.vestingBegin();
      let expectedVestingCliff = vestingBegin.add(vestingCliffDuration);

      expect(ruToken).to.equal(ruTokenC.address);
      expect(contractRecipient).to.equal(recipient.address);
      expect(contractVestingAmount).to.equal(vestingAmount);
      expect(contractVestingDuration).to.equal(vestingDuration);
      expect(contractVestingCliff).to.equal(expectedVestingCliff);
    });

    it('should set vestingBegin variable correctly', async () => {
      const vestingBegin = await vestingC.vestingBegin();
      const vestingEnd = await vestingC.vestingEnd();
      const expectedVestingBegin = vestingEnd.sub(vestingDuration);
      expect(vestingBegin).to.equal(expectedVestingBegin);
    });
    it('should set vestingEnd variable correctly - vestingBegin + 1 month', async () => {
      const vestingBegin = await vestingC.vestingBegin();
      const vestingEnd = await vestingC.vestingEnd();
      const expectedVestingEnd = vestingBegin.add(vestingDuration);
      expect(vestingEnd).to.equal(expectedVestingEnd);
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
      ).to.be.revertedWith('ContractVester.setRecipient: unauthorized');
    });
  });

  describe('claim Function', () => {
    it('should revert with message if vestingCliff time not met', async () => {
      expect(vestingC.connect(recipient).claim()).to.be.revertedWith(
        'ContractVester.claim: not time yet'
      );
    });
    it('should transfer correct amount of tokens when vestingContract ends', async () => {
      const time_travel = 4 * 7 * 24 * 60 * 60 + 24 * 60 * 60; // 1 month + 1 day
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');
      await vestingC.connect(recipient).claim();
      const userBalance = await ruTokenC.balanceOf(recipient.address);
      expect(userBalance).to.equal(vestingAmount);
    });

    it('should transfer correct amount of tokens after vestingCliff finished', async () => {
      const time_travel = 7 * 24 * 60 * 60; // 1 week
      const onePercent = ethers.utils.parseUnits('.01', 'ether');
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');

      await vestingC.connect(recipient).claim()
      const userBalance = await ruTokenC.balanceOf(recipient.address);
      const actualBalance = vestingAmount.div(4)

     expect(userBalance).to.be.within(
       actualBalance,
       actualBalance.add(onePercent)
     );

    });
    it('should transfer correct amount of tokens during a random claim call', async () => {
      const time_travel = 7 * 24 * 60 * 60; // 1 week 
      const onePercent = ethers.utils.parseUnits('.015', 'ether');
      //wait a week
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');

      // first claim
      await vestingC.connect(recipient).claim();
      // wait a week
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');

      // second claim
      await vestingC.connect(recipient).claim();
      const userBalance = await ruTokenC.balanceOf(recipient.address);
      const actualBalance = vestingAmount.div(2);

     expect(userBalance).to.be.within(
       actualBalance,
       actualBalance.add(onePercent)
     );


    });

    it('should set lastUpdate to new block timestamp after transfer', async () => {

      const time_travel = 7 * 24 * 60 * 60; // 1 week
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');

      const lastUpdateBeg = await vestingC.lastUpdate();
      await vestingC.connect(recipient).claim();

      const lastUpdate = await vestingC.lastUpdate();
      const expected = lastUpdateBeg.add(time_travel)
      expect(lastUpdate).to.be.closeTo(expected, expected.add(1));
    });
  });
});

// it("should revert the contract because vestingDuration and vesting cliff")
// adding new notes sd23i
