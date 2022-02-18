//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC165 {
    //컨트랙트가 정의된 인터페이스를 구현했는지 검증
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}
