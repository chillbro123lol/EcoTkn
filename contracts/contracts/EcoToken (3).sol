// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EcoToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./StakeholderParticipation.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./ActionVerification.sol";  // Ensure this import statement is correct based on your project structure

contract EcoToken is ERC20 {
    address public owner;
    StakeholderParticipation public stakeholderParticipation;
    ActionVerification public actionVerification; // Reference to the ActionVerification contract

    constructor() ERC20("EcoToken", "ECO") {
        owner = msg.sender;
    }

    
    function setStakeholderParticipation(address _stakeholderParticipation) public {
        require(msg.sender == owner, "Only the owner can set the Stakeholder Participation address");
        stakeholderParticipation = StakeholderParticipation(_stakeholderParticipation);
    }

    function setActionVerification(address _actionVerification) public {
        require(msg.sender == owner, "Only the owner can set the Action Verification address");
        actionVerification = ActionVerification(_actionVerification);
        _mint(address(actionVerification), 100000);
    }
    

    function mint(uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        _mint(owner, amount);
    }
}

