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
    erc20Token = await ERC20Token.deploy('Test Token', 'TST');
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


  it('should start the auction', async () => {
    await nftAuction.startAuction();
    const auctionEndTime = await nftAuction.auctionEndTime();
    expect(auctionEndTime).to.be.above(0);
  });



  
  it('should not allow starting the auction multiple times', async () => {
    await nftAuction.startAuction();
    await expect(nftAuction.startAuction()).to.be.revertedWith('Auction already started');
  });
  
 
 
  it('should mint an NFT', async () => {
    await nftContract.mint(bidder.address); // Mint NFT to bidder's address
    const ownerOfToken = await nftContract.ownerOf(1);
    expect(ownerOfToken).to.equal(bidder.address);
  });
  
  it('should allow a bidder to place a bid and transfer NFT if bid meets the reserve price', async () => {
    const currentPrice = ethers.utils.parseEther('1');
    const deadline = Math.floor(Date.now() / 1000) + 3600; // Set the deadline to one hour from now
  
    await nftAuction.bid(currentPrice, deadline);
  
    const ownerOfToken = await nftContract.ownerOf(nftTokenId);
    expect(ownerOfToken).to.equal(bidder.address);
  });
 
});


