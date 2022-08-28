const { ethers } = require('hardhat');
let { networkConfig } = require('../helper-hardhat-config');
require('dotenv').config();


// Contract name 
const contract_name = 'GovernanceToken';

// Contract parameters
const token_name = 'Test1';
const token_symbol = 'ttone';
const mint_to_address = process.env.DEPLOYER_ACCOUNT_ADDRESS;


module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log('--------------------------------------');
  // deploys contract
  const Token = await deploy(contract_name, {
    from: deployer,
    args: [mint_to_address, token_name, token_symbol],
    log: true,
  });

  log(`You deployed ${contract_name} contract to address: ${Token.address}`);

  const factory = await ethers.getContractFactory(contract_name); 
  const accounts = await hre.ethers.getSigners(); 
  const signer = accounts[0];

  const tokenContract = new ethers.Contract(
    Token.address,
    factory.interface,
    signer
  );

  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();

  log(`The ${name} / ${symbol} tokens were sent to address: ${mint_to_address}`);

  const networkName = networkConfig[chainId]['name'];

  log(
    `\n Verify with: \n npx hardhat verify --network ${networkName} ${tokenContract.address} "${Token.args[0]}" "${Token.args[1]}" "${Token.args[2]}" `
  );

};

module.exports.tags = ['token'];
