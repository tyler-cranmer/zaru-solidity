const { ethers } = require('hardhat');
let { networkConfig } = require('../helper-hardhat-config');
require('dotenv').config();

const contract_name = 'GovernanceToken';
const mint_to_address = process.env.DEPLOYER_ACCOUNT_ADDRESS;
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log('--------------------------------------');
  // deploys contract
  const Token = await deploy(contract_name, {
    from: deployer,
    args: [mint_to_address],
    log: true,
  });

  log(`You deployed a Token contract to ${Token.address}`);
  log(`The RU tokens were sent to address: ${mint_to_address}`);

  const factory = await ethers.getContractFactory(contract_name); //grabs the NFFeet contract factory.
  const accounts = await hre.ethers.getSigners(); //grabs an account.
  const signer = accounts[0];

  const tokenContract = new ethers.Contract(
    Token.address,
    factory.interface,
    signer
  );

  const networkName = networkConfig[chainId]['name'];

  // v1 contract
  log(
    `\n Verify with: \n npx hardhat verify --network ${networkName} ${tokenContract.address} "${Token.args}"`
  );

};

module.exports.tags = ['token'];
