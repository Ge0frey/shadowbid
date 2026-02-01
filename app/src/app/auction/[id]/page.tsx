"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { 
  Clock, 
  Users, 
  Lock, 
  User, 
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Gavel,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Countdown } from "@/components/ui/Countdown";
import { BidForm } from "@/components/auction/BidForm";
import { AuctionActions } from "@/components/auction/AuctionActions";
import { getReadOnlyProgram, bytesToString } from "@/lib/program";
import { 
  formatSol, 
  getAuctionStateLabel, 
  getAuctionStateColor,
  AuctionState 
} from "@/lib/constants";
import { shortenAddress, formatDate } from "@/lib/utils";

interface AuctionData {
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

export default function AuctionDetailPage() {
  const params = useParams();
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auctionId = params.id as string;

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);
        setError(null);

        const program = getReadOnlyProgram(connection);
        if (!program) {
          throw new Error("Failed to load program");
        }

        const auctionPubkey = new PublicKey(auctionId);
        const auctionAccount = await (program.account as any).auction.fetch(auctionPubkey);

        setAuction({
          seller: auctionAccount.seller,
          itemMint: auctionAccount.itemMint,
          title: bytesToString(auctionAccount.title as number[]),
          description: bytesToString(auctionAccount.description as number[]),
          reservePrice: BigInt(auctionAccount.reservePrice.toString()),
          startTime: Number(auctionAccount.startTime),
          endTime: Number(auctionAccount.endTime),
          state: auctionAccount.state as AuctionState,
          bidCount: auctionAccount.bidCount,
          bidsProcessed: auctionAccount.bidsProcessed,
          highestBidHandle: BigInt(auctionAccount.highestBidHandle.toString()),
          currentLeader: auctionAccount.currentLeader,
          winner: auctionAccount.winner,
          winningAmount: BigInt(auctionAccount.winningAmount.toString()),
          auctionId: BigInt(auctionAccount.auctionId.toString()),
        });
      } catch (err: any) {
        console.error("Fetch auction error:", err);
        setError(err.message || "Failed to load auction");
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchAuction();
    }
  }, [auctionId, connection]);

  const refreshAuction = useCallback(async () => {
    try {
      const program = getReadOnlyProgram(connection);
      if (!program) return;

      const auctionPubkey = new PublicKey(auctionId);
      const auctionAccount = await (program.account as any).auction.fetch(auctionPubkey);

      setAuction({
        seller: auctionAccount.seller,
        itemMint: auctionAccount.itemMint,
        title: bytesToString(auctionAccount.title as number[]),
        description: bytesToString(auctionAccount.description as number[]),
        reservePrice: BigInt(auctionAccount.reservePrice.toString()),
        startTime: Number(auctionAccount.startTime),
        endTime: Number(auctionAccount.endTime),
        state: auctionAccount.state as AuctionState,
        bidCount: auctionAccount.bidCount,
        bidsProcessed: auctionAccount.bidsProcessed,
        highestBidHandle: BigInt(auctionAccount.highestBidHandle.toString()),
        currentLeader: auctionAccount.currentLeader,
        winner: auctionAccount.winner,
        winningAmount: BigInt(auctionAccount.winningAmount.toString()),
        auctionId: BigInt(auctionAccount.auctionId.toString()),
      });
    } catch (err: any) {
      console.error("Refresh auction error:", err);
    }
  }, [auctionId, connection]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/50 to-surface-950 pointer-events-none" />
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
          </div>
          <p className="text-muted">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/50 to-surface-950 pointer-events-none" />
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-error-900/30 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-error-400" />
          </div>
          <h1 className="heading-2 text-surface-100 mb-3">Auction Not Found</h1>
          <p className="text-muted text-center max-w-md mb-8">{error || "This auction does not exist or has been removed."}</p>
          <Link href="/auctions" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const isOpen = "open" in auction.state;
  const isClosed = "closed" in auction.state;
  const isWinnerDetermined = "winnerDetermined" in auction.state;
  const isSettled = "settled" in auction.state;
  const isCancelled = "cancelled" in auction.state;
  const now = Math.floor(Date.now() / 1000);
  const isActive = isOpen && now >= auction.startTime && now < auction.endTime;
  const canBid = isActive && wallet.publicKey && auction.seller.toBase58() !== wallet.publicKey.toBase58();
  const isWinner = wallet.publicKey && auction.winner.toBase58() === wallet.publicKey.toBase58();
  const isSeller = wallet.publicKey && auction.seller.toBase58() === wallet.publicKey.toBase58();

  return (
    <div className="min-h-screen">
      {/* Header with Breadcrumb */}
      <div className="border-b border-surface-800 bg-surface-950">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/auctions" className="text-surface-500 hover:text-surface-200 transition-colors flex items-center gap-1">
              <Gavel className="w-4 h-4" />
              Auctions
            </Link>
            <ChevronRight className="w-4 h-4 text-surface-600" />
            <span className="text-surface-300 truncate max-w-[250px]">{auction.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-surface-800">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 to-surface-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={getAuctionStateColor(auction.state)}>
                  {getAuctionStateLabel(auction.state)}
                </span>
                {isSeller && (
                  <span className="badge bg-surface-700/50 text-surface-300 border-surface-600/50">
                    <User className="w-3 h-3 mr-1" />
                    Your Auction
                  </span>
                )}
                {isWinner && (
                  <span className="badge bg-success-900/50 text-success-300 border-success-700/50">
                    <Trophy className="w-3 h-3 mr-1" />
                    You Won!
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-surface-100 mb-3">
                {auction.title}
              </h1>
              
              {/* Seller */}
              <div className="flex items-center gap-2 text-surface-400">
                <div className="w-6 h-6 rounded-full bg-surface-800 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-sm">Created by</span>
                <span className="font-mono text-sm text-surface-300">{shortenAddress(auction.seller.toBase58())}</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <button
              onClick={refreshAuction}
              className="btn-ghost p-2.5 rounded-lg hover:bg-surface-800"
              title="Refresh auction"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">Description</h3>
                <p className="text-surface-300 leading-relaxed">
                  {auction.description || "No description provided for this auction."}
                </p>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-surface-900 to-surface-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-900/30 border border-accent-700/30 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-accent-500" />
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Reserve Price</p>
                      <p className="text-2xl font-bold text-surface-100">
                        {formatSol(auction.reservePrice)} <span className="text-lg text-surface-400">SOL</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-surface-900 to-surface-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-700/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-surface-500 mb-1">Sealed Bids</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-surface-100">{auction.bidCount}</p>
                        <Lock className="w-4 h-4 text-accent-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-500" />
                  Auction Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <TimelineItem
                    label="Started"
                    value={formatDate(auction.startTime)}
                    completed={now >= auction.startTime}
                    active={isActive}
                    icon={<Zap className="w-4 h-4" />}
                  />
                  <TimelineItem
                    label={isActive ? "Ends in" : "Ended"}
                    value={
                      isActive ? (
                        <Countdown endTime={auction.endTime} />
                      ) : (
                        formatDate(auction.endTime)
                      )
                    }
                    completed={now >= auction.endTime}
                    active={!isActive && (isClosed || isWinnerDetermined)}
                    icon={<Clock className="w-4 h-4" />}
                  />
                  {(isClosed || isWinnerDetermined || isSettled) && (
                    <TimelineItem
                      label="Bids Processed"
                      value={`${auction.bidsProcessed} / ${auction.bidCount}`}
                      completed={auction.bidsProcessed >= auction.bidCount}
                      active={isClosed && auction.bidsProcessed < auction.bidCount}
                      icon={<TrendingUp className="w-4 h-4" />}
                    />
                  )}
                  {(isWinnerDetermined || isSettled) && (
                    <TimelineItem
                      label="Winner Confirmed"
                      value={
                        <span className="font-mono">{shortenAddress(auction.winner.toBase58())}</span>
                      }
                      completed={true}
                      active={isWinnerDetermined}
                      icon={<Trophy className="w-4 h-4" />}
                    />
                  )}
                  {isSettled && (
                    <TimelineItem
                      label="Settled"
                      value={
                        <span className="text-success-400 font-semibold">
                          {formatSol(auction.winningAmount)} SOL
                        </span>
                      }
                      completed={true}
                      active={false}
                      icon={<CheckCircle className="w-4 h-4" />}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Encrypted Data Info */}
            {auction.highestBidHandle > 0 && !isSettled && (
              <Card className="border-accent-800/30 bg-gradient-to-br from-accent-950/20 to-surface-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-accent-500" />
                    Encrypted Bid Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-surface-500 block mb-2">Current Highest Bid Handle</span>
                      <div className="p-4 bg-surface-800/50 rounded-xl border border-surface-700/50">
                        <code className="text-accent-400 font-mono text-sm break-all">
                          {auction.highestBidHandle.toString()}
                        </code>
                      </div>
                    </div>
                    {auction.currentLeader.toBase58() !== PublicKey.default.toBase58() && (
                      <div className="flex items-center justify-between p-4 bg-surface-800/30 rounded-xl">
                        <span className="text-sm text-surface-500">Current Leader</span>
                        <span className="font-mono text-surface-200">
                          {shortenAddress(auction.currentLeader.toBase58())}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-4 bg-accent-950/30 rounded-xl border border-accent-800/30">
                      <Lock className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-surface-400 leading-relaxed">
                        The bid amount is encrypted using Inco&apos;s confidential computing. 
                        It cannot be revealed until settlement, ensuring complete fairness.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bid Form (if auction is active) */}
            {canBid && (
              <BidForm
                auctionPubkey={new PublicKey(auctionId)}
                reservePrice={auction.reservePrice}
                onBidPlaced={refreshAuction}
              />
            )}

            {/* Cannot bid notice */}
            {isActive && !wallet.publicKey && (
              <Card className="border-surface-700 bg-gradient-to-br from-surface-800/50 to-surface-900">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-700/50 flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-7 h-7 text-surface-400" />
                  </div>
                  <p className="text-surface-200 font-medium mb-2">Ready to Bid?</p>
                  <p className="text-surface-500 text-sm">
                    Connect your wallet to place an encrypted bid on this auction.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Seller cannot bid */}
            {isActive && isSeller && (
              <Card className="border-surface-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-surface-400 text-sm">
                    As the auction creator, you cannot place bids on your own auction.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Auction Actions (close, determine winner, finalize, settle) */}
            <AuctionActions
              auctionPubkey={new PublicKey(auctionId)}
              auction={auction}
              onActionComplete={refreshAuction}
            />

            {/* Settled Info */}
            {isSettled && (
              <Card className="border-success-700/50 bg-gradient-to-br from-success-950/30 to-surface-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success-500/10 rounded-full blur-2xl" />
                <CardContent className="pt-6 relative">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-success-900/30 flex items-center justify-center mx-auto mb-4 border border-success-700/50">
                      <CheckCircle className="w-8 h-8 text-success-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-100 mb-1">Auction Complete</h3>
                    <p className="text-surface-500 text-sm mb-4">
                      Winner: <span className="font-mono text-surface-300">{shortenAddress(auction.winner.toBase58())}</span>
                    </p>
                    <div className="text-3xl font-bold text-success-400">
                      {formatSol(auction.winningAmount)} <span className="text-xl">SOL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled Info */}
            {isCancelled && (
              <Card className="border-error-700/50 bg-gradient-to-br from-error-950/30 to-surface-900">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-error-900/30 flex items-center justify-center mx-auto mb-4 border border-error-700/50">
                    <AlertCircle className="w-7 h-7 text-error-400" />
                  </div>
                  <h3 className="font-semibold text-surface-100 mb-2">Auction Cancelled</h3>
                  <p className="text-surface-500 text-sm">
                    This auction has been cancelled by the seller.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Privacy Info Card */}
            <Card className="bg-surface-900/50">
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium text-surface-300 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent-500" />
                  Privacy Guarantee
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2 text-surface-400">
                    <Lock className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span>All bids are encrypted end-to-end</span>
                  </li>
                  <li className="flex items-start gap-2 text-surface-400">
                    <EyeOff className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span>Bid amounts hidden from everyone</span>
                  </li>
                  <li className="flex items-start gap-2 text-surface-400">
                    <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                    <span>Only winner&apos;s bid revealed at settlement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline Item Component
const TimelineItem: FC<{
  label: string;
  value: React.ReactNode;
  completed: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}> = ({ label, value, completed, active = false, icon }) => (
  <div className="flex items-center gap-4 py-3">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
        active
          ? "bg-accent-900/50 text-accent-400 border border-accent-700/50 ring-4 ring-accent-500/20"
          : completed
            ? "bg-success-900/50 text-success-400 border border-success-700/50"
            : "bg-surface-800/50 text-surface-500 border border-surface-700/50"
      }`}
    >
      {icon}
    </div>
    <div className="flex-1 flex items-center justify-between min-w-0">
      <span className="text-surface-400 text-sm">{label}</span>
      <span className={`text-sm font-medium ${completed ? "text-surface-200" : "text-surface-500"}`}>
        {value}
      </span>
    </div>
  </div>
);
