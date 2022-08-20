const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');
//Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

describe('Governance Token', () => {
  let Token;
  let token;
  let deployer;
  let minter;
  let burner;
  let addr1;

  beforeEach(async () => {
    [deployer, minter, burner, addr1] = await ethers.getSigners();
    Token = await ethers.getContractFactory('GovernanceToken');
    token = await Token.deploy(
      deployer.address,
      minter.address,
      burner.address
    );
  });

  describe('Deployment', () => {
    it('Should set the right total supply', async () => {
      expect((await token.totalSupply()).toString()).to.equal(
        '10000000000000000000000000'
      );
    });
    it('Should send all tokens to deployer address', async () => {
      const balance = await token.balanceOf(deployer.address);
      expect(balance.toString()).to.equal('10000000000000000000000000');
    });

    it('Should allow Burner to burn tokens', async () => {
        let burn_amount = ethers.utils.parseUnits('10', 'ether');
        let totalSupply = await token.totalSupply();
        await token.connect(burner).burn(deployer.address, burn_amount);
        expect(await token.totalSupply()).to.equal(totalSupply.sub(burn_amount));
    });

    it("Should burn tokens in correct address", async () => {
        let burn_amount = ethers.utils.parseUnits('10', 'ether');
        await token.connect(burner).burn(deployer.address, burn_amount);
        let accountSupply = await token.balanceOf(deployer.address);
        let totalSupply = await token.totalSupply();
        expect(accountSupply).to.equal(totalSupply);
    })
    
    it("Should mint more tokens from Minter address", async() => {
      let mint_amount = ethers.utils.parseUnits('10', 'ether');
      await token.connect(minter).increaseSupply(minter.address, mint_amount);
      const balance = await token.balanceOf(minter.address)
      expect(balance).to.equal(mint_amount);

    })

    it("Should revert minting more tokens from random address", async() => {
      let mint_amount = ethers.utils.parseUnits('10', 'ether');
      expect(token.connect(addr1).increaseSupply(minter.address, mint_amount)).to.be.reverted;
    })

    it("Should revert when random account tries to burn tokens.", async () => {
                  let burn_amount = ethers.utils.parseUnits('10', 'ether');
                  expect(
                    token
                      .connect(addr1)
                      .burn(minter.address, burn_amount)
                  ).to.be.reverted;
    })

  });
});