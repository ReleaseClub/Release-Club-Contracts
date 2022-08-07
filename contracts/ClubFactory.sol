pragma solidity ^0.8.9;
// SPDX-License-Identifier: UNLICENSED

import "contracts/ReleaseClub.sol";

contract ClubFactory is Ownable {

    event ClubCreated(address ClubAddress, string clubName);

    address[] public clubs;

    function addClub(string calldata name) public payable {
        ReleaseClub club = new ReleaseClub(name,msg.sender);
        clubs.push(address(club));
        emit ClubCreated(address(club),name);
        
    }

    function viewClubs() public view returns(address[] memory){
        return clubs;
    }
}