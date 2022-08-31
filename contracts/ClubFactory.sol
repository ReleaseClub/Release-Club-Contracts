// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "contracts/ReleaseClub.sol";

contract ClubFactory is Ownable, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @dev Emitted when a club is created (a proxy is deployed).
    event ClubCreated(address ClubAddress, string clubName);

    /// @dev wallet address => [club addresses]
    mapping(address => EnumerableSet.AddressSet) private clubOwnersToClubs;

    address public immutable clubImplementation;

    address[] public clubs;

    constructor(address _clubImplementation) {
        clubImplementation = _clubImplementation;
    }

    /**
     * @dev Create a minimal proxy contract for the new club. It is NOT upgradeable.
     * A proxy is a small contract that has the minimum code to forward all the calls to
     * the main contract, which is `ReleaseClub`.
     * This proxy has only state variables referring to one single club.
     *
     * TODO: pay Ethers when creating a club
     */
    function createClub(string memory clubName)
        external
        payable
        whenNotPaused
        returns (address)
    {
        address clone = Clones.clone(clubImplementation);
        // This function is equivalent to the ReleaseClub constructor
        ReleaseClub(clone).initialize(clubName, msg.sender);
        clubs.push(clone);
        clubOwnersToClubs[msg.sender].add(clone);
        emit ClubCreated(clone, clubName);
        return clone;
    }

    function viewClubs() public view returns (address[] memory) {
        return clubs;
    }

    function getClubsByOwner(address owner)
        public
        view
        returns (address[] memory)
    {
        /// @dev The `values` function should be called only inside a view function
        return clubOwnersToClubs[owner].values();
    }

    /**
     * @dev Pause the factory contract.
     * Disable the `createClub` function.
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
     * @dev Unpause the factory contract or enable the `createClub` function.
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
