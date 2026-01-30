"use client";

import { FC, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Loader2, Lock, ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Countdown } from "@/components/ui/Countdown";
import { getReadOnlyProgram, bytesToString } from "@/lib/program";
import { formatSol, getAuctionStateLabel, getAuctionStateColor, AuctionState } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";
import { findBidPda } from "@/lib/pda";

interface BidData {
  publicKey: PublicKey;
  auctionPubkey: PublicKey;
  auctionTitle: string;
  auctionEndTime: number;
  auctionState: AuctionState;
  bidTime: number;
  isWinner: boolean;
}

export default function MyBidsPage() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [bids, setBids] = useState<BidData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyBids = useCallback(async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);

      const program = getReadOnlyProgram(connection);
      if (!program) {
        throw new Error("Failed to load program");
      }

      // Fetch all auctions
      const auctions = await program.account.auction.all();
      
      // For each auction, check if user has a bid
      const userBids: BidData[] = [];
      
      for (const auction of auctions) {
        try {
          const [bidPda] = findBidPda(auction.publicKey, publicKey);
          const bidAccount = await program.account.bid.fetchNullable(bidPda);
          
          if (bidAccount) {
            const isSettled = "settled" in auction.account.state;
            const isWinner = isSettled && 
              auction.account.winner && 
              auction.account.winner.toBase58() === publicKey.toBase58();
            
            userBids.push({
              publicKey: bidPda,
              auctionPubkey: auction.publicKey,
              auctionTitle: bytesToString(auction.account.title as number[]),
              auctionEndTime: Number(auction.account.endTime),
              auctionState: auction.account.state as AuctionState,
              bidTime: Number(bidAccount.timestamp),
              isWinner,
            });
          }
        } catch {
          // No bid found for this auction, skip
        }
      }

      // Sort by bid time, most recent first
      userBids.sort((a, b) => b.bidTime - a.bidTime);
      setBids(userBids);
    } catch (err: any) {
      console.error("Fetch bids error:", err);
      setError(err.message || "Failed to load bids");
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchMyBids();
    }
  }, [connected, publicKey, fetchMyBids]);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-midnight-500" />
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-midnight-400">
            Please connect your wallet to view your bids.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-midnight-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">My Bids</h1>
          <p className="text-midnight-400 text-sm">View all your sealed bids across auctions</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-shadow-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchMyBids}
            className="mt-4 btn-secondary"
          >
            Try Again
          </button>
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-midnight-800 flex items-center justify-center">
            <Lock className="w-8 h-8 text-midnight-500" />
          </div>
          <h3 className="text-xl font-semibold text-midnight-300 mb-2">
            No Bids Yet
          </h3>
          <p className="text-midnight-500 mb-6">
            You haven&apos;t placed any bids yet. Browse active auctions to get started!
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            Browse Auctions
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bids.map((bid) => (
            <BidCard key={bid.publicKey.toBase58()} bid={bid} />
          ))}
        </div>
      )}
    </div>
  );
}

const BidCard: FC<{ bid: BidData }> = ({ bid }) => {
  const now = Math.floor(Date.now() / 1000);
  const isOpen = "open" in bid.auctionState;
  const isActive = isOpen && now < bid.auctionEndTime;

  return (
    <Link href={`/auction/${bid.auctionPubkey.toBase58()}`}>
      <Card className="hover:border-shadow-500/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate">{bid.auctionTitle}</h3>
                {bid.isWinner && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                    Winner!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-midnight-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-shadow-400" />
                  Sealed Bid
                </span>
                <span>
                  Bid placed: {new Date(bid.bidTime * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className={`status-badge ${getAuctionStateColor(bid.auctionState)}`}>
                  {getAuctionStateLabel(bid.auctionState)}
                </span>
                {isActive && (
                  <div className="text-xs text-midnight-400 mt-1">
                    Ends: <Countdown endTime={bid.auctionEndTime} />
                  </div>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-midnight-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
