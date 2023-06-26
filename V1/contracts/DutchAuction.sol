//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DutchAuction {

    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;

    uint256 public startBlock;
    uint256 public endBlock;

    uint256 public initialPrice;
    bool public auctionOpenStatus;

    address public buyer;
    address public seller;

    constructor(uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement ) {

        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

        
        initialPrice = reservePrice + (numBlocksAuctionOpen * offerPriceDecrement);
        auctionOpenStatus = true;

        startBlock = block.number;
        endBlock = startBlock + numBlocksAuctionOpen;

        buyer = payable(address(0));
        seller = payable(msg.sender);
    }


    function placeBid() public payable returns(address) {
        require(auctionOpenStatus, "Auction has already closed");
        require(msg.sender != seller, "Seller cannot bid");
        require(msg.value > 0, "Bid value must be greater than zero");

        uint256 currentOffer = calculateCurrentOffer();
        require(msg.value >= currentOffer, "Bid is lower than current offer");

        uint256 currentBlock = getBlock();
        require(currentBlock < endBlock, "Auction has already ended");

        buyer = msg.sender;
        payable(seller).transfer(msg.value);

        auctionOpenStatus = false;
        return buyer;
    }


    function calculateCurrentOffer() view public returns(uint256) {
        return initialPrice - ((getBlock()  - startBlock) * offerPriceDecrement);
    }

    function getBlock() view public returns(uint256) {
        return block.number;
    }
}
