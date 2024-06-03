// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./ActionVerification.sol";

contract StakeholderParticipation {
    IERC20 public token;
    address public admin;
    address public ecoTokenContract; // Address of the EcoToken contract
    ActionVerification public actionVerificationContract;
    mapping(address => uint256) public stakes;

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
        admin = msg.sender;
        
    }
    
    // Function to set the ActionVerification contract address
    function setActionVerificationContract(address _actionVerificationAddress) public {
        require(msg.sender == admin, "Only the admin can set the ActionVerification contract address");
        actionVerificationContract = ActionVerification(_actionVerificationAddress);
    }

    function setEcoTokenContract(address _ecoTokenContract) external onlyAdmins {
        ecoTokenContract = _ecoTokenContract;
    }
    

    // Modifier to check if the caller is either the admin or the ActionVerification contract
    modifier onlyAdmins() {
        require(msg.sender == address(actionVerificationContract)  || msg.sender == admin || msg.sender == address(ecoTokenContract),
            "Admins only");
        _;
    }

    function stakeTokens(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Failed to transfer tokens for staking");
        stakes[msg.sender] += amount;
    }

    // Updated to allow any user to release their own stakes
    function releaseStake(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient staked amount");
        stakes[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Failed to transfer tokens");
    }

    function removeStake(address deceptiveAccount) external onlyAdmins {
        uint256 stakedAmount = stakes[deceptiveAccount];
        require(token.balanceOf(address(this)) >= stakedAmount,
            "Insufficient tokens in contract to handle operation");

        token.transfer(ecoTokenContract, stakedAmount);
        stakes[deceptiveAccount] = 0;  // Resetting the stake
    }   
}
