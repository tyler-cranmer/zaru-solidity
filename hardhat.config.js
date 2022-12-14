require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-truffle5');
require('@nomiclabs/hardhat-etherscan');
require('@ericxstone/hardhat-blockscout-verify');
require('@nomiclabs/hardhat-solhint');
require('hardhat-deploy');
require('solidity-coverage');
require('dotenv').config();

const MAINNET_RPC_URL =
  process.env.MAINNET_RPC_URL ||
  process.env.ALCHEMY_MAINNET_RPC_URL ||
  'https://eth-mainnet.alchemyapi.io/v2/your-api-key';
const GOERLI_OP_RPC = process.env.GOERLI_OP_RPC;
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const MNEMONIC = process.env.MNEMONIC;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
// optional
// const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: {},
    },
    localhost: {},
    goerli_optimism: {
      url: GOERLI_OP_RPC,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    ganache: {
      url: 'http://localhost:8545',
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: {
        mnemonic: MNEMONIC,
      },
      saveDeployments: true,
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: {
        mnemonic: MNEMONIC,
      },
      saveDeployments: true,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      optimism: 'YOUR_OPTIMISTIC_ETHERSCAN_API_KEY',
      goerliOptimism: 'YOUR_OPTIMISTIC_ETHERSCAN_API_KEY',
      arbitrumOne: 'YOUR_ARBISCAN_API_KEY',
    },
  },
  // blockscoutVerify: {
  //   blockscoutURL: "<BLOCKSCOUT_EXPLORER_URL>",
  //   contracts: {
  //     "<CONTRACT_NAME>": {
  //       compilerVersion: SOLIDITY_VERSION.<CONTRACT_COMPILER_VERSION>, // checkout enum SOLIDITY_VERSION
  //       optimization: true,
  //       evmVersion: EVM_VERSION.<EVM_VERSION>, // checkout enum SOLIDITY_VERSION
  //       optimizationRuns: 999999,
  //     },
  //   },
  // },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    feeCollector: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.9',
      },
      {
        version: '0.8.0',
      },
      {
        version: '0.8.1',
      },
      {
        version: '0.6.6',
      },
      {
        version: '0.6.1',
      },
      {
        version: '0.4.24',
      },
    ],
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 999999,
    },
  },
  mocha: {
    timeout: 100000,
  },
};
