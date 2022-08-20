// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


/*
* @title Governance Token Contract
* @param to address, address to send the initial mint supply of tokens
* @param minter address, authorizing address to mint more tokens
* @param burner address, authorizing address to burn tokens
* @notice 10,000,000 initial mint
*/

contract GovernanceToken is ERC20, AccessControl {
    bytes32 public constant S_MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant S_BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(address to, address minter, address burner) ERC20 ("Zaru", "RU"){
        _setupRole(S_MINTER_ROLE, minter);
        _setupRole(S_BURNER_ROLE, burner);
        _mint(to,  10000000000000000000000000);
    }

    /*
    @param address to, account to send funds to
    @param uint256 amount, amount of increased funds
    */
    function increaseSupply(address to,uint256 amount) external onlyRole(S_MINTER_ROLE) {
        _mint(to, amount);
    }

    /*
    @param address from, account of tokens to burn
    @param uint256 amount, amount of tokens burned
    */
    function burn(address from, uint256 amount) external  onlyRole(S_BURNER_ROLE) {
        _burn(from, amount);
    }
}