// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

struct Release {
    address tokenContract;
    address token;
}

contract ReleaseClub is AccessControlEnumerable {
    Release[] public releases;
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant MOD_ROLE = keccak256("MOD_ROLE");
    string public clubName;

    constructor(string memory name) {
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        clubName = name;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MOD_ROLE, msg.sender);
        _setupRole(MEMBER_ROLE, msg.sender);
    }

    function viewReleases() public view returns (Release[] memory) {
        return releases;
    }

    function viewName() public view returns (string memory) {
        return clubName;
    }

    function viewMembers() public view returns (address[] memory) {
        uint256 length = getRoleMemberCount(MEMBER_ROLE);
        address[] memory addresses = new address[](length);
        uint256 i;
        address member;
        for (i = 0; i < length; i++) {
            member = getRoleMember(MEMBER_ROLE, i);
            addresses[i] = member;
        }
        return addresses;
    }

    function addMember(address account) external onlyRole(MOD_ROLE) {
        _grantRole(MEMBER_ROLE, account);
    }

    function revokeMember(address account) external onlyRole(MOD_ROLE) {
        _revokeRole(MEMBER_ROLE, account);
    }

    function addModerator(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(MOD_ROLE, account);
        _grantRole(MEMBER_ROLE, account);
    }

    function RemoveModerator(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(MOD_ROLE, account);
    }

    function addRelease(Release[] memory newReleases, uint256 length)
        public
        onlyRole(MEMBER_ROLE)
    {
        uint256 i = 0;
        while (i < length) {
            releases.push(newReleases[i]);
            i++;
        }
    }
}
