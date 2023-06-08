// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTDutchAuction_ERC20Bids {
    address private owner;
    address private erc20TokenAddress;
    address private erc721TokenAddress;
    uint256 private nftTokenId;
    uint256 private reservePrice;
    uint256 private numBlocksAuctionOpen;
    uint256 private offerPriceDecrement;
    uint256 private auctionEndTime;
    bool private auctionEnded;
    uint256 private highestBid;
    address private highestBidder;
    mapping(address => uint256) private bids;

    constructor(
        address _erc20TokenAddress,
        address _erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        owner = msg.sender;
        erc20TokenAddress = _erc20TokenAddress;
        erc721TokenAddress = _erc721TokenAddress;
        nftTokenId = _nftTokenId;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        auctionEndTime = block.number + numBlocksAuctionOpen;
        auctionEnded = false;
        highestBid = reservePrice;
        highestBidder = address(0);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function.");
        _;
    }

    function placeBid(uint256 amount) external {
        require(!auctionEnded, "Auction has ended.");
        require(amount > highestBid, "Bid must be higher than the current highest bid.");
        require(block.number < auctionEndTime, "Auction is closed.");
        IERC20 erc20Token = IERC20(erc20TokenAddress);
        uint256 allowance = erc20Token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Insufficient allowance for ERC20 token.");

        if (highestBidder != address(0)) {
            erc20Token.transferFrom(address(this), highestBidder, bids[highestBidder]);
        }

        erc20Token.transferFrom(msg.sender, address(this), amount);
        bids[msg.sender] = amount;
        highestBid = amount;
        highestBidder = msg.sender;
    }

 function endAuction() external onlyOwner {
    require(!auctionEnded, "Auction has already ended.");
    require(block.number >= auctionEndTime, "Auction has not ended yet.");

    IERC721 erc721Token = IERC721(erc721TokenAddress);
    erc721Token.transferFrom(address(this), highestBidder, nftTokenId);

    auctionEnded = true;
}


    function withdraw() external {
        require(auctionEnded, "Auction has not ended yet.");
        require(bids[msg.sender] > 0, "No funds available for withdrawal.");

        IERC20 erc20Token = IERC20(erc20TokenAddress);
        uint256 amount = bids[msg.sender];
        bids[msg.sender] = 0;
        erc20Token.transfer(msg.sender, amount);
    }

    function getHighestBidder() external view returns (address) {
        return highestBidder;
    }

    function getHighestBid() external view returns (uint256) {
        return highestBid;
    }

    function getAuctionEnded() external view returns (bool) {
        return auctionEnded;
    }
}
