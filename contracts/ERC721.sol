//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IERC721.sol";
import "../interfaces/IERC721TokenReceiver.sol";
import "./ERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ERC721 is ERC165, IERC721 {
    //Address library에서 isContract() 사용
    using Address for address;

    //tokenId 의 소유자 주소 맵핑
    mapping(uint256 => address) idToOwner;
    //소유한 token 개수 맵핑
    mapping(address => uint256) ownerToTokenCount;
    //tokenId의 대리실행자 주소 맵핑
    mapping(uint256 => address) idToOperator;
    //소유자가 대리자에게 권한 부여 여부 맵핑
    mapping(address => mapping(address => bool)) ownerToOperator;

    constructor() {
        //  Note: the ERC-165 identifier for this interface is 0x80ac58cd.
        supportedInterfaces[0x80ac58cd] = true; //ERC721 인터페이스id 미리 계산해서 대입 => 가스비 절약
    }

    //소유자 주소가 zero address가 아님을 보증
    modifier validAddress(address _owner) {
        require(_owner != address(0), "Zero address is not allowed");
        _;
    }

    //유효한 토큰임을 보증
    modifier validToken(uint256 _tokenId) {
        require(idToOwner[_tokenId] != address(0), "Not valid token");
        _;
    }

    //msg.sender가 토큰 소유자이거나 권한 대리인임을 보장
    modifier OwnerOrOperator(uint256 _tokenId) {
        address owner = idToOwner[_tokenId];
        require(
            msg.sender == owner || ownerToOperator[owner][msg.sender] || idToOperator[_tokenId] == msg.sender,
            "Only owner or operator can execute"
        );
        _;
    }

    //소유자 주소 넣으면 NTF 토큰의 개수 반환
    function balanceOf(address _owner) external view validAddress(_owner) returns (uint256 _balance) {
        return ownerToTokenCount[_owner];
    }

    //NTF 토큰아이디 넣으면 해당 NFT토큰을 소유하고 있는 사람의 주소 반환
    function ownerOf(uint256 _tokenId) external view validToken(_tokenId) returns (address) {
        return idToOwner[_tokenId];
    }

    //to 주소에 tokenID에 해당하는 NFT 토큰 전송 권한을 부여
    function approve(address _to, uint256 _tokenId) external payable OwnerOrOperator(_tokenId) validToken(_tokenId) {
        require(_to != idToOwner[_tokenId], "not allowed to approve himself");
        idToOperator[_tokenId] = _to;
        emit Approval(msg.sender, _to, _tokenId);
    }

    //해당 토큰의 전송 권한을 갖고 있는 주소 반환
    function getApproved(uint256 _tokenId) external view validToken(_tokenId) returns (address) {
        return idToOperator[_tokenId];
    }

    //operator에게 모든 NFT토큰에 대한 전송 권한을 승인하거나 승인을 취소
    function setApprovalForAll(address _operator, bool _approved) external {
        ownerToOperator[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    //operator가 owner의 모든 NFT토큰에 대한 전송 권한을 가지고 있는지 여부 반환
    function isApprovedForAll(address _owner, address _operator) external view validAddress(_owner) returns (bool) {
        return ownerToOperator[_owner][_operator];
    }

    //from의 주소에서 to의 주소로 tokenId에 해당하는 NFT토큰 전송
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable validToken(_tokenId) OwnerOrOperator(_tokenId) validAddress(_to) {
        _transferFrom(_from, _to, _tokenId);
    }

    //safeTransferFrom - 전송받는 to주소가 ERC721토큰을 받을 수 있는지 체크하고 보낸다.
    //컨트랙트 주소로 보냄
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) external payable validToken(_tokenId) OwnerOrOperator(_tokenId) validAddress(_to) {
        _safeTransferFrom(_from, _to, _tokenId, _data);
    }

    //EOA로 보냄
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable validToken(_tokenId) OwnerOrOperator(_tokenId) validAddress(_to) {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    function _subToken(address _from, uint256 _tokenId) internal OwnerOrOperator(_tokenId) validToken(_tokenId) {
        ownerToTokenCount[_from] -= 1;
        delete idToOwner[_tokenId];
    }

    function _addToken(address _to, uint256 _tokenId) internal validAddress(_to) validToken(_tokenId) {
        require(idToOwner[_tokenId] != _to, "Already exist tokenId");
        idToOwner[_tokenId] = _to;
        ownerToTokenCount[_to] += 1;
    }

    function _resetApproval(uint256 _tokenId) internal validToken(_tokenId) {
        delete idToOperator[_tokenId];
    }

    function _transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal {
        _resetApproval(_tokenId);
        _subToken(_from, _tokenId);
        _addToken(_to, _tokenId);
        emit Transfer(_from, _to, _tokenId);
    }

    function _safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal {
        require(_checkAndCallSafeTransfer(_from, _to, _tokenId, _data), "Sent to not ERC721 Receiver Contract");
        _resetApproval(_tokenId);
        _subToken(_from, _tokenId);
        _addToken(_to, _tokenId);
    }

    function _checkAndCallSafeTransfer(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal returns (bool) {
        if (!_to.isContract()) {
            return true;
        }
        bytes4 retval = IERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
        /// @dev Note: the ERC-165 identifier for this interface is 0x150b7a02.
        return (retval == 0x150b7a02);
    }
}
