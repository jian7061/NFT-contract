//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC721TokenReceiver {
    //ERC721 토큰을 받을 수 있는지 확인
    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes memory _data
    ) external returns (bytes4);
}
