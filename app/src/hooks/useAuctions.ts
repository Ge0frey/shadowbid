"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getReadOnlyProgram, bytesToString } from "@/lib/program";
import { SHADOWBID_PROGRAM_ID, AuctionState } from "@/lib/constants";
import { AuctionData } from "./useAuction";

export function useAuctions(filter?: {
  seller?: PublicKey;
  state?: "open" | "closed" | "settled";
}) {
  const { connection } = useConnection();
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const program = getReadOnlyProgram(connection);
      if (!program) {
        throw new Error("Failed to load program");
      }

      // Fetch all auction accounts
      const accounts = await (program.account as any).auction.all();

      const auctionList: AuctionData[] = accounts.map((item: any) => ({
        publicKey: item.publicKey,
        seller: item.account.seller,
        itemMint: item.account.itemMint,
        title: bytesToString(item.account.title as number[]),
        description: bytesToString(item.account.description as number[]),
        reservePrice: BigInt(item.account.reservePrice.toString()),
        startTime: Number(item.account.startTime),
        endTime: Number(item.account.endTime),
        state: item.account.state as AuctionState,
        bidCount: item.account.bidCount,
        bidsProcessed: item.account.bidsProcessed,
        highestBidHandle: BigInt(item.account.highestBidHandle.toString()),
        currentLeader: item.account.currentLeader,
        winner: item.account.winner,
        winningAmount: BigInt(item.account.winningAmount.toString()),
        auctionId: BigInt(item.account.auctionId.toString()),
      }));

      // Apply filters
      let filtered = auctionList;

      if (filter?.seller) {
        filtered = filtered.filter(
          (a) => a.seller.toBase58() === filter.seller!.toBase58()
        );
      }

      if (filter?.state) {
        filtered = filtered.filter((a) => filter.state! in a.state);
      }

      // Sort by end time (most recent first)
      filtered.sort((a, b) => b.endTime - a.endTime);

      setAuctions(filtered);
    } catch (err: any) {
      console.error("Fetch auctions error:", err);
      setError(err.message || "Failed to load auctions");
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [connection, filter?.seller, filter?.state]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return {
    auctions,
    loading,
    error,
    refetch: fetchAuctions,
  };
}
