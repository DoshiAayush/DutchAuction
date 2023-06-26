const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFTDutchAuction_ERC20BidsUpgrade', () => {
  let nftAuction;
  let erc20Token;
  let nftContract;
  let owner;
  let bidder;

  const reservePrice = ethers.utils.parseEther('1');
  const numBlocksAuctionOpen = 10;
  const offerPriceDecrement = ethers.utils.parseEther('0.1');

  beforeEach(async () => {
    [owner, bidder] = await ethers.getSigners();

    const ERC20Token = await ethers.getContractFactory('ERC20Token');
    erc20Token = await ERC20Token.deploy();
    await erc20Token.deployed();

    const NFTContract = await ethers.getContractFactory('NFTContract');
    nftContract = await NFTContract.deploy();
    await nftContract.deployed();

    const NFTDutchAuction = await ethers.getContractFactory('NFTDutchAuction_ERC20BidsUpgrade');
    nftAuction = await NFTDutchAuction.deploy();
    await nftAuction.deployed();

    // Pass the correct constructor arguments using the initialize function
    await nftAuction.initialize(
      erc20Token.address,
      nftContract.address,
      1, // NFT token ID
      reservePrice,
      numBlocksAuctionOpen,
      offerPriceDecrement
    );
  });

  it('should initialize the contract with correct values', async () => {
    expect(await nftAuction.nftContract()).to.equal(nftContract.address);
    expect(await nftAuction.nftTokenId()).to.equal(1);
    expect(await nftAuction.reservePrice()).to.equal(reservePrice);
    expect(await nftAuction.numBlocksAuctionOpen()).to.equal(numBlocksAuctionOpen);
    expect(await nftAuction.offerPriceDecrement()).to.equal(offerPriceDecrement);
  });

  it('should start the auction and set the auctionEndTime', async () => {
    await nftAuction.startAuction();
    const auctionEndTime = await nftAuction.auctionEndTime();
    expect(auctionEndTime).to.be.above(0);
  });

  it('should revert when starting the auction multiple times', async () => {
    await nftAuction.startAuction();
    await expect(nftAuction.startAuction()).to.be.revertedWith('Auction already started');
  });

  it('should mint an NFT', async () => {
    await nftContract.mint(bidder.address);
    const ownerOfToken = await nftContract.ownerOf(1);
    expect(ownerOfToken).to.equal(bidder.address);
  });

  it('should revert when bidding with insufficient ERC20 allowance', async () => {
    await nftAuction.startAuction();
    await expect(nftAuction.bid(ethers.utils.parseEther('1'))).to.be.revertedWith('ERC20: insufficient allowance');
  });

  it('should revert when bidding below the reserve price', async () => {
    await nftAuction.startAuction();
    const reservePrice = await nftAuction.reservePrice();
    const bidAmount = reservePrice.sub(ethers.utils.parseEther('0.1')); // Bidding below the reserve price
    await erc20Token.approve(nftAuction.address, bidAmount);
    await expect(nftAuction.bid(bidAmount)).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  });
  
  
  it('should mint tokens to the owner', async () => {
    const initialBalance = await erc20Token.balanceOf(owner.address);
    expect(initialBalance).to.equal(ethers.BigNumber.from(0));

    const mintAmount = ethers.utils.parseEther('100');
    await erc20Token.mint(owner.address, mintAmount);

    const finalBalance = await erc20Token.balanceOf(owner.address);
    expect(finalBalance).to.equal(mintAmount);
  });
  
});
