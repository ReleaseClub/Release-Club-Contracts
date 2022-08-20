pragma solidity ^0.8.9;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "contracts/ReleaseClubUpgradeable.sol";

contract ClubFactory is Ownable, Pausable {
    address immutable clubImplementation;

    event ClubCreated(address ClubAddress, string clubName);

    address[] public clubs;
    mapping(address => address[]) public clubOwners;

    constructor() {
        clubImplementation = address(new ReleaseClubUpgradeable());
    }

    function addClub(string memory name)
        external
        payable
        whenNotPaused
        returns (address)
    {
        address clone = Clones.clone(clubImplementation);
        // This function is equivalent to the constructor
        ReleaseClubUpgradeable(clone).initialize(name, msg.sender);
        clubs.push(clone);
        clubOwners[msg.sender].push(clone); // JR - Not sure
        emit ClubCreated(clone, name);
        return clone;
    }

    function viewClubs() public view returns (address[] memory) {
        return clubs;
    }

    function getClubs(address owner) public view returns (address[] memory) {
        return clubOwners[owner];
    }

    /**
     * @dev Pause the factory contract.
     * Disable the `addClub` function.
     *
     * Requirements:
     *
     * - The contract must not be paused before calling this function.
     *
     * NOTE: it reverts if the contract is already paused.
     */
    function pauseTheFactory() public onlyOwner whenNotPaused {
        _pause();
    }

    /**
     * @dev Unpause the factory contract or enable the `addClub` function.
     *
     * Requirements:
     *
     * - The contract must be paused before calling this function.
     *
     * NOTE: it reverts if the contract is already unpaused.
     */
    function unpauseTheFactory() public onlyOwner whenPaused {
        _unpause();
    }
}
