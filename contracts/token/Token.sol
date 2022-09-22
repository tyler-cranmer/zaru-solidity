// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/*
* @title Governance Token Contract
* @param to address - address to send the initial mint supply of tokens
* @param name - name of token 
* @param symbol - symbol of token
* @notice 10,000,000 initial mint
*/

contract GovernanceToken is ERC20 {

    constructor(address to, string memory name, string memory symbol) ERC20 (name, symbol){
        _mint(to,  10000000000000000000000000);
    }

}