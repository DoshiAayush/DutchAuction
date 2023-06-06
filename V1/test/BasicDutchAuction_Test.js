const { expect } = require("chai");

describe("BasicDutchAuction", function () {
  let BasicDutchAuction;
  let auction;
  let owner;
  let bidder1;
  let bidder2;

  const reservePrice = ethers.utils.parseEther("1");
  const numBlocksAuctionOpen = 10;
  const offerPriceDecrement = ethers.utils.parseEther("0.5");

  beforeEach(async function () {
    [owner, bidder1, bidder2] = await ethers.getSigners();
    BasicDutchAuction = await ethers.getContractFactory("BasicDutchAuction");
    auction = await BasicDutchAuction.deploy(
      reservePrice,
      numBlocksAuctionOpen,
      offerPriceDecrement
    );
    await auction.deployed();
  });




  it("should initialize correctly", async function () {
    expect(await auction.seller()).to.equal(owner.address);
    expect(await auction.reservePrice()).to.equal(reservePrice);
    expect(await auction.offerPriceDecrement()).to.equal(offerPriceDecrement);
    expect(await auction.auctionEnded()).to.be.false;
    expect(await auction.highestBidder()).to.equal(ethers.constants.AddressZero);
    expect(await auction.highestBid()).to.equal(0);
  });




  it("should accept a bid and end the auction", async function () {
    const bidAmount = ethers.utils.parseEther("6.5");
    await auction.connect(bidder1).placeBid({ value: bidAmount });
    expect(await auction.highestBidder()).to.equal(bidder1.address);
    expect(await auction.highestBid()).to.equal(bidAmount);
    expect(await auction.auctionEnded()).to.be.true;    
  });



  it("should not accept a bid below the current price", async function () {
    const bidAmount = ethers.utils.parseEther("6");
    await auction.connect(bidder1).placeBid({ value: bidAmount });
    expect(await auction.highestBidder()).to.equal(bidder1.address);
    expect(await auction.highestBid()).to.equal(bidAmount);
    expect(await auction.auctionEnded()).to.be.true;
    const invalidBidAmount = ethers.utils.parseEther("4");
    await expect(auction.connect(bidder2).placeBid({ value: invalidBidAmount }))
      .to.be.revertedWith("Bid amount is less than the current price");
  });
  

  
  it("should end the auction when the reserve price is reached", async function () {
    const bidAmount = ethers.utils.parseEther("6");
    await auction.connect(bidder1).placeBid({ value: bidAmount });
    expect(await auction.highestBidder()).to.equal(bidder1.address);
    expect(await auction.highestBid()).to.equal(bidAmount);
    expect(await auction.auctionEnded()).to.be.true;
  
  
  });
  
  it("should not accept a bid if the auction has already ended", async function () {
    const bidAmount = ethers.utils.parseEther("210");
    await auction.connect(bidder1).placeBid({ value: bidAmount });
    expect(await auction.highestBidder()).to.equal(bidder1.address);
    expect(await auction.highestBid()).to.equal(bidAmount);
    expect(await auction.auctionEnded()).to.be.true;
    await expect(auction.connect(bidder2).placeBid({ value: bidAmount }))
      .to.be.revertedWith("Auction has already ended");
  });


  
});
