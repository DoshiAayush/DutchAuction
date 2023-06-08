const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFTDutchAuction_ERC20Bids', function () {
  let nftDutchAuction;
  let erc20Token;
  let erc721Token;
  let owner;
  let bidder1;
  let bidder2;

  const ERC20_TOKEN_AMOUNT = ethers.utils.parseEther('100');
  const RESERVE_PRICE = ethers.utils.parseEther('1');
  const NUM_BLOCKS_AUCTION_OPEN = 10;
  const OFFER_PRICE_DECREMENT = ethers.utils.parseEther('0.1');

  beforeEach(async function () {
    [owner, bidder1, bidder2] = await ethers.getSigners();

    const ERC20Token = await ethers.getContractFactory('ERC20Token'); // Replace with your ERC20 token contract factory
    erc20Token = await ERC20Token.deploy(ERC20_TOKEN_AMOUNT);
    await erc20Token.deployed();

    const ERC721Token = await ethers.getContractFactory('ERC721Token'); // Replace with your ERC721 token contract factory
    erc721Token = await ERC721Token.deploy();
    await erc721Token.deployed();

    const NFTDutchAuction = await ethers.getContractFactory('NFTDutchAuction_ERC20Bids');
    nftDutchAuction = await NFTDutchAuction.deploy(
      erc20Token.address,
      erc721Token.address,
      1, // NFT token ID
      RESERVE_PRICE,
      NUM_BLOCKS_AUCTION_OPEN,
      OFFER_PRICE_DECREMENT
    );
    await nftDutchAuction.deployed();
  });
  
 
  it('should place a bid and update highest bidder and highest bid', async function () {
    const bidAmount = ethers.utils.parseEther('1.2');
  
    // Transfer tokens from owner to bidder1
    await erc20Token.transfer(bidder1.address, bidAmount);
  
    // Set the allowance of bidder1 to bidAmount tokens for the NFTDutchAuction contract
    await erc20Token.connect(bidder1).approve(nftDutchAuction.address, bidAmount);
  
    await nftDutchAuction.connect(bidder1).placeBid(bidAmount);
  
    expect(await nftDutchAuction.getHighestBidder()).to.equal(bidder1.address);
    expect(await nftDutchAuction.getHighestBid()).to.equal(bidAmount);
  });
  
  it('should not update highest bidder and highest bid with a lower bid', async function () {
    const initialBidAmount = ethers.utils.parseEther('2');
    const lowerBidAmount = ethers.utils.parseEther('1.5');
  
    // Transfer tokens from owner to bidder1
    await erc20Token.transfer(bidder1.address, initialBidAmount);
  
    // Set the allowance of bidder1 for the NFTDutchAuction contract
    await erc20Token.connect(bidder1).approve(nftDutchAuction.address, initialBidAmount);
  
    // Place initial bid
    await nftDutchAuction.connect(bidder1).placeBid(initialBidAmount);
  
    // Attempt to place a lower bid
    await expect(nftDutchAuction.connect(bidder1).placeBid(lowerBidAmount)).to.be.reverted;
  
    // Check that highest bidder and highest bid remain the same
    expect(await nftDutchAuction.getHighestBidder()).to.equal(bidder1.address);
    expect(await nftDutchAuction.getHighestBid()).to.equal(initialBidAmount);
  });


  it('should not allow placing a bid after the auction is closed', async function () {
    const bidAmount = ethers.utils.parseEther('1.5');
  
    // Transfer tokens from owner to bidder1
    await erc20Token.transfer(bidder1.address, bidAmount);
  
    // Set the allowance of bidder1 for the NFTDutchAuction contract
    await erc20Token.connect(bidder1).approve(nftDutchAuction.address, bidAmount);
  
    // Increase the time to simulate the passage of time
    await ethers.provider.send('evm_increaseTime', [NUM_BLOCKS_AUCTION_OPEN * 15]);
    await ethers.provider.send('evm_mine');
  
    // Attempt to place a bid after the auction is closed
    await expect(nftDutchAuction.connect(bidder1).placeBid(bidAmount)).to.be.reverted;
  
    // Check that highest bidder and highest bid remain unset
    expect(await nftDutchAuction.getHighestBidder()).to.equal(ethers.constants.AddressZero);
    expect(await nftDutchAuction.getHighestBid()).to.equal(ethers.constants.Zero);
  });
  
  
});
