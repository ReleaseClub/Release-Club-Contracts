// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

struct Release {
    address tokenContract;
    uint256 tokenID;
}

/**
 * @dev The contract inherits the {AccessControlEnumerable} contract.
 */
contract ReleaseClub is AccessControlEnumerable {
    /**
     * @dev Emitted when there is a new release
     */
    event NewRelease(address tokenContract, uint256 tokenID);

    /******************************* State variables ******************************/
    Release[] public releases;
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    bytes32 public constant MOD_ROLE = keccak256("MOD_ROLE");
    string public clubName;

    constructor(string memory name, address creator) {
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        clubName = name;
        _setupRole(DEFAULT_ADMIN_ROLE, creator);
        _setupRole(MOD_ROLE, creator);
        _setupRole(MEMBER_ROLE, creator);
    }

    /**
     * @dev Returns the content of the `releases` array.
     */
    function viewReleases() public view returns (Release[] memory) {
        return releases;
    }

    /**
     * @dev Returns the club name.
     */
    function viewName() public view returns (string memory) {
        return clubName;
    }

    /**
     * @dev Returns the a list with all the members addresses.
     */
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

    /**
     * @dev Returns a boolean value indicating whether the given `contractAddr` corresponds to an ERC721 compliant contract.
     */
    function isTheContractERC721Compliant(address contractAddr)
        public
        view
        returns (bool result)
    {
        return IERC721(contractAddr).supportsInterface(0x80ac58cd);
    }
}
