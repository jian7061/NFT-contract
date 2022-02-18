//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IERC165.sol";

contract ERC165 is IERC165 {
    mapping(bytes4 => bool) internal supportedInterfaces;

    constructor() {
        // 0x01ffc9a7 === bytes4(keccak256('supportsInterface(bytes4)'))
        supportedInterfaces[0x01ffc9a7] = true; //ERC165 인터페이스id 미리 계산해서 대입=> 가스비 절약
    }

    function supportsInterface(bytes4 interfaceID) external view returns (bool) {
        return supportedInterfaces[interfaceID];
    }
}
