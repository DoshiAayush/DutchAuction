// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract NFTDutchAuction_ERC20BidsUpgrade is
    OwnableUpgradeable,
    UUPSUpgradeable
{
    ERC721Upgradeable public nftContract;
    uint256 public nftTokenId;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public auctionEndTime;
uint256 public finalPrice;
uint256 public initialPrice;
    IERC20Upgradeable public erc20Token;

    function initialize(
        address _erc20TokenAddress,
        address _erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();

        erc20Token = IERC20Upgradeable(_erc20TokenAddress);
        nftContract = ERC721Upgradeable(_erc721TokenAddress);
        nftTokenId = _nftTokenId;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

initialPrice =
            reservePrice +
            numBlocksAuctionOpen *
            offerPriceDecrement;
        auctionEndTime = 0;
    }

   function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function startAuction() external {
        require(auctionEndTime == 0, "Auction already started");
        auctionEndTime = block.number + numBlocksAuctionOpen;
    }


function calculatePrice() public view returns (uint256) {
       uint256 blocksRemaining = auctionEndTime - block.number - 1; // Subtract 1 to account for the current block
        
        if (block.number > blocksRemaining) {
            return reservePrice;
        }

        return initialPrice - (block.number * offerPriceDecrement);
    }


    function bid(uint256 currentPrice) external {
    require(erc20Token.allowance(msg.sender, address(this)) >= currentPrice, "ERC20: insufficient allowance");
   
    
    finalPrice = calculatePrice();
    
    erc20Token.transferFrom(msg.sender, address(this), currentPrice);
    nftContract.transferFrom(address(this), msg.sender, nftTokenId);
}

}
