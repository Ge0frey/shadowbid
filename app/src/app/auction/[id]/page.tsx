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
  Gavel
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500 mb-4" />
        <p className="text-muted">Loading auction...</p>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-error-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-error-400" />
        </div>
        <h1 className="heading-3 text-surface-100 mb-2">Auction Not Found</h1>
        <p className="text-muted mb-6">{error || "This auction does not exist."}</p>
        <Link href="/auctions" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Back to Auctions
        </Link>
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
      {/* Breadcrumb */}
      <div className="border-b border-surface-800 bg-surface-950">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/auctions" className="text-surface-500 hover:text-surface-200 transition-colors">
              Auctions
            </Link>
            <ChevronRight className="w-4 h-4 text-surface-600" />
            <span className="text-surface-300 truncate max-w-[200px]">{auction.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={getAuctionStateColor(auction.state)}>
                        {getAuctionStateLabel(auction.state)}
                      </span>
                      {isSeller && (
                        <span className="badge bg-surface-700 text-surface-300 border-surface-600">
                          Your Auction
                        </span>
                      )}
                    </div>
                    <h1 className="heading-2 text-surface-100 mb-2">{auction.title}</h1>
                    <div className="flex items-center gap-2 text-surface-500 text-sm">
                      <User className="w-4 h-4" />
                      <span>Created by {shortenAddress(auction.seller.toBase58())}</span>
                    </div>
                  </div>
                  <button
                    onClick={refreshAuction}
                    className="btn-ghost p-2"
                    title="Refresh auction"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-surface-400 leading-relaxed">
                  {auction.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-surface-500">
                      <Shield className="w-5 h-5 text-accent-500" />
                      <span>Reserve Price</span>
                    </div>
                    <span className="text-xl font-semibold text-surface-100">
                      {formatSol(auction.reservePrice)} SOL
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-surface-500">
                      <Users className="w-5 h-5" />
                      <span>Sealed Bids</span>
                    </div>
                    <span className="text-xl font-semibold text-surface-100 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-accent-500" />
                      {auction.bidCount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-500" />
                  Auction Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TimelineItem
                    label="Started"
                    value={formatDate(auction.startTime)}
                    completed={now >= auction.startTime}
                    active={isActive}
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
                  />
                  {(isClosed || isWinnerDetermined || isSettled) && (
                    <TimelineItem
                      label="Bids Processed"
                      value={`${auction.bidsProcessed}/${auction.bidCount}`}
                      completed={auction.bidsProcessed >= auction.bidCount}
                      active={isClosed && auction.bidsProcessed < auction.bidCount}
                    />
                  )}
                  {(isWinnerDetermined || isSettled) && (
                    <TimelineItem
                      label="Winner Confirmed"
                      value={shortenAddress(auction.winner.toBase58())}
                      completed={true}
                      active={isWinnerDetermined}
                    />
                  )}
                  {isSettled && (
                    <TimelineItem
                      label="Settled"
                      value={`${formatSol(auction.winningAmount)} SOL`}
                      completed={true}
                      active={false}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Encrypted Data Info */}
            {auction.highestBidHandle > 0 && !isSettled && (
              <Card className="border-accent-800/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent-500" />
                    Encrypted Bid Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-surface-500 block mb-2">Current Highest Bid Handle</span>
                      <code className="encrypted-value text-xs break-all block p-3 bg-surface-800 rounded-lg">
                        {auction.highestBidHandle.toString()}
                      </code>
                    </div>
                    {auction.currentLeader.toBase58() !== PublicKey.default.toBase58() && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-surface-500">Current Leader</span>
                        <span className="font-medium text-surface-200">
                          {shortenAddress(auction.currentLeader.toBase58())}
                        </span>
                      </div>
                    )}
                    <div className="p-4 bg-accent-950/30 rounded-lg border border-accent-800/30">
                      <p className="text-sm text-surface-400">
                        The bid amount is encrypted using Inco&apos;s confidential computing. 
                        It cannot be revealed until settlement.
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
              <Card className="border-surface-700">
                <CardContent className="pt-6 text-center">
                  <Gavel className="w-10 h-10 text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-300 font-medium mb-2">Want to place a bid?</p>
                  <p className="text-surface-500 text-sm">
                    Connect your wallet to participate in this auction.
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
              <Card className="border-success-700/50 bg-success-950/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-success-900/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-success-400" />
                    </div>
                    <h3 className="font-semibold text-surface-100 mb-2">Auction Complete</h3>
                    <p className="text-surface-500 text-sm mb-4">
                      Winner: {shortenAddress(auction.winner.toBase58())}
                    </p>
                    <div className="text-2xl font-bold text-success-400">
                      {formatSol(auction.winningAmount)} SOL
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled Info */}
            {isCancelled && (
              <Card className="border-error-700/50 bg-error-950/20">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-10 h-10 text-error-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-surface-100 mb-2">Auction Cancelled</h3>
                  <p className="text-surface-500 text-sm">
                    This auction has been cancelled by the seller.
                  </p>
                </CardContent>
              </Card>
            )}
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
}> = ({ label, value, completed, active = false }) => (
  <div className="flex items-center gap-4">
    <div
      className={`w-3 h-3 rounded-full flex-shrink-0 ${
        active
          ? "bg-accent-500 ring-4 ring-accent-500/20"
          : completed
            ? "bg-success-500"
            : "bg-surface-700"
      }`}
    />
    <div className="flex-1 flex items-center justify-between min-w-0">
      <span className="text-surface-500 text-sm">{label}</span>
      <span className={`text-sm font-medium ${completed ? "text-surface-200" : "text-surface-400"}`}>
        {value}
      </span>
    </div>
  </div>
);
