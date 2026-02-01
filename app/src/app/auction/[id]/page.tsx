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
  ChevronRight,
  Gavel,
  EyeOff,
  TrendingUp,
  Trophy,
  Zap,
  Coins,
  FileText
} from "lucide-react";
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
      <div className="min-h-screen bg-surface-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700/50 flex items-center justify-center shadow-2xl">
              <Loader2 className="w-9 h-9 animate-spin text-accent-500" />
            </div>
          </div>
          <p className="text-surface-400 mt-6 text-sm tracking-wide">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-surface-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-error-500/5 rounded-full blur-[150px]" />
        </div>
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-error-500/10 rounded-3xl blur-2xl" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-error-900/50 to-surface-900 border border-error-800/50 flex items-center justify-center shadow-2xl">
              <AlertCircle className="w-12 h-12 text-error-400" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-100 mb-3">Auction Not Found</h1>
          <p className="text-surface-400 text-center max-w-md mb-8 leading-relaxed">{error || "This auction does not exist or has been removed."}</p>
          <Link 
            href="/auctions" 
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-800/80 border border-surface-700/50 text-surface-200 hover:bg-surface-700/80 hover:border-surface-600/50 transition-all duration-200"
          >
            <Gavel className="w-4 h-4 text-accent-500" />
            <span>Browse Auctions</span>
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
    <div className="min-h-screen bg-surface-950">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="relative border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link 
              href="/auctions" 
              className="flex items-center gap-1.5 text-surface-500 hover:text-accent-400 transition-colors duration-200"
            >
              <Gavel className="w-[18px] h-[18px]" />
              <span className="font-medium">Auctions</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-surface-600" />
            <span className="text-surface-300 font-medium truncate max-w-[280px]">{auction.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative border-b border-surface-800/60">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/60 to-surface-950/80" />
        
        <div className="relative container mx-auto px-4 sm:px-6 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Status & Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className={`${getAuctionStateColor(auction.state)} px-3 py-1.5 text-xs font-semibold tracking-wide uppercase`}>
                  {getAuctionStateLabel(auction.state)}
                </span>
                {isSeller && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800/80 text-surface-300 text-xs font-medium border border-surface-700/50">
                    <User className="w-3.5 h-3.5 text-accent-500" />
                    Your Auction
                  </span>
                )}
                {isWinner && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-900/40 text-success-300 text-xs font-semibold border border-success-700/40">
                    <Trophy className="w-3.5 h-3.5" />
                    You Won!
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-surface-50 mb-4 tracking-tight">
                {auction.title}
              </h1>
              
              {/* Seller Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-700 to-surface-800 border border-surface-600/50 flex items-center justify-center">
                  <User className="w-4 h-4 text-surface-400" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-surface-500">Created by</span>
                  <span className="font-mono text-surface-300 bg-surface-800/60 px-2 py-0.5 rounded">{shortenAddress(auction.seller.toBase58())}</span>
                </div>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={refreshAuction}
              className="self-start p-3 rounded-xl bg-surface-800/60 border border-surface-700/50 text-surface-400 hover:text-surface-200 hover:bg-surface-700/60 hover:border-surface-600/50 transition-all duration-200"
              title="Refresh auction data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-2xl bg-gradient-to-br from-surface-900/90 to-surface-900/70 border border-surface-800/60 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-surface-800/80 border border-surface-700/50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-surface-400" />
                </div>
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Description</h3>
              </div>
              <p className="text-surface-300 leading-relaxed">
                {auction.description || "No description provided for this auction."}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Reserve Price */}
              <div className="rounded-2xl bg-gradient-to-br from-surface-900/90 to-surface-900/70 border border-surface-800/60 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-900/40 to-accent-900/20 border border-accent-700/30 flex items-center justify-center">
                    <Coins className="w-7 h-7 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-1">Reserve Price</p>
                    <p className="text-2xl font-bold text-surface-50">
                      {formatSol(auction.reservePrice)} <span className="text-base text-surface-400 font-semibold">SOL</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Sealed Bids */}
              <div className="rounded-2xl bg-gradient-to-br from-surface-900/90 to-surface-900/70 border border-surface-800/60 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-700/30 flex items-center justify-center">
                    <Users className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-1">Sealed Bids</p>
                    <div className="flex items-center gap-2.5">
                      <p className="text-2xl font-bold text-surface-50">{auction.bidCount}</p>
                      <Lock className="w-4 h-4 text-accent-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl bg-gradient-to-br from-surface-900/90 to-surface-900/70 border border-surface-800/60 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent-900/30 border border-accent-700/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-accent-400" />
                </div>
                <h3 className="text-sm font-semibold text-surface-200">Auction Timeline</h3>
              </div>
              
              <div className="space-y-0">
                <TimelineItem
                  label="Started"
                  value={formatDate(auction.startTime)}
                  completed={now >= auction.startTime}
                  active={isActive}
                  icon={<Zap className="w-4 h-4" />}
                  isFirst
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
                      <span className="font-mono text-xs bg-surface-800/80 px-2 py-0.5 rounded">{shortenAddress(auction.winner.toBase58())}</span>
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
                      <span className="text-success-400 font-bold">
                        {formatSol(auction.winningAmount)} SOL
                      </span>
                    }
                    completed={true}
                    active={false}
                    icon={<CheckCircle className="w-4 h-4" />}
                    isLast
                  />
                )}
              </div>
            </div>

            {/* Encrypted Bid Data */}
            {auction.highestBidHandle > 0 && !isSettled && (
              <div className="rounded-2xl bg-gradient-to-br from-accent-950/30 to-surface-900/90 border border-accent-800/30 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-accent-900/40 border border-accent-700/30 flex items-center justify-center">
                    <EyeOff className="w-4 h-4 text-accent-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-surface-200">Encrypted Bid Data</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">Current Highest Bid Handle</p>
                    <div className="p-4 bg-surface-800/50 rounded-xl border border-surface-700/40">
                      <code className="text-accent-400 font-mono text-sm break-all leading-relaxed">
                        {shortenAddress(auction.highestBidHandle.toString(), 8)}
                      </code>
                    </div>
                  </div>
                  
                  {auction.currentLeader.toBase58() !== PublicKey.default.toBase58() && (
                    <div className="flex items-center justify-between p-4 bg-surface-800/40 rounded-xl border border-surface-700/30">
                      <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">Current Leader</span>
                      <span className="font-mono text-sm text-surface-200 bg-surface-700/50 px-2.5 py-1 rounded">
                        {shortenAddress(auction.currentLeader.toBase58())}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-4 bg-accent-950/40 rounded-xl border border-accent-800/30">
                    <Lock className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-surface-400 leading-relaxed">
                      The bid amount is encrypted using Inco&apos;s confidential computing. 
                      It cannot be revealed until settlement, ensuring complete fairness.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-5">
            {/* Bid Form */}
            {canBid && (
              <BidForm
                auctionPubkey={new PublicKey(auctionId)}
                reservePrice={auction.reservePrice}
                onBidPlaced={refreshAuction}
              />
            )}

            {/* Connect Wallet Notice */}
            {isActive && !wallet.publicKey && (
              <div className="rounded-2xl bg-gradient-to-br from-surface-800/80 to-surface-900/90 border border-surface-700/50 p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-700/80 to-surface-800 border border-surface-600/50 flex items-center justify-center mx-auto mb-4">
                    <Gavel className="w-8 h-8 text-surface-400" />
                  </div>
                  <h4 className="font-semibold text-surface-200 mb-2">Ready to Bid?</h4>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    Connect your wallet to place an encrypted bid on this auction.
                  </p>
                </div>
              </div>
            )}

            {/* Seller Cannot Bid Notice */}
            {isActive && isSeller && (
              <div className="rounded-2xl bg-surface-900/70 border border-surface-800/60 p-6 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm text-surface-400 leading-relaxed">
                    As the auction creator, you cannot place bids on your own auction.
                  </p>
                </div>
              </div>
            )}

            {/* Auction Actions */}
            <AuctionActions
              auctionPubkey={new PublicKey(auctionId)}
              auction={auction}
              onActionComplete={refreshAuction}
            />

            {/* Settled Card */}
            {isSettled && (
              <div className="relative rounded-2xl bg-gradient-to-br from-success-950/40 to-surface-900/90 border border-success-700/40 p-6 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-success-500/10 rounded-full blur-3xl" />
                <div className="relative text-center">
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-success-900/50 to-success-900/30 border border-success-700/40 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-9 h-9 text-success-400" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-100 mb-2">Auction Complete</h3>
                  <p className="text-sm text-surface-500 mb-4">
                    Winner: <span className="font-mono text-surface-300 bg-surface-800/60 px-2 py-0.5 rounded">{shortenAddress(auction.winner.toBase58())}</span>
                  </p>
                  <div className="text-3xl font-bold text-success-400">
                    {formatSol(auction.winningAmount)} <span className="text-lg font-semibold">SOL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Card */}
            {isCancelled && (
              <div className="relative rounded-2xl bg-gradient-to-br from-error-950/40 to-surface-900/90 border border-error-700/40 p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-error-900/50 to-error-900/30 border border-error-700/40 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-error-400" />
                  </div>
                  <h3 className="font-bold text-surface-100 mb-2">Auction Cancelled</h3>
                  <p className="text-sm text-surface-500">
                    This auction has been cancelled by the seller.
                  </p>
                </div>
              </div>
            )}

            {/* Privacy Guarantee */}
            <div className="rounded-2xl bg-surface-900/70 border border-surface-800/60 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-accent-900/30 border border-accent-700/30 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-accent-400" />
                </div>
                <h4 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">Privacy Guarantee</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <Lock className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-surface-400">All bids are encrypted end-to-end</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <EyeOff className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-surface-400">Bid amounts hidden from everyone</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                  <span className="text-surface-400">Only winner&apos;s bid revealed at settlement</span>
                </li>
              </ul>
            </div>
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
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ label, value, completed, active = false, icon, isFirst = false, isLast = false }) => (
  <div className="relative flex items-center gap-4 py-4">
    {/* Vertical Line */}
    {!isFirst && (
      <div className={`absolute left-5 -top-4 w-0.5 h-4 ${completed ? 'bg-success-700/50' : 'bg-surface-700/50'}`} />
    )}
    {!isLast && (
      <div className={`absolute left-5 top-14 w-0.5 h-4 ${completed ? 'bg-success-700/50' : 'bg-surface-700/50'}`} />
    )}
    
    {/* Icon */}
    <div
      className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        active
          ? "bg-gradient-to-br from-accent-800/60 to-accent-900/40 text-accent-400 border border-accent-600/50 shadow-lg shadow-accent-500/20"
          : completed
            ? "bg-gradient-to-br from-success-800/50 to-success-900/30 text-success-400 border border-success-700/40"
            : "bg-surface-800/60 text-surface-500 border border-surface-700/40"
      }`}
    >
      {icon}
    </div>
    
    {/* Content */}
    <div className="flex-1 flex items-center justify-between min-w-0">
      <span className="text-sm text-surface-400">{label}</span>
      <span className={`text-sm font-medium ${active ? "text-accent-400" : completed ? "text-surface-200" : "text-surface-500"}`}>
        {value}
      </span>
    </div>
  </div>
);
