// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/*
* @title Governance Token Contract
* @param to address, address to send the initial mint supply of tokens
* @param minter address, authorizing address to mint more tokens
* @param burner address, authorizing address to burn tokens
* @notice 10,000,000 initial mint
*/

contract GovernanceToken is ERC20 {

    constructor(address to) ERC20 ("Zaru", "RU"){
        _mint(to,  10000000000000000000000000);
    }

}