const chai = require('chai');
const { expect } = require('chai');
const { ethers, network } = require('hardhat');
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
  let acc1;
  let acc2;
  let multisig;
  let set_reward_tx;
  const one_week = 7 * 24 * 60 * 60; // 7days x 24hours x 60minutes x 60seconds
  const rewardAmount = ethers.utils.parseUnits('500', 'ether');
  beforeEach(async () => {
    [acc1, acc2, multisig] = await ethers.getSigners();

    Token = await ethers.getContractFactory('GovernanceToken');
    rewardToken = await Token.deploy(multisig.address, 'Zaru', 'Ru');
    Token2 = await ethers.getContractFactory('GovernanceToken');
    stakingToken = await Token2.deploy(
      acc1.address,
      'Optimism Index Token',
      'OPI'
    );

    Stake = await ethers.getContractFactory('StakingRewardsV2');
    stake = await Stake.deploy(
      multisig.address,
      rewardToken.address,
      stakingToken.address,
      one_week
    );

    // Trasnfer 1000 stakingTokens to account 2
    const acc2_amount = ethers.utils.parseUnits('1000', 'ether');
    await stakingToken.connect(acc1).transfer(acc2.address, acc2_amount);

    // Transfer Reward Tokens To Staking Contract 500 RU tokens
    await rewardToken.connect(multisig).transfer(stake.address, rewardAmount);

    // Set Rewards for Staking Contract. 500 RU Tokens
    set_reward_tx = await stake
      .connect(multisig)
      .notifyRewardAmount(rewardAmount);
  });

  describe('Deployment', () => {
    it('Should have set the correct constructor arguments', async () => {
      const rewardDistribution_addr = await stake.rewardsDistribution();
      const rewardsToken_addr = await stake.rewardsToken();
      const stakingToken_addr = await stake.stakingToken();
      const reward_duration = await stake.rewardsDuration();
      expect(rewardDistribution_addr).to.equal(multisig.address);
      expect(rewardsToken_addr).to.equal(rewardToken.address);
      expect(stakingToken_addr).to.equal(stakingToken.address);
      expect(reward_duration).to.equal(one_week);
    });

    it('Should set the correct duration for the staking contract to last. i.e. Period Finish', async () => {
      const period_finish = await stake.periodFinish();
      const tx_block = await ethers.provider.getBlock(
        set_reward_tx.blockNumber
      );
      const tx_block_ts = tx_block.timestamp;
      const expected_period_finish = tx_block_ts + one_week;
      expect(period_finish).to.equal(expected_period_finish);
    });
  });

  describe('totalSupply function', () => {
    it('Should return correct totalSupply', async () => {
      const amount = ethers.utils.parseUnits('50', 'ether');
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc1).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc1).stake(amount);
      const total_supply = await stake.totalSupply();
      expect(total_supply).to.equal(amount);

      // approve the staked contract to deposit account 2 tokens
      await stakingToken.connect(acc2).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc2).stake(amount);
      const total_supply2 = await stake.totalSupply();
      expect(total_supply2).to.equal(amount.add(amount));
    });
  });

  describe('balanceOf function', () => {
    it('should return correct staked token balance of an account', async () => {
      const amount = ethers.utils.parseUnits('50', 'ether');
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc1).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc1).stake(amount);
      const balance = await stake.balanceOf(acc1.address);
      expect(balance).to.equal(amount);
    });
  });

  describe('lastTimeRewardApplicable function', () => {
    it('should return lastTimeRewardApplicable current timestamp', async () => {
      const lastTimeReward_tx = await stake.lastTimeRewardApplicable();
      const tx_block = await ethers.provider.getBlock(
        lastTimeReward_tx.blockNumber
      );
      const tx_block_ts = tx_block.timestamp;
      expect(lastTimeReward_tx).to.equal(tx_block_ts);
    });

    it('should return lastTimeRewardApplicable periodFinish timestamp', async () => {
      const time_travel = 8 * 24 * 60 * 60;
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');

      const lastTimeReward = await stake.lastTimeRewardApplicable();

      const periodFinish = await stake.periodFinish();
      expect(lastTimeReward).to.equal(periodFinish);
    });
  });

  describe('rewardPerToken Function', () => {
    it('should return rewardPerTokenStored value of 0 when total supply = 0', async () => {
      rewardPerToken = await stake.rewardPerToken();
      expect(rewardPerToken).to.equal(0);
    });

    // NEED TO FINISH
    it('should return correct rewardPerTokenStored value', async () => {expect(1).to.equal(0);});
  });

  // NEED TO FINISH
  describe('earned function', () => {
    it('should return the correct amount of reward tokens earned for an account', async () => {expect(1).to.equal(0);});
  });

  // NEED TO FINISH
  describe('getRewardForDuration', () => {
    it('should return correct reward rate for duration', async () => {expect(1).to.equal(0);});
  });

  describe('stake function', () => {
    it('should revert if ammount attemped to stake in less than 1', async () => {
      const amount = ethers.utils.parseUnits('50', 'ether');
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc1).approve(stake.address, amount);
      // stake token amount
      await expect(stake.connect(acc1).stake(0)).to.be.revertedWith(
        'Cannot stake 0'
      );
    });
    it('should increase total supply by amount staked', async () => {
      const amount = ethers.utils.parseUnits('50', 'ether');
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc1).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc1).stake(amount);

      totalSupply = await stake.totalSupply();
      expect(totalSupply).to.equal(amount);

      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc2).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc2).stake(amount);
      totalSupply2 = await stake.totalSupply();
      expect(totalSupply2).to.equal(amount.add(amount));
    });
    it('should increase account balance of staked tokens by amount staked', async () => {
      const amount = ethers.utils.parseUnits('50', 'ether');
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc1).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc1).stake(amount);
      const balance = await stake.balanceOf(acc1.address);
      expect(balance).to.equal(amount);
    });

    it('Should transfer tokens from Staked Token contract', async () => {
      const token_balance = await stakingToken.balanceOf(acc2.address);
      const amount = ethers.utils.parseUnits('50', 'ether');
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc2).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc2).stake(amount);
      const new_token_balance = await stakingToken.balanceOf(acc2.address);
      expect(new_token_balance).to.equal(token_balance.sub(amount));
    });

    it('should emit staked event', async () => {
      const amount = ethers.utils.parseUnits('50', 'ether');
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc2).approve(stake.address, amount);
      // stake token amount
      const Staked = await stake.connect(acc2).stake(amount);
      await expect(Staked)
        .to.emit(stake, 'Staked')
        .withArgs(acc2.address, amount);
    });
  });

  describe('withdraw function', () => {
    const amount = ethers.utils.parseUnits('50', 'ether');
    const withdraw_amount = ethers.utils.parseUnits('10', 'ether');

    beforeEach(async () => {
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc2).approve(stake.address, amount);
      // stake token amount
      await stake.connect(acc2).stake(amount);
    });

    it('should revert when amount attempted to withdraw is less than 1', async () => {
      await expect(stake.connect(acc2).withdraw(0)).to.be.revertedWith(
        'Cannot withdraw 0'
      );
    });

    it('should decrease total supply by amount withdrawn', async () => {
      await stake.connect(acc2).withdraw(withdraw_amount);
      const total_supply = await stake.totalSupply();
      expect(total_supply).to.equal(amount.sub(withdraw_amount));
    });

    it('should decrease account balance of staked tokens by amount withdrawn', async () => {
      await stake.connect(acc2).withdraw(withdraw_amount);
      const balance = await stake.balanceOf(acc2.address)
      expect(balance).to.equal(amount.sub(withdraw_amount));

    });

    it('Should transfer tokens back to user from Staked Token contract', async () => {
      const initial_token_balance = await stakingToken.balanceOf(acc2.address);
      await stake.connect(acc2).withdraw(withdraw_amount);
      const after_tx_token_balance = await stakingToken.balanceOf(acc2.address);
      expect(after_tx_token_balance).to.equal(initial_token_balance.add(withdraw_amount));
    });

    it('should emit withdrawn event', async () => {
      const withdraw_tx = await stake.connect(acc2).withdraw(withdraw_amount);
      await expect(withdraw_tx)
        .to.emit(stake, 'Withdrawn')
        .withArgs(acc2.address, withdraw_amount);
    });

  });

  describe('getReward function', () => {
    const stake_amount = ethers.utils.parseUnits('100', 'ether');
    const time_travel = 302400; // half way through duration for staking contract

    beforeEach(async () => {
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc2).approve(stake.address, stake_amount);
      // stake token amount
      await stake.connect(acc2).stake(stake_amount);

      // Time Travel
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');
    });

    it('should set accouts reward balance to 0', async () => {
      await stake.connect(acc2).getReward();
      reward_balance = await stake.rewards(acc2.address)
      expect(reward_balance).to.equal(0)
    });

    it('should transfer reward tokens to users account', async () => { //not a great test but does the job
      const reward_balance = await stake.earned(acc2.address) // doesnt get the exact reward amount when getReward is called
      await stake.connect(acc2).getReward();
      const token_balance = await rewardToken.balanceOf(acc2.address);
      expect(token_balance).to.be.above(reward_balance);

    });
    it('should emit RewardPaid event', async () => {
      await expect(stake.connect(acc2).getReward()).to.emit(
        stake,
        'RewardPaid'
      );

    });
  });

  describe('exit function', () => {

    const stake_amount = ethers.utils.parseUnits('100', 'ether');
    const time_travel = 302400; // half way through duration for staking contract

    beforeEach(async () => {
      // approve the staked contract to deposit account 1 tokens
      await stakingToken.connect(acc2).approve(stake.address, stake_amount);
      // stake token amount
      await stake.connect(acc2).stake(stake_amount);

      // Time Travel
      await network.provider.send('evm_increaseTime', [time_travel]);
      await network.provider.send('evm_mine');
    });


    //Need to finish
    it('should withdraw all total staked token balance of user', async () => {
      expect(1).to.equal(0)


    });
    it('should withdraw all reward token for user', async () => {expect(1).to.equal(0);});
  });

  describe('notifyRewardAmount function', () => {
    it('should set rewardrate', async () => {expect(1).to.equal(0);});
  });
});
