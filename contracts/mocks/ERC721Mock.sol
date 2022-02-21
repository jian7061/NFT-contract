//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../ERC721.sol";

contract ERC721Mock is ERC721 {
    constructor() {}

    function mint(uint256 _tokenId) external {
        _mint(msg.sender, _tokenId);
    }

    function mintTo(address _to, uint256 _tokenId) external {
        _mint(_to, _tokenId);
    }

    function safeMint(
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) external {
        _safeMint(_to, _tokenId, _data);
    }

    function safeMint(address _to, uint256 _tokenId) external {
        _safeMint(_to, _tokenId, "");
    }
}
