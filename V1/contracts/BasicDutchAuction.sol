// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract BasicDutchAuction {
    address public seller;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public currentPrice;
    bool public auctionEnded;
    address public highestBidder;
    uint256 public highestBid;

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        seller = msg.sender;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
      
        currentPrice = reservePrice + (_numBlocksAuctionOpen * _offerPriceDecrement);
        
    }

    function placeBid() external payable {
       
        require(msg.value >= currentPrice, "Bid amount is less than the current price");
        require(!auctionEnded, "Auction has already ended");

        if (msg.value > highestBid) {
            
            highestBidder = msg.sender;
            highestBid = msg.value;
            auctionEnded = true;
        } 

        currentPrice -= offerPriceDecrement;

      
    }
}
