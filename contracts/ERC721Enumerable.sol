//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IERC721Enumerable.sol";
import "./ERC721.sol";

abstract contract ERC721Enumerable is ERC721, IERC721Enumerable {
    //모든 token들 배열로 저장
    uint256[] internal tokens;
    //각 token마다 고유한 index 부여해서 맵핑
    mapping(uint256 => uint256) internal idToIndex;
    //각 소유자가 가지고 있는 토큰들 리스트 맵핑
    mapping(address => uint256[]) internal ownerToTokens;

    constructor() {
        ///  Note: the ERC-165 identifier for this interface is 0x780e9d63.
        supportedInterfaces[0x780e9d63] = true;
    }

    //토큰의 전체 개수
    function totalSupply() external view returns (uint256) {
        return tokens.length;
    }

    //전체 토큰 중 _index번째 토큰 반환
    function tokenByIndex(uint256 _index) external view returns (uint256) {
        require(_index < tokens.length, "Invalid Index");
        return tokens[_index];
    }

    //특정 소유자의 토큰리스트중에 _index번째 토큰 반환
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256) {
        require(_index < ownerToTokens[_owner].length, "Invalid Index");
        return ownerToTokens[_owner][_index];
    }
}
