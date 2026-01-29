// This file will be auto-generated after running `anchor build`
// For now, we define the types manually based on our program

import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type Shadowbid = {
  version: "0.1.0";
  name: "shadowbid";
  instructions: [
    {
      name: "createAuction";
      accounts: [
        { name: "seller"; isMut: true; isSigner: true },
        { name: "auction"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "params"; type: { defined: "CreateAuctionParams" } }];
    },
    {
      name: "placeBid";
      accounts: [
        { name: "bidder"; isMut: true; isSigner: true },
        { name: "auction"; isMut: true; isSigner: false },
        { name: "bid"; isMut: true; isSigner: false },
        { name: "incoLightningProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "ciphertext"; type: "bytes" }];
    },
    {
      name: "closeBidding";
      accounts: [
        { name: "caller"; isMut: true; isSigner: true },
        { name: "auction"; isMut: true; isSigner: false }
      ];
      args: [];
    },
    {
      name: "determineWinner";
      accounts: [
        { name: "caller"; isMut: true; isSigner: true },
        { name: "auction"; isMut: true; isSigner: false },
        { name: "bid"; isMut: true; isSigner: false },
        { name: "incoLightningProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "finalizeWinner";
      accounts: [
        { name: "caller"; isMut: true; isSigner: true },
        { name: "auction"; isMut: true; isSigner: false },
        { name: "allowanceAccount"; isMut: true; isSigner: false },
        { name: "winnerAddress"; isMut: false; isSigner: false },
        { name: "incoLightningProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "settleAuction";
      accounts: [
        { name: "winner"; isMut: true; isSigner: true },
        { name: "auction"; isMut: true; isSigner: false },
        { name: "seller"; isMut: true; isSigner: false },
        { name: "instructions"; isMut: false; isSigner: false },
        { name: "incoLightningProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "handleBytes"; type: "bytes" },
        { name: "plaintextBytes"; type: "bytes" }
      ];
    },
    {
      name: "cancelAuction";
      accounts: [
        { name: "seller"; isMut: true; isSigner: true },
        { name: "auction"; isMut: true; isSigner: false }
      ];
      args: [{ name: "reason"; type: "string" }];
    }
  ];
  accounts: [
    {
      name: "auction";
      type: {
        kind: "struct";
        fields: [
          { name: "seller"; type: "publicKey" },
          { name: "itemMint"; type: "publicKey" },
          { name: "title"; type: { array: ["u8", 64] } },
          { name: "description"; type: { array: ["u8", 256] } },
          { name: "reservePrice"; type: "u64" },
          { name: "startTime"; type: "i64" },
          { name: "endTime"; type: "i64" },
          { name: "state"; type: { defined: "AuctionState" } },
          { name: "bidCount"; type: "u32" },
          { name: "bidsProcessed"; type: "u32" },
          { name: "highestBidHandle"; type: "u128" },
          { name: "currentLeader"; type: "publicKey" },
          { name: "winner"; type: "publicKey" },
          { name: "winningAmount"; type: "u64" },
          { name: "auctionId"; type: "u64" },
          { name: "bump"; type: "u8" }
        ];
      };
    },
    {
      name: "bid";
      type: {
        kind: "struct";
        fields: [
          { name: "auction"; type: "publicKey" },
          { name: "bidder"; type: "publicKey" },
          { name: "encryptedAmount"; type: "u128" },
          { name: "createdAt"; type: "i64" },
          { name: "updatedAt"; type: "i64" },
          { name: "processed"; type: "bool" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
  types: [
    {
      name: "CreateAuctionParams";
      type: {
        kind: "struct";
        fields: [
          { name: "auctionId"; type: "u64" },
          { name: "title"; type: "string" },
          { name: "description"; type: "string" },
          { name: "reservePrice"; type: "u64" },
          { name: "duration"; type: "i64" },
          { name: "itemMint"; type: { option: "publicKey" } }
        ];
      };
    },
    {
      name: "AuctionState";
      type: {
        kind: "enum";
        variants: [
          { name: "Open" },
          { name: "Closed" },
          { name: "WinnerDetermined" },
          { name: "Settled" },
          { name: "Cancelled" }
        ];
      };
    }
  ];
  events: [
    {
      name: "AuctionCreated";
      fields: [
        { name: "auction"; type: "publicKey"; index: false },
        { name: "seller"; type: "publicKey"; index: false },
        { name: "title"; type: "string"; index: false },
        { name: "reservePrice"; type: "u64"; index: false },
        { name: "startTime"; type: "i64"; index: false },
        { name: "endTime"; type: "i64"; index: false }
      ];
    },
    {
      name: "BidPlaced";
      fields: [
        { name: "auction"; type: "publicKey"; index: false },
        { name: "bidder"; type: "publicKey"; index: false },
        { name: "bidNumber"; type: "u32"; index: false },
        { name: "timestamp"; type: "i64"; index: false }
      ];
    }
  ];
  errors: [
    { code: 6000; name: "DurationTooShort"; msg: "Auction duration is too short" },
    { code: 6001; name: "DurationTooLong"; msg: "Auction duration is too long" },
    { code: 6002; name: "AuctionNotOpen"; msg: "Auction is not open for bidding" },
    { code: 6003; name: "BiddingEnded"; msg: "Bidding period has ended" },
    { code: 6004; name: "NotSeller"; msg: "Only the seller can perform this action" },
    { code: 6005; name: "NotWinner"; msg: "Only the winner can perform this action" }
  ];
};
