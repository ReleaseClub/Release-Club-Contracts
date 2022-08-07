pragma solidity ^0.8.9;
// SPDX-License-Identifier: UNLICENSED

import "contracts/ReleaseClub.sol";

contract ClubFactory is Ownable {
    event ClubCreated(address ClubAddress, string clubName);

    address[] public clubs;
    mapping(address => address[]) public clubOwners;

    function addClub(string memory name) public payable {
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
