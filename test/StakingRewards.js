const chai = require('chai');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const BN = require('bn.js');
//Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

describe('Staking Contract', () => {
  let Stake;
  let stake;
  let Token;
  let rewardToken;
  let Token2;
  let stakingToken;
  let multisig;
  let minter;
  let burner;

  beforeEach(async () => {
    [deployer, minter, burner, multisig] = await ethers.getSigners();

    Token = await ethers.getContractFactory('GovernanceToken');
    rewardToken = await Token.deploy(multisig, minter, burner);
    Token2= await ethers.getContractFactory('GovernanceToken');
    stakingToken = await Token2.deploy(
      deployer.address,
      minter.address,
      burner.address
    );
      
      rewardTokenAdd = rewardToken.address;
      stakingTokenAdd = stakingToken.address;
      Stake = await ethers.getContractFactory('StakingRewardsV2'); 
      stake = Stake.deploy(multisig, rewardTokenAdd,stakingTokenAdd 
      
  });
});
