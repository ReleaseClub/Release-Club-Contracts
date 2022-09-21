// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

struct Release {
    address tokenContract;
    uint256 tokenID;
}

contract ReleaseClub is AccessControlEnumerableUpgradeable {
    event NewRelease(address tokenContract, uint256 tokenID);
    Release[] public releases;
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant MOD_ROLE = keccak256("MOD_ROLE");
    string public clubName;
    uint256[20] __gap;

    function initialize(string memory _clubName, address clubCreator)
        public
        initializer
    {
        __AccessControlEnumerable_init();
        // Grant the creator the default admin role: it will be able
        // to grant and revoke any roles
        clubName = _clubName;
        _grantRole(DEFAULT_ADMIN_ROLE, clubCreator); // _setupRole() is deprecated
        _grantRole(MOD_ROLE, clubCreator);
        _grantRole(MEMBER_ROLE, clubCreator);
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

    // should be called "revokeModerator"
    function RemoveModerator(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(MOD_ROLE, account);
    }

    function addReleases(Release[] memory newReleases) public onlyRole (MEMBER_ROLE) {
       uint256 i = 0;
       while(i<newReleases.length)
       {
           releases.push(newReleases[i]);
           emit NewRelease(newReleases[i].tokenContract,newReleases[i].tokenID);
           i++;
       }
   }

    // should be called "addReleases"
    function addRelease(Release[] memory newReleases)
        public
        onlyRole(MEMBER_ROLE)
    {
        uint256 i = 0;
        while (i < newReleases.length) {
            releases.push(newReleases[i]);
            emit NewRelease(
                newReleases[i].tokenContract,
                newReleases[i].tokenID
            );
            i++;
        }
    }
}
