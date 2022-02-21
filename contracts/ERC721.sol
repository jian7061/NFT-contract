//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IERC721.sol";
import "../interfaces/IERC721Enumerable.sol";
// import "../interfaces/IERC721Metadata.sol";
import "../interfaces/IERC721TokenReceiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "hardhat/console.sol";

abstract contract ERC721 is IERC721, IERC721Enumerable {
    //Address library에서 isContract() 사용
    using Address for address;
    //모든 owner들 배열로 저장
    address[] private owners;
    // //모든 token들 배열로 저장
    // uint256[] private tokens;
    // //각 token마다 고유한 index 부여해서 맵핑
    // mapping(uint256 => uint256) private idToIndex;
    // //각 소유자가 가지고 있는 토큰들 리스트 맵핑
    // mapping(address => uint256[]) private ownerToTokens;
    // //tokenId 의 소유자 주소 맵핑
    // mapping(uint256 => address) public idToOwner;
    // //소유한 token 개수 맵핑
    // mapping(address => uint256) public ownerToTokenCount;
    //tokenId의 대리실행자 주소 맵핑
    mapping(uint256 => address) public idToOperator;
    //소유자가 대리자에게 권한 부여 여부 맵핑
    mapping(address => mapping(address => bool)) public ownerToOperatorApproval;

    //---------------------------------------------------------------------------------------------------------------//
    //ERC Specification.
    //---------------------------------------------------------------------------------------------------------------//
    //소유자 주소 넣으면 NTF 토큰의 개수 반환
    function balanceOf(address _owner) external view virtual returns (uint256 _count) {
        require(_owner != address(0), "zero address is not allowed");
        unchecked {
            for (uint256 i = 0; i < owners.length; i++) {
                if (_owner == owners[i]) _count++;
            }
        }
    }

    //NTF 토큰아이디 넣으면 해당 NFT토큰을 소유하고 있는 사람의 주소 반환
    function ownerOf(uint256 _tokenId) external view virtual returns (address _owner) {
        _owner = owners[_tokenId];
    }

    //operator가 owner의 모든 NFT토큰에 대한 전송 권한을 가지고 있는지 여부 반환
    function isApprovedForAll(address _owner, address _operator) external view virtual returns (bool success) {
        success = ownerToOperatorApproval[_owner][_operator];
    }

    //to 주소에 tokenID에 해당하는 NFT 토큰 전송 권한을 부여
    function approve(address _to, uint256 _tokenId) external payable virtual {
        address _owner = owners[_tokenId];
        require(_to != _owner, "not allowed to approve himself");
        require(msg.sender == _owner || this.isApprovedForAll(_owner, msg.sender), "only owner can execute");
        idToOperator[_tokenId] = _to;
        emit Approval(_owner, _to, _tokenId);
    }

    //해당 토큰의 전송 권한을 갖고 있는 주소 반환
    function getApproved(uint256 _tokenId) external view virtual returns (address _allowance) {
        _allowance = idToOperator[_tokenId];
    }

    //operator에게 모든 NFT토큰에 대한 전송 권한을 승인하거나 승인을 취소
    function setApprovalForAll(address _operator, bool _approved) external virtual {
        require(_operator != msg.sender, "not allowed to approve himself");
        ownerToOperatorApproval[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    //from의 주소에서 to의 주소로 tokenId에 해당하는 NFT토큰 전송
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable virtual {
        require(_isOwnerOrOperator(msg.sender, _tokenId), "only owner or operator can execute");
        _transferFrom(_from, _to, _tokenId);
    }

    //safeTransferFrom - 전송받는 to주소가 ERC721토큰을 받을 수 있는지 체크하고 보낸다.
    //컨트랙트 주소로 보냄
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) external payable virtual {
        require(_isOwnerOrOperator(msg.sender, _tokenId), "only owner or operator can execute");
        _safeTransferFrom(_from, _to, _tokenId, _data);
    }

    //EOA로 보냄
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external payable virtual {
        require(_isOwnerOrOperator(msg.sender, _tokenId), "only owner or operator can execute");
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    //---------------------------------------------------------------------------------------------------------------//
    //ERC Enumerable Specification.
    //---------------------------------------------------------------------------------------------------------------//
    function totalSupply() external view virtual returns (uint256 totalCount) {
        address[] memory _owners = owners;
        unchecked {
            for (uint256 i = 0; i < _owners.length; i++) {
                if (_owners[i] != address(0)) totalCount++;
            }
        }
    }

    //전체 토큰 중 _index번째 토큰아이디 반환
    function tokenByIndex(uint256 _index) external view virtual returns (uint256) {
        require(_index < owners.length, "Invalid Index");
        return _index;
    }

    //특정 소유자의 토큰리스트중에 _index번째 토큰아이디 반환
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view virtual returns (uint256 _tokenId) {
        // require(_index < this.balanceOf[_owner], "Invalid Index");
        uint256 count;
        unchecked {
            for (uint256 i; i < owners.length; i++) {
                if (_owner == owners[i]) {
                    if (count == _index) return i;
                    else count++;
                }
            }
        }
        require(false, "Invalid Index");
    }

    //---------------------------------------------------------------------------------------------------------------//
    //Internal functions.
    //---------------------------------------------------------------------------------------------------------------//
    function _mint(address _to, uint256 _tokenId) internal {
        require(_to != address(0), "not allowed to mint to the zero address");
        require(!_isValidToken(_tokenId), "Already minted token");

        owners.push(_to);

        emit Transfer(address(0), _to, _tokenId);
    }

    function _safeMint(
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal {
        _mint(_to, _tokenId);
        require(
            _checkAndCallSafeTransfer(address(0), _to, _tokenId, _data),
            "sent to a contract which is non ERC721 Receiver"
        );
    }

    function _transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal {
        require(owners[_tokenId] == _from, "only owner can transfer");
        require(_to != address(0), "not allowed to transfer to the zero address");
        idToOperator[_tokenId] = address(0);
        owners[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    function _safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal virtual {
        _transferFrom(_from, _to, _tokenId);
        require(
            _checkAndCallSafeTransfer(_from, _to, _tokenId, _data),
            "sent to a contract which is non ERC721 Receiver"
        );
    }

    function _isOwnerOrOperator(address _operator, uint256 _tokenId) internal view returns (bool success) {
        require(_isValidToken(_tokenId), "Not valid token");
        address _owner = owners[_tokenId];
        success =
            (_operator == _owner) ||
            (idToOperator[_tokenId] == _operator) ||
            ownerToOperatorApproval[_owner][_operator];
    }

    function _isValidToken(uint256 _tokenId) internal view returns (bool isValid) {
        isValid = (_tokenId < owners.length) && (owners[_tokenId] != address(0));
    }

    function _checkAndCallSafeTransfer(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal returns (bool success) {
        if (_to.isContract()) {
            try IERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data) returns (bytes4 retval) {
                success = retval == IERC721TokenReceiver.onERC721Received.selector;
            } catch {
                return false;
            }
        }
        return true;
    }
}
