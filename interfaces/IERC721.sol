//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC721 {
    //소유자 주소 넣으면 NTF 토큰의 개수 반환
    function balanceOf(address owner) external view returns (uint256 balance);

    //NTF 토큰아이디 넣으면 해당 NFT토큰을 소유하고 있는 사람의 주소 반환
    function ownerOf(uint256 tokenId) external view returns (address owner);

    //from의 주소에서 to의 주소로 tokenId에 해당하는 NFT토큰 전송
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external payable;

    //safeTransferFrom - 전송받는 to주소가 ERC721토큰을 받을 수 있는지 체크하고 보낸다.
    //컨트랙트 주소로 보냄
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external payable;

    //EOA로 보냄
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external payable;

    //to 주소에 tokenID에 해당하는 NFT 토큰 전송 권한을 부여
    function approve(address to, uint256 tokenId) external payable;

    //해당 토큰의 전송 권한을 갖고 있는 주소 반환
    function getApproved(uint256 tokenId) external view returns (address operator);

    //operator에게 모든 NFT토큰에 대한 전송 권한을 부여
    function setApprovalForAll(address operator, bool approved) external;

    //operator가 owner의 모든 NFT토큰에 대한 전송 권한을 가지고 있는지 여부 반환
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approval, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
}
