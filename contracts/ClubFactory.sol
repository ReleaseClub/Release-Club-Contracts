pragma solidity ^0.8.9;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/security/Pausable.sol";
import "contracts/ReleaseClub.sol";
import "./strings.sol";

contract ClubFactory is Ownable, Pausable {
    using strings for *;

    event ClubCreated(address ClubAddress, string clubName);

    uint immutable MAX_NAME_SIZE = 20; // Maximum number of club name characters
    address[] public clubs;
    mapping(address => address[]) public clubOwners;

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

    function addClub(string memory name) public payable whenNotPaused {
        // Make sure the club name has a maximum sixe of 20 characters
        bytes32 nameInBytes32 = strings.toBytes32(name);
        uint nameLength = strings.len(nameInBytes32);
        if (nameLength > MAX_NAME_SIZE) {
            revert("Error: club name too long");
        }

        ReleaseClub club = new ReleaseClub(name, msg.sender);
        clubs.push(address(club));
        clubOwners[msg.sender].push(address(club));
        emit ClubCreated(address(club), name);
    }

    function viewClubs() public view returns (address[] memory) {
        return clubs;
    }

    function getClubs(address owner) public view returns (address[] memory) {
        return clubOwners[owner];
    }
}
