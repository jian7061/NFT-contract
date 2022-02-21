//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IERC721Metadata.sol";
import "./ERC721.sol";

abstract contract ERC721Metadata is ERC721, IERC721Metadata {
    string internal tokenName;
    string internal tokenSymbol;
    //tokenId에 해당하는 Uri 맵핑
    mapping(uint256 => string) idToUri;

    constructor() {
        ///  Note: the ERC-165 identifier for this interface is 0x5b5e139f.
    }

    /// @notice A descriptive name for a collection of NFTs in this contract
    function name() external view returns (string memory _name) {
        return _name = tokenName;
    }

    /// @notice An abbreviated name for NFTs in this contract
    function symbol() external view returns (string memory _symbol) {
        return _symbol = tokenSymbol;
    }

    /// @notice A distinct URI for a given asset. uri 반환
    /// @dev Throws if `_tokenId` is not a valid NFT.
    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        return idToUri[_tokenId];
    }

    function _setTokenUri(uint256 _tokenId, string memory _uri) internal {
        idToUri[_tokenId] = _uri;
    }
}
