/* 
Deployment Script for OPI Staking Contract. 
September 7th 2022
*/


const { ethers } = require('hardhat');
let { networkConfig } = require('../helper-hardhat-config');
require('dotenv').config();

// Contract name
const contract_name = 'StakingRewardsV2';

// Contract parameters
const reward_distribution = process.env.DEPLOYER_ACCOUNT_ADDRESS; //Only owner address
const reward_token = '0x3d4DF72c7C70dfD127f5470ED7350fBd7bF63f7B'; //RU token
const staking_token = '0x068F465A140131f6996Bbc5c5B7435A1a52c7DA2'; //OPI token
const rewards_duration = 7 * 24 * 60 * 60;

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log('--------------------------------------');
  // deploys contract
  const Stake = await deploy(contract_name, {
    from: deployer,
    args: [reward_distribution, reward_token, staking_token, rewards_duration],
    log: true,
  });

  log(`You deployed ${contract_name} contract to address: ${Stake.address}`);

  const factory = await ethers.getContractFactory(contract_name);
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];

  const StakingContract = new ethers.Contract(
    Stake.address,
    factory.interface,
    signer
  );

  const StakingToken = await StakingContract.stakingToken();
  const Rewardtoken = await StakingContract.rewardsToken();
  const RewardDistributor = await StakingContract.rewardsDistribution();
  const RewardsDuration = await StakingContract.rewardsDuration();
  log(
    `\nContract Parameters:\nReward Distributor address: ${RewardDistributor} \nStaking token address: ${StakingToken} \nReward Token address: ${Rewardtoken}\nStaking Duration: ${RewardsDuration}`
  );

  const networkName = networkConfig[chainId]['name'];

  log(
    `\n Verify with: \n npx hardhat verify --network ${networkName} ${StakingContract.address} "${Stake.args[0]}" "${Stake.args[1]}" "${Stake.args[2]}" "${Stake.args[3]}"`
  );
};

module.exports.tags = ['staking'];
