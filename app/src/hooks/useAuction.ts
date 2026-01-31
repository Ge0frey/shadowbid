"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getReadOnlyProgram, bytesToString } from "@/lib/program";
import { AuctionState } from "@/lib/constants";

export interface AuctionData {
  publicKey: PublicKey;
  seller: PublicKey;
  itemMint: PublicKey;
  title: string;
  description: string;
  reservePrice: bigint;
  startTime: number;
  endTime: number;
  state: AuctionState;
  bidCount: number;
  bidsProcessed: number;
  highestBidHandle: bigint;
  currentLeader: PublicKey;
  winner: PublicKey;
  winningAmount: bigint;
  auctionId: bigint;
}

export function useAuction(auctionPubkey: string | PublicKey | null) {
  const { connection } = useConnection();
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuction = useCallback(async () => {
    if (!auctionPubkey) return;

    try {
      setLoading(true);
      setError(null);

      const program = getReadOnlyProgram(connection);
      if (!program) {
        throw new Error("Failed to load program");
      }

      const pubkey = typeof auctionPubkey === "string" 
        ? new PublicKey(auctionPubkey) 
        : auctionPubkey;
      
      const account = await (program.account as any).auction.fetch(pubkey);

      setAuction({
        publicKey: pubkey,
        seller: account.seller,
        itemMint: account.itemMint,
        title: bytesToString(account.title as number[]),
        description: bytesToString(account.description as number[]),
        reservePrice: BigInt(account.reservePrice.toString()),
        startTime: Number(account.startTime),
        endTime: Number(account.endTime),
        state: account.state as AuctionState,
        bidCount: account.bidCount,
        bidsProcessed: account.bidsProcessed,
        highestBidHandle: BigInt(account.highestBidHandle.toString()),
        currentLeader: account.currentLeader,
        winner: account.winner,
        winningAmount: BigInt(account.winningAmount.toString()),
        auctionId: BigInt(account.auctionId.toString()),
      });
    } catch (err: any) {
      console.error("Fetch auction error:", err);
      setError(err.message || "Failed to load auction");
      setAuction(null);
    } finally {
      setLoading(false);
    }
  }, [auctionPubkey, connection]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  return {
    auction,
    loading,
    error,
    refetch: fetchAuction,
  };
}
