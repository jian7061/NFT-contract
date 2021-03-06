import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, BigNumber, constants, Signer } from 'ethers';

describe('ERC721', () => {
  let ERC721Mock: Contract;

  let wallet: Signer;
  let Dummy: Signer;
  let Dummy2: Signer;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    [wallet, Dummy, Dummy2] = accounts;

    const ERC721MockDeployer = await ethers.getContractFactory('contracts/mocks/ERC721Mock.sol:ERC721Mock', wallet);
    ERC721Mock = await ERC721MockDeployer.deploy();
  });

  describe('#_mint()', () => {
    it('should be success to EOA', async () => {
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock.mintTo(addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, addr, '0');
    });

    it('should be revert with to zero address', async () => {
      await expect(ERC721Mock.mintTo(constants.AddressZero, '0')).revertedWith(
        'not allowed to mint to the zero address',
      );
    });

    it('should be revert with already exist token', async () => {
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock.mintTo(addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, addr, '0');
      await expect(ERC721Mock.mintTo(addr, '0')).revertedWith('Already minted token');
    });
  });

  describe('#_safemint()', () => {
    it('should be success to EOA', async () => {
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock['safeMint(address,uint256)'](addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, addr, '0');
    });

    it('should be revert with to zero address', async () => {
      await expect(ERC721Mock['safeMint(address,uint256)'](constants.AddressZero, '0')).revertedWith(
        'not allowed to mint to the zero address',
      );
    });

    it('should be revert with already exist token', async () => {
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock['safeMint(address,uint256)'](addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, addr, '0');
      await expect(ERC721Mock['safeMint(address,uint256)'](addr, '0')).revertedWith('Already minted token');
    });

    it('should be revert with no implemented receive function', async () => {
      const DummyTemplateDeployer = await ethers.getContractFactory('contracts/Sample.sol:Sample', wallet);
      const DummyTemplate = await DummyTemplateDeployer.deploy();
      await expect(ERC721Mock['safeMint(address,uint256)'](DummyTemplate.address, '0')).revertedWith(
        'sent to a contract which is non ERC721 Receiver',
      );
    });

    it('should be success with implemented receive function', async () => {
      const TokenReceiverMockDeployer = await ethers.getContractFactory(
        'contracts/mocks/TokenReceiverMock.sol:TokenReceiverMock',
        wallet,
      );
      const TokenReceiverMock = await TokenReceiverMockDeployer.deploy();
      await expect(ERC721Mock['safeMint(address,uint256)'](TokenReceiverMock.address, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, TokenReceiverMock.address, '0');
    });
  });

  describe.skip('#_burn()', async () => {
    beforeEach(async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(addr, '1');
      expect(await ERC721Mock.isApprovedForAll(walletaddr, addr)).to.deep.equal(false);
    });

    it('should be success owned nft', async () => {
      const walletaddr = await wallet.getAddress();

      expect(await ERC721Mock.burn('0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, constants.AddressZero, '0');
      expect(await ERC721Mock.ownerOf('0')).to.equal(constants.AddressZero);
      expect(await ERC721Mock.totalSupply()).to.equal('1');
    });

    it('should be revert with none existed nft', async () => {
      await expect(ERC721Mock.burn('3')).reverted;
      await expect(ERC721Mock.ownerOf('3')).reverted;
      expect(await ERC721Mock.totalSupply()).to.equal('2');
    });
  });

  describe('#totalSupply()', () => {
    it('should be success', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(addr, '1');
      await ERC721Mock.mintTo(addr, '2');
      await ERC721Mock.mintTo(addr, '3');
      await ERC721Mock.mintTo(addr, '4');
      // await expect(ERC721Mock.burn('10')).reverted;
      expect(await ERC721Mock.totalSupply()).to.equal('5');
    });

    it('initial totalsupply 0', async () => {
      expect(await ERC721Mock.totalSupply()).to.equal('0');
      const walletaddr = await wallet.getAddress();

      await ERC721Mock.mintTo(walletaddr, '0');
      expect(await ERC721Mock.totalSupply()).to.equal('1');
      // expect(await ERC721Mock.burn('0'))
      //   .to.emit(ERC721Mock, 'Transfer')
      //   .withArgs(walletaddr, constants.AddressZero, '0');
      // expect(await ERC721Mock.totalSupply()).to.equal('0');
    });
  });

  describe('#balanceOf()', () => {
    it('should be returned zero with none ownership', async () => {
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock.balanceOf(addr)).to.equal('0');
    });

    it('shoule be revert with zero address', async () => {
      await expect(ERC721Mock.balanceOf(constants.AddressZero)).revertedWith('zero address is not allowed');
    });

    it('should be returned one with one ownership', async () => {
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock.mintTo(addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, addr, '0');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
    });

    it('should be success work', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock.mintTo(addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, addr, '0');
      expect(await ERC721Mock.mintTo(walletaddr, '1'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(constants.AddressZero, walletaddr, '1');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('1');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
    });
  });

  describe('#ownerOf()', () => {
    beforeEach(async () => {
      const addr = await Dummy.getAddress();
      const walletaddr = await wallet.getAddress();

      await ERC721Mock.mintTo(addr, '0');
      await ERC721Mock.mintTo(walletaddr, '1');
    });

    it('should be success exist owner', async () => {
      const addr = await Dummy.getAddress();
      const walletaddr = await wallet.getAddress();
      expect(await ERC721Mock.ownerOf('0')).to.equal(addr);
      expect(await ERC721Mock.ownerOf('1')).to.equal(walletaddr);
    });

    it('should be reverted with zero non-exist nft', async () => {
      await expect(ERC721Mock.ownerOf('2')).reverted;
    });
  });

  describe('#getApproved()', () => {
    it('should be success with approved address', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await ERC721Mock.mintTo(walletaddr, '0');
      expect(await ERC721Mock.getApproved('0')).to.equal(constants.AddressZero);
      expect(await ERC721Mock.approve(addr, '0'))
        .to.emit(ERC721Mock, 'Approval')
        .withArgs(walletaddr, addr, '0');
      expect(await ERC721Mock.getApproved('0')).to.equal(addr);
    });
  });

  describe('#tokenByIndex()', () => {
    it('should be success with total length', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(walletaddr, '1');
      await ERC721Mock.mintTo(walletaddr, '2');
      expect(await ERC721Mock.tokenByIndex('2')).to.equal('2');
    });

    it('should be revert with over length', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(walletaddr, '1');
      await ERC721Mock.mintTo(walletaddr, '2');
      await expect(ERC721Mock.tokenByIndex('3')).revertedWith('Invalid Index');
    });
  });

  describe('#tokenOfOwnerByIndex()', () => {
    it('should be success', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(walletaddr, '1');
      await ERC721Mock.mintTo(walletaddr, '2');
      await ERC721Mock.mintTo(addr, '3');
      await ERC721Mock.mintTo(addr, '4');
      await ERC721Mock.mintTo(addr, '5');
      expect(await ERC721Mock.tokenOfOwnerByIndex(walletaddr, '2')).to.equal('2');
      expect(await ERC721Mock.tokenOfOwnerByIndex(addr, '2')).to.equal('5');
    });

    it('should be revert with over index', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(walletaddr, '1');
      await ERC721Mock.mintTo(walletaddr, '2');
      await ERC721Mock.mintTo(addr, '3');
      await ERC721Mock.mintTo(addr, '4');
      await ERC721Mock.mintTo(addr, '5');
      await expect(ERC721Mock.tokenOfOwnerByIndex(walletaddr, '4')).revertedWith('Invalid Index');
    });

    it('should be revert with end of reach', async () => {
      const walletaddr = await wallet.getAddress();
      await expect(ERC721Mock.tokenOfOwnerByIndex(walletaddr, '0')).revertedWith('Invalid Index');
    });
  });

  describe('#setApprovalForAll()', () => {
    beforeEach(async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(addr, '1');
      expect(await ERC721Mock.isApprovedForAll(walletaddr, addr)).to.deep.equal(false);
    });

    it('should be success', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      expect(await ERC721Mock.setApprovalForAll(addr, true))
        .to.emit(ERC721Mock, 'ApprovalForAll')
        .withArgs(walletaddr, addr, true);
      expect(await ERC721Mock.isApprovedForAll(walletaddr, addr)).to.equal(true);
    });

    it('should be revert with operator are msg.sender', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      await expect(ERC721Mock.setApprovalForAll(walletaddr, true)).revertedWith('not allowed to approve himself');
      expect(await ERC721Mock.isApprovedForAll(walletaddr, walletaddr)).to.equal(false);
    });
  });

  describe('#approve()', () => {
    beforeEach(async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(addr, '1');
    });

    it('should be success with owner call', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock.approve(addr, '0'))
        .to.emit(ERC721Mock, 'Approval')
        .withArgs(walletaddr, addr, '0');
    });

    it('should be revert with already owned nft', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await expect(ERC721Mock.approve(addr, '1')).revertedWith('not allowed to approve himself');
    });

    it('should be revert with not owner of nft', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      const addr2 = await Dummy2.getAddress();
      await expect(ERC721Mock.approve(addr2, '1')).revertedWith('only owner can execute');
    });

    it('should be revert with not operator of nft', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      const addr2 = await Dummy2.getAddress();
      await expect(ERC721Mock.connect(wallet).approve(addr2, '1')).revertedWith('only owner can execute');
    });

    it('should be success with operator call', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      const addr2 = await Dummy2.getAddress();
      expect(await ERC721Mock.setApprovalForAll(addr, true))
        .to.emit(ERC721Mock, 'ApprovalForAll')
        .withArgs(walletaddr, addr, true);
      expect(await ERC721Mock.connect(Dummy).approve(addr, '0'))
        .to.emit(ERC721Mock, 'Approval')
        .withArgs(walletaddr, addr, '0');
    });
  });

  describe('#transferFrom()', () => {
    beforeEach(async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(addr, '1');

      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('1');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(walletaddr);
    });

    it('should be success transfer', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock.transferFrom(walletaddr, addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, addr, '0');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('0');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('2');
      expect(await ERC721Mock.ownerOf('0')).to.equal(addr);
    });

    it('should be revert with none existed ntt', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await expect(ERC721Mock.transferFrom(addr, walletaddr, '5')).revertedWith('Not valid token');
    });

    it('should be reverted with not owned nft, caller is not owner', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await expect(ERC721Mock.connect(Dummy2).transferFrom(addr, walletaddr, '0')).revertedWith(
        'only owner or operator can execute',
      );
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('1');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(walletaddr);
    });

    it('should be reverted with not owned nft, caller is owner', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await expect(ERC721Mock.transferFrom(addr, walletaddr, '0')).revertedWith('only owner can transfer');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('1');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(walletaddr);
    });

    it('should be reverted to zero address', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await expect(ERC721Mock.transferFrom(walletaddr, constants.AddressZero, '0')).revertedWith(
        'not allowed to transfer to the zero address',
      );
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('1');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(walletaddr);
    });

    it('should be success call from approved address', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      const addr2 = await Dummy2.getAddress();
      expect(await ERC721Mock.approve(addr2, '0'))
        .to.emit(ERC721Mock, 'Approval')
        .withArgs(walletaddr, addr2, '0');
      expect(await ERC721Mock.connect(Dummy2).transferFrom(walletaddr, addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, addr, '0');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('0');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('2');
      expect(await ERC721Mock.ownerOf('0')).to.equal(addr);
    });

    it('should be success call from approved operator', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      const addr2 = await Dummy2.getAddress();
      expect(await ERC721Mock.setApprovalForAll(addr2, true))
        .to.emit(ERC721Mock, 'ApprovalForAll')
        .withArgs(walletaddr, addr2, true);
      expect(await ERC721Mock.connect(Dummy2).transferFrom(walletaddr, addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, addr, '0');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('0');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('2');
      expect(await ERC721Mock.ownerOf('0')).to.equal(addr);
    });
  });

  describe('#safeTransferFrom()', () => {
    beforeEach(async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      await ERC721Mock.mintTo(walletaddr, '0');
      await ERC721Mock.mintTo(addr, '1');

      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('1');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(walletaddr);
    });

    it('should be success transfer to EOA', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      expect(await ERC721Mock['safeTransferFrom(address,address,uint256)'](walletaddr, addr, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, addr, '0');
    });

    it('should be reverted with not owned nft, caller is not owner', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await expect(
        ERC721Mock.connect(Dummy2)['safeTransferFrom(address,address,uint256)'](addr, walletaddr, '0'),
      ).revertedWith('only owner or operator can execute');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('1');
      expect(await ERC721Mock.balanceOf(addr)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(walletaddr);
    });

    it('should be revert with none existed ntt', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      await expect(ERC721Mock['safeTransferFrom(address,address,uint256)'](walletaddr, addr, '5')).revertedWith(
        'Not valid token',
      );
    });

    it('should be revert with not impl receive function', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      const DummyTemplateDeployer = await ethers.getContractFactory('contracts/Sample.sol:Sample', wallet);
      const DummyTemplate = await DummyTemplateDeployer.deploy();

      await expect(
        ERC721Mock['safeTransferFrom(address,address,uint256)'](walletaddr, DummyTemplate.address, '0'),
      ).revertedWith('sent to a contract which is non ERC721 Receiver');
    });

    it('should be success with implemented receive function', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();

      const TokenReceiverMockDeployer = await ethers.getContractFactory(
        'contracts/mocks/TokenReceiverMock.sol:TokenReceiverMock',
        wallet,
      );
      const TokenReceiverMock = await TokenReceiverMockDeployer.deploy();

      expect(await ERC721Mock['safeTransferFrom(address,address,uint256)'](walletaddr, TokenReceiverMock.address, '0'))
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, TokenReceiverMock.address, '0');
    });

    it('should be success call from approved address', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      const addr2 = await Dummy2.getAddress();
      const TokenReceiverMockDeployer = await ethers.getContractFactory(
        'contracts/mocks/TokenReceiverMock.sol:TokenReceiverMock',
        wallet,
      );
      const TokenReceiverMock = await TokenReceiverMockDeployer.deploy();
      expect(await ERC721Mock.approve(addr2, '0'))
        .to.emit(ERC721Mock, 'Approval')
        .withArgs(walletaddr, addr2, '0');
      expect(
        await ERC721Mock.connect(Dummy2)['safeTransferFrom(address,address,uint256)'](
          walletaddr,
          TokenReceiverMock.address,
          '0',
        ),
      )
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, TokenReceiverMock.address, '0');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('0');
      expect(await ERC721Mock.balanceOf(TokenReceiverMock.address)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(TokenReceiverMock.address);
    });

    it('should be success call from approved operator', async () => {
      const walletaddr = await wallet.getAddress();
      const addr = await Dummy.getAddress();
      const addr2 = await Dummy2.getAddress();
      const TokenReceiverMockDeployer = await ethers.getContractFactory(
        'contracts/mocks/TokenReceiverMock.sol:TokenReceiverMock',
        wallet,
      );
      const TokenReceiverMock = await TokenReceiverMockDeployer.deploy();
      expect(await ERC721Mock.setApprovalForAll(addr2, true))
        .to.emit(ERC721Mock, 'ApprovalForAll')
        .withArgs(walletaddr, addr2, true);
      expect(
        await ERC721Mock.connect(Dummy2)['safeTransferFrom(address,address,uint256)'](
          walletaddr,
          TokenReceiverMock.address,
          '0',
        ),
      )
        .to.emit(ERC721Mock, 'Transfer')
        .withArgs(walletaddr, TokenReceiverMock.address, '0');
      expect(await ERC721Mock.balanceOf(walletaddr)).to.equal('0');
      expect(await ERC721Mock.balanceOf(TokenReceiverMock.address)).to.equal('1');
      expect(await ERC721Mock.ownerOf('0')).to.equal(TokenReceiverMock.address);
    });
  });
});
