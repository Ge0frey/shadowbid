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
  CheckCircle,
  Shield,
  Eye,
  Sparkles
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

  // Stats
  const stats = {
    total: bids.length,
    active: bids.filter(b => "open" in b.auctionState && Date.now() / 1000 < b.auctionEndTime).length,
    won: bids.filter(b => b.isWinner).length,
  };

  if (!connected) {
    return (
      <div className="min-h-screen">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/50 to-surface-950 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center">
              <Lock className="w-10 h-10 text-surface-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="heading-2 text-surface-100 mb-3 text-center">
            Connect Your Wallet
          </h1>
          <p className="text-muted text-center max-w-md mb-6">
            Please connect your wallet to view your sealed bids across all auctions.
          </p>
          
          <Link href="/auctions" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-surface-800">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 to-surface-950" />
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-10">
          <Link 
            href="/auctions" 
            className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-200 text-sm mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Auctions
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-surface-100 mb-2">
                My Bids
              </h1>
              <p className="text-surface-400">
                Track your sealed bids across all auctions
              </p>
            </div>

            {/* Quick Stats */}
            {bids.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/40 border border-surface-700/50">
                  <Lock className="w-4 h-4 text-accent-500" />
                  <span className="text-surface-400 text-sm">Total:</span>
                  <span className="font-semibold text-surface-100">{stats.total}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/40 border border-surface-700/50">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-surface-400 text-sm">Active:</span>
                  <span className="font-semibold text-surface-100">{stats.active}</span>
                </div>
                {stats.won > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success-900/30 border border-success-700/50">
                    <Trophy className="w-4 h-4 text-success-500" />
                    <span className="text-success-400 text-sm">Won:</span>
                    <span className="font-semibold text-success-300">{stats.won}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
            <p className="text-muted">Loading your bids...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-error-900/30 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-error-400" />
            </div>
            <p className="text-error-400 mb-4">{error}</p>
            <button onClick={fetchMyBids} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center">
                <Lock className="w-10 h-10 text-surface-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-surface-200 mb-2">No Bids Yet</h3>
            <p className="text-muted max-w-md mb-8 leading-relaxed">
              You haven&apos;t placed any bids yet. Browse active auctions to start bidding with complete privacy!
            </p>
            <Link href="/auctions" className="btn-primary group">
              Browse Auctions
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
      <Card className="group hover:border-surface-700 transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              bid.isWinner 
                ? "bg-gradient-to-br from-success-900/50 to-success-900/20 text-success-400 border border-success-700/50" 
                : isActive 
                  ? "bg-gradient-to-br from-accent-900/50 to-accent-900/20 text-accent-400 border border-accent-700/50"
                  : "bg-surface-800/50 text-surface-400 border border-surface-700/50"
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
                <h3 className="font-semibold text-surface-100 truncate group-hover:text-accent-400 transition-colors">
                  {bid.auctionTitle}
                </h3>
                {bid.isWinner && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-900/50 text-success-300 text-xs font-medium border border-success-700/50">
                    <Sparkles className="w-3 h-3" />
                    Winner
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-surface-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent-500" />
                  Sealed Bid
                </span>
                <span className="hidden sm:inline">
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
              <div className="w-8 h-8 rounded-lg bg-surface-800/50 flex items-center justify-center text-surface-600 group-hover:text-accent-500 group-hover:bg-accent-900/20 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
