import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer, constants } from 'ethers';
import { Address } from 'hardhat-deploy/dist/types';

describe.skip('ERC721Enumerable', () => {
  let ERC721Enumerable: Contract;

  let wallet: Signer;
  let walletTo: Signer;

  const tokenId1 = 1;

  describe('supportsInterface', () => {
    it('should be success with supported interfaces', async () => {
      const ERC721EnumerableContract = await ethers.getContractFactory(
        'contracts/ERC721Enumerable.sol:ERC721Enumerable',
        wallet,
      );
      ERC721Enumerable = await ERC721EnumerableContract.deploy();
      expect(await ERC721Enumerable.supportsInterface('0x01ffc9a7')).to.be.equal(true); //ERC165
      expect(await ERC721Enumerable.supportsInterface('0x80ac58cd')).to.be.equal(true); //ERC721
      expect(await ERC721Enumerable.supportsInterface('0x780e9d63')).to.be.equal(true); //ERC721Enumerable
      expect(await ERC721Enumerable.supportsInterface('0x5b5e139f')).to.be.equal(false); //ERC721Metadata
    });
  });

  describe('mintToWithIndex', () => {
    it('should be success', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721EnumerableContract = await ethers.getContractFactory(
        'contracts/ERC721Enumerable.sol:ERC721Enumerable',
        wallet,
      );
      ERC721Enumerable = await ERC721EnumerableContract.deploy();
      expect(await ERC721Enumerable.connect(walletTo).totalSupply()).to.equal('0');
      expect(await ERC721Enumerable.mintWithIndex(walletToAddress, tokenId1))
        .to.emit(ERC721Enumerable, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721Enumerable.connect(walletTo).totalSupply()).to.equal('1');
    });
  });

  describe('totalSupply', () => {
    it('should be success with the amount of all tokens', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721EnumerableContract = await ethers.getContractFactory(
        'contracts/ERC721Enumerable.sol:ERC721Enumerable',
        wallet,
      );
      ERC721Enumerable = await ERC721EnumerableContract.deploy();
      expect(await ERC721Enumerable.connect(walletTo).totalSupply()).to.equal('0');
      expect(await ERC721Enumerable.mintWithIndex(walletToAddress, tokenId1))
        .to.emit(ERC721Enumerable, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721Enumerable.connect(walletTo).totalSupply()).to.equal('1');
    });
  });

  describe('tokenByIndex', () => {
    it('should be success with index of all tokens', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721EnumerableContract = await ethers.getContractFactory(
        'contracts/ERC721Enumerable.sol:ERC721Enumerable',
        wallet,
      );
      ERC721Enumerable = await ERC721EnumerableContract.deploy();
      expect(await ERC721Enumerable.mintWithIndex(walletToAddress, tokenId1))
        .to.emit(ERC721Enumerable, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721Enumerable.tokenByIndex(0)).to.be.equal('1');
    });

    it('should return revert if input index is greater than the amount of all tokens', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721EnumerableContract = await ethers.getContractFactory(
        'contracts/ERC721Enumerable.sol:ERC721Enumerable',
        wallet,
      );
      ERC721Enumerable = await ERC721EnumerableContract.deploy();
      expect(await ERC721Enumerable.mintWithIndex(walletToAddress, tokenId1))
        .to.emit(ERC721Enumerable, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      await expect(ERC721Enumerable.tokenByIndex(1)).revertedWith('Invalid Index');
    });
  });

  describe('tokenOfOwnerByIndex', () => {
    it('should be success with index of owner tokens list', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721EnumerableContract = await ethers.getContractFactory(
        'contracts/ERC721Enumerable.sol:ERC721Enumerable',
        wallet,
      );
      ERC721Enumerable = await ERC721EnumerableContract.deploy();
      expect(await ERC721Enumerable.mintWithIndex(walletToAddress, tokenId1))
        .to.emit(ERC721Enumerable, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      expect(await ERC721Enumerable.tokenOfOwnerByIndex(walletToAddress, 0)).to.be.equal('1');
    });
    it('should return revert if input index is greater than the amount of all tokens', async () => {
      const accounts = await ethers.getSigners();
      [wallet, walletTo] = accounts;
      const walletToAddress = await walletTo.getAddress();
      const ERC721EnumerableContract = await ethers.getContractFactory(
        'contracts/ERC721Enumerable.sol:ERC721Enumerable',
        wallet,
      );
      ERC721Enumerable = await ERC721EnumerableContract.deploy();
      expect(await ERC721Enumerable.mintWithIndex(walletToAddress, tokenId1))
        .to.emit(ERC721Enumerable, 'Transfer')
        .withArgs(constants.AddressZero, walletToAddress, 1);
      await expect(ERC721Enumerable.tokenOfOwnerByIndex(walletToAddress, 1)).revertedWith('Invalid Index');
    });
  });
});
