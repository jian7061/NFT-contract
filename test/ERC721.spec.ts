import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer, constants } from 'ethers';

describe.skip('ERC721', () => {
  let ERC721: Contract;
  let Sample: Contract;
  let TokenReceiver: Contract;

  let wallet: Signer;
  let walletTo: Signer;
  let dummy: Signer;

  const tokenId1 = 1;
  const tokenId2 = 2;

  describe('mintTo', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
    });
    it('should return revert with zero address', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      await expect(ERC721.mintTo(constants.AddressZero, tokenId1)).revertedWith('Zero address is not allowed');
    });
    it('should return revert if token is already exist', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      await expect(ERC721.mintTo(walletToAddress, tokenId1)).revertedWith('Already exist tokenId');
    });
  });

  describe('balanceOf', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.balanceOf(walletToAddress)).to.be.equal('0');
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.balanceOf(walletToAddress)).to.be.equal('1');
    });
    it('should return revert with zero address', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      await expect(ERC721.balanceOf(constants.AddressZero)).revertedWith('Zero address is not allowed');
    });
  });

  describe('ownerOf', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
    });
    it('should return revert if owner of token is zero address', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      await expect(ERC721.ownerOf(tokenId1)).revertedWith('Not valid token');
    });
  });

  describe('approve', () => {
    it('should be success with owner', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.connect(walletTo).approve(dummyAddress, tokenId1))
        .to.emit(ERC721, 'Approval')
        .withArgs(walletToAddress, dummyAddress, tokenId1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.getApproved(tokenId1)).to.be.equal(dummyAddress);
    });
    it('should return revert if msg.sender is not an owner', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      await expect(ERC721.connect(dummy).approve(dummyAddress, tokenId1)).revertedWith(
        'Only owner or operator can execute',
      );
    });
    it('should be success with operator', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.connect(walletTo).approve(dummyAddress, tokenId1))
        .to.emit(ERC721, 'Approval')
        .withArgs(walletToAddress, dummyAddress, tokenId1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.getApproved(tokenId1)).to.be.equal(dummyAddress);
    });
    it('should return revert if msg.sender is not an operator', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      await expect(ERC721.connect(dummy).approve(dummyAddress, tokenId1)).revertedWith(
        'Only owner or operator can execute',
      );
    });
    it('should return revert if msg.sender is trying to approve himself', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      await expect(ERC721.connect(walletTo).approve(walletToAddress, tokenId1)).revertedWith(
        'not allowed to approve himself',
      );
    });
  });

  describe('getApproved', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.connect(walletTo).approve(dummyAddress, tokenId1))
        .to.emit(ERC721, 'Approval')
        .withArgs(walletToAddress, dummyAddress, tokenId1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.getApproved(tokenId1)).to.be.equal(dummyAddress);
    });
  });

  describe('setApprovalForAll', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.mintTo(walletToAddress, tokenId2))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 2);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.ownerOf(tokenId2)).to.be.equal(walletToAddress);
      expect(await ERC721.connect(walletTo).setApprovalForAll(dummyAddress, true))
        .to.emit(ERC721, 'ApprovalForAll')
        .withArgs(walletToAddress, dummyAddress, true);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.ownerOf(tokenId2)).to.be.equal(walletToAddress);
      expect(await ERC721.isApprovedForAll(walletToAddress, dummyAddress)).to.be.equal(true);
    });
  });

  describe('isApprovedForAll', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.mintTo(walletToAddress, tokenId2))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 2);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.ownerOf(tokenId2)).to.be.equal(walletToAddress);
      expect(await ERC721.connect(walletTo).setApprovalForAll(dummyAddress, true))
        .to.emit(ERC721, 'ApprovalForAll')
        .withArgs(walletToAddress, dummyAddress, true);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.ownerOf(tokenId2)).to.be.equal(walletToAddress);
      expect(await ERC721.isApprovedForAll(walletToAddress, dummyAddress)).to.be.equal(true);
    });
  });

  describe('transferFrom', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(await ERC721.connect(walletTo).transferFrom(walletToAddress, dummyAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(walletToAddress, dummyAddress, tokenId1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(dummyAddress);
    });
  });

  describe('safeTransferFrom', () => {
    it('should be success transfering to EOA', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo, dummy] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const dummyAddress = await dummy.getAddress();
      const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
      ERC721 = await ERC721Contract.deploy();
      expect(await ERC721.mintTo(walletToAddress, tokenId1))
        .to.emit(ERC721, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
      expect(
        await ERC721.connect(walletTo)['safeTransferFrom(address,address,uint256)'](
          walletToAddress,
          dummyAddress,
          tokenId1,
        ),
      )
        .to.emit(ERC721, 'Transfer')
        .withArgs(walletToAddress, dummyAddress, tokenId1);
      expect(await ERC721.ownerOf(tokenId1)).to.be.equal(dummyAddress);
    });
  });
  it('should be success transfering to ERC721_Receiver_Contract', async () => {
    const accounts = await ethers.getSigners();
    [wallet, walletTo, dummy] = accounts;
    const walletToAddress = await walletTo.getAddress();
    const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
    ERC721 = await ERC721Contract.deploy();
    const TokenReceiverContract = await ethers.getContractFactory('contracts/TokenReceiver.sol:TokenReceiver', wallet);
    TokenReceiver = await TokenReceiverContract.deploy();
    expect(await ERC721.mintTo(walletToAddress, tokenId1))
      .to.emit(ERC721, 'Transfer')
      .withArgs(constants.AddressZero, walletToAddress, 1);
    expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
    expect(
      await ERC721.connect(walletTo)['safeTransferFrom(address,address,uint256)'](
        walletToAddress,
        TokenReceiver.address,
        tokenId1,
      ),
    )
      .to.emit(ERC721, 'Transfer')
      .withArgs(walletToAddress, TokenReceiver.address, tokenId1);
  });
  it('should be return revert to Non ERC721_Receiver_Contract', async () => {
    const accounts = await ethers.getSigners();
    [wallet, walletTo, dummy] = accounts;
    const walletToAddress = await walletTo.getAddress();
    const ERC721Contract = await ethers.getContractFactory('contracts/ERC721.sol:ERC721', wallet);
    ERC721 = await ERC721Contract.deploy();
    const SampleContract = await ethers.getContractFactory('contracts/Sample.sol:Sample', wallet);
    Sample = await SampleContract.deploy();
    await Sample.initialize('sample');

    expect(await ERC721.mintTo(walletToAddress, tokenId1))
      .to.emit(ERC721, 'Transfer')
      .withArgs(constants.AddressZero, walletToAddress, 1);
    expect(await ERC721.ownerOf(tokenId1)).to.be.equal(walletToAddress);
    await expect(
      ERC721.connect(walletTo)['safeTransferFrom(address,address,uint256)'](walletToAddress, Sample.address, tokenId1),
    ).revertedWith('Sent to not ERC721 Receiver Contract');
  });
});
