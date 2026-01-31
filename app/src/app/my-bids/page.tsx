"use client";

import { FC, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { 
  Loader2, 
  Lock, 
  ArrowLeft, 
  ArrowRight,
  Trophy,
  Clock,
  CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
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
      const auctions = await (program.account as any).auction.all();
      
      // For each auction, check if user has a bid
      const userBids: BidData[] = [];
      
      for (const auction of auctions) {
        try {
          const [bidPda] = findBidPda(auction.publicKey, publicKey);
          const bidAccount = await (program.account as any).bid.fetchNullable(bidPda);
          
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
              bidTime: Number(bidAccount.createdAt || bidAccount.updatedAt || 0),
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-surface-500" />
        </div>
        <h1 className="heading-3 text-surface-100 mb-2 text-center">
          Connect Your Wallet
        </h1>
        <p className="text-muted text-center max-w-md">
          Please connect your wallet to view your bids.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-surface-800 bg-surface-950">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/auctions" 
            className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-200 text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Auctions
          </Link>
          <h1 className="heading-2 text-surface-100">My Bids</h1>
          <p className="text-muted mt-1">
            Track your sealed bids across all auctions
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500 mb-4" />
            <p className="text-muted">Loading your bids...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-error-400 mb-4">{error}</p>
            <button onClick={fetchMyBids} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="heading-3 text-surface-200 mb-2">No Bids Yet</h3>
            <p className="text-muted max-w-md mb-6">
              You haven&apos;t placed any bids yet. Browse active auctions to get started!
            </p>
            <Link href="/auctions" className="btn-primary">
              Browse Auctions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <BidCard key={bid.publicKey.toBase58()} bid={bid} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const BidCard: FC<{ bid: BidData }> = ({ bid }) => {
  const now = Math.floor(Date.now() / 1000);
  const isOpen = "open" in bid.auctionState;
  const isSettled = "settled" in bid.auctionState;
  const isActive = isOpen && now < bid.auctionEndTime;

  return (
    <Link href={`/auction/${bid.auctionPubkey.toBase58()}`}>
      <Card className="card-interactive">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              bid.isWinner 
                ? "bg-success-900/30 text-success-400" 
                : isActive 
                  ? "bg-accent-900/30 text-accent-400"
                  : "bg-surface-800 text-surface-400"
            }`}>
              {bid.isWinner ? (
                <Trophy className="w-5 h-5" />
              ) : isActive ? (
                <Clock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-surface-100 truncate">
                  {bid.auctionTitle}
                </h3>
                {bid.isWinner && (
                  <span className="badge bg-success-900/50 text-success-300 border-success-700/50">
                    Winner
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-surface-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent-500" />
                  Sealed Bid
                </span>
                <span>
                  {bid.bidTime > 0 
                    ? `Placed ${new Date(bid.bidTime * 1000).toLocaleDateString()}` 
                    : "Recently placed"}
                </span>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className={getAuctionStateColor(bid.auctionState)}>
                  {getAuctionStateLabel(bid.auctionState)}
                </span>
                {isActive && (
                  <div className="text-xs text-surface-500 mt-1">
                    <Countdown endTime={bid.auctionEndTime} size="sm" showIcon={false} />
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-surface-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
