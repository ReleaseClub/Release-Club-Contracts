pragma solidity ^0.8.9;

// SPDX-License-Identifier: MIT

/*
 * @author Nick Johnson <arachnid@notdot.net>
 * Taken from https://github.com/Arachnid/solidity-stringutils/blob/master/src/strings.sol
 */
library strings {
    struct slice {
        uint _len;
        uint _ptr;
    }

    /*
     * @dev Returns a slice containing the entire string.
     * @param self The string to make a slice from.
     * @return A newly allocated slice containing the entire string.
     */
    function toSlice(string memory self) internal pure returns (slice memory) {
        uint ptr;
        assembly {
            ptr := add(self, 0x20)
        }
        return slice(bytes(self).length, ptr);
    }

    /*
     * @dev Returns the length of a null-terminated bytes32 string.
     * @param self The value to find the length of.
     * @return The length of the string, from 0 to 32.
     */
    function len(bytes32 self) public pure returns (uint) {
        uint ret;
        if (self == 0) return 0;
        if (uint(self) & type(uint128).max == 0) {
            ret += 16;
            self = bytes32(uint(self) / 0x100000000000000000000000000000000);
        }
        if (uint(self) & type(uint64).max == 0) {
            ret += 8;
            self = bytes32(uint(self) / 0x10000000000000000);
        }
        if (uint(self) & type(uint32).max == 0) {
            ret += 4;
            self = bytes32(uint(self) / 0x100000000);
        }
        if (uint(self) & type(uint16).max == 0) {
            ret += 2;
            self = bytes32(uint(self) / 0x10000);
        }
        if (uint(self) & type(uint8).max == 0) {
            ret += 1;
        }
        return 32 - ret;
    }

    /*
      Getting the character length of a string
      var len = "Unicode snowman ☃".toSlice().len(); // 17
    */

    function toString(bytes32 _text) public pure returns (string memory) {
        string memory newString = string(abi.encodePacked(_text));
        return newString;
    }

    function toBytes32(string memory _text) public pure returns (bytes32) {
        return bytes32(bytes(_text));
    }
}
