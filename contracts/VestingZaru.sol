// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract VestingZaru {
    using SafeMath for uint256;

    address public ruToken; 
    address public recipient; 
    uint256 public vestingAmount; 
    uint256 public vestingBegin;
    uint256 public vestingCliff; 
    uint256 public vestingEnd; 

    uint256 public vestingDuration; 

    uint256 public lastUpdate;

    constructor (
        address ruToken_, 
        address recipient_,
        uint256 vestingAmount_,
        uint256 vestingCliffDuration_,
        uint256 vestingDuration_
    )
    {

        require(vestingDuration_ > vestingCliffDuration_, "Vester.constructor: cliff is too early");

        ruToken = ruToken_;
        recipient = recipient_;

        vestingAmount = vestingAmount_;
        vestingDuration = vestingDuration_;

        vestingBegin = block.timestamp;
        lastUpdate = vestingBegin;
        vestingEnd = block.timestamp.add(vestingDuration);
        vestingCliff = block.timestamp.add(vestingCliffDuration_);
        
    }

    function setRecipient(address recipient_) public {
        require(msg.sender == recipient, "ContractVester.setRecipient: unauthorized");
        recipient = recipient_;
    }

    function claim() public {
        require(block.timestamp >= vestingCliff, "ContractVester.claim: not time yet");
        uint256 amount;
        if (block.timestamp >= vestingEnd) {
            amount = IERC20(ruToken).balanceOf(address(this));
        } else {
            amount = vestingAmount.mul(block.timestamp.sub(lastUpdate)).div(vestingDuration);
            lastUpdate = block.timestamp;
        }
        IERC20(ruToken).transfer(recipient, amount);
    }   
}