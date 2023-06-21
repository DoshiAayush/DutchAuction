import React, { useState } from 'react';
import { ethers } from 'ethers';
import BasicDutchAuctionABI from './BasicDutchAuctionABI.json';

const BasicDutchAuctionUI = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  const connectToContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, BasicDutchAuctionABI, signer);

      // You can now interact with the contract using the `contract` object
      // For example, you can call contract functions or retrieve contract data
      // by using `await contract.functionName()` or `await contract.propertyName`

      // TODO: Implement the contract interactions

    } catch (error) {
      console.error(error);
    }
  };

  const handleBid = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, BasicDutchAuctionABI, signer);

      // Convert the bid amount to wei (assuming it's in Ether)
      const weiAmount = ethers.utils.parseEther(bidAmount);

      // Call the bid function of the contract
      await contract.bid(weiAmount);

      // TODO: Handle the bid transaction success

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Basic Dutch Auction</h1>
      <label>
        Contract Address:
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </label>
      <br />
      <label>
        Bid Amount (ETH):
        <input
          type="text"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
        />
      </label>
      <br />
      <button onClick={connectToContract}>Connect to Contract</button>
      <button onClick={handleBid}>Place Bid</button>
    </div>
  );
};

export default BasicDutchAuctionUI;
