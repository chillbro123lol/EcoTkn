// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EcoToken.sol";
import "./StakeholderParticipation.sol";
import "./ActionVerification.sol";

contract DeploymentFactory {
    EcoToken public ecoToken;
    StakeholderParticipation public stakeholderParticipation;
    ActionVerification public actionVerification;

    constructor() {
        // Deploy EcoToken
        ecoToken = new EcoToken();

        // Deploy StakeholderParticipation with the address of the EcoToken
        stakeholderParticipation = new StakeholderParticipation(address(ecoToken));

        // Deploy ActionVerification with the addresses of the EcoToken and StakeholderParticipation
        actionVerification = new ActionVerification(address(ecoToken), address(stakeholderParticipation));

        // Link EcoToken with StakeholderParticipation and ActionVerification
        ecoToken.setStakeholderParticipation(address(stakeholderParticipation));
        ecoToken.setActionVerification(address(actionVerification));

        // Assuming there might be a need to link back from StakeholderParticipation to ActionVerification
        stakeholderParticipation.setActionVerificationContract(address(actionVerification));
    }
}
