const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');
chai.use(require('chai-bn')(BN));

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
    it('should set vestingEnd variable correctly', async () => {
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
        it("should revert with message if vestingCliff time not met", async () => {

        });
        it("should transfer correct amount of tokens when vestingContract ends", async () => { })
        
        it("should transfer correct amount of tokens after vestingCliff finished", async () => {

        })
        it("should transfer correct amount of tokens during a random claim call", async () => {

        })

        it("should set lastUpdate to new block timestamp after transfer", async () => {

        })
    })
});

// it("should revert the contract because vestingDuration and vesting cliff")
// adding new notes sd