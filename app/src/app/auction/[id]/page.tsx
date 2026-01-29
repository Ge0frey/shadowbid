"use client";

import { FC, useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Countdown } from "@/components/ui/Countdown";
import { BidForm } from "@/components/auction/BidForm";
import { getReadOnlyProgram, bytesToString } from "@/lib/program";
import { 
  formatSol, 
  getAuctionStateLabel, 
  getAuctionStateColor,
  AuctionState 
} from "@/lib/constants";
import { shortenAddress, formatDate } from "@/lib/utils";
import { formatHandle } from "@/lib/encryption";

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
        const auctionAccount = await program.account.auction.fetch(auctionPubkey);

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

  const refreshAuction = () => {
    // Trigger re-fetch
    setLoading(true);
    // The useEffect will re-run
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-shadow-400" />
        <p className="text-midnight-400 mt-4">Loading auction...</p>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Auction Not Found</h1>
        <p className="text-midnight-400">{error || "This auction does not exist."}</p>
      </div>
    );
  }

  const isOpen = "open" in auction.state;
  const isClosed = "closed" in auction.state;
  const isWinnerDetermined = "winnerDetermined" in auction.state;
  const isSettled = "settled" in auction.state;
  const now = Math.floor(Date.now() / 1000);
  const isActive = isOpen && now >= auction.startTime && now < auction.endTime;
  const canBid = isActive && wallet.publicKey && auction.seller.toBase58() !== wallet.publicKey.toBase58();
  const isWinner = wallet.publicKey && auction.winner.toBase58() === wallet.publicKey.toBase58();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Auction Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{auction.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2 text-midnight-400">
                    <User className="w-4 h-4" />
                    <span>by {shortenAddress(auction.seller.toBase58())}</span>
                  </div>
                </div>
                <span className={`status-badge ${getAuctionStateColor(auction.state)}`}>
                  {getAuctionStateLabel(auction.state)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-midnight-300">{auction.description}</p>
            </CardContent>
          </Card>

          {/* Auction Stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-midnight-400">
                    <Shield className="w-5 h-5" />
                    <span>Reserve Price</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {formatSol(auction.reservePrice)} SOL
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-midnight-400">
                    <Users className="w-5 h-5" />
                    <span>Sealed Bids</span>
                  </div>
                  <span className="text-xl font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-shadow-400" />
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
                <Clock className="w-5 h-5 text-shadow-400" />
                Auction Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  label="Started"
                  value={formatDate(auction.startTime)}
                  completed={now >= auction.startTime}
                />
                <TimelineItem
                  label="Ends"
                  value={
                    isActive ? (
                      <Countdown endTime={auction.endTime} />
                    ) : (
                      formatDate(auction.endTime)
                    )
                  }
                  completed={now >= auction.endTime}
                />
                {(isClosed || isWinnerDetermined || isSettled) && (
                  <TimelineItem
                    label="Bids Processed"
                    value={`${auction.bidsProcessed}/${auction.bidCount}`}
                    completed={auction.bidsProcessed >= auction.bidCount}
                  />
                )}
                {isSettled && (
                  <TimelineItem
                    label="Settled"
                    value={`${formatSol(auction.winningAmount)} SOL`}
                    completed={true}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Encrypted Data Info */}
          {auction.highestBidHandle > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-shadow-400" />
                  Encrypted Auction Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-midnight-400">Highest Bid Handle</span>
                    <span className="encrypted-value">
                      {formatHandle(auction.highestBidHandle)}
                    </span>
                  </div>
                  {auction.currentLeader.toBase58() !== PublicKey.default.toBase58() && (
                    <div className="flex items-center justify-between">
                      <span className="text-midnight-400">Current Leader</span>
                      <span className="text-white">
                        {shortenAddress(auction.currentLeader.toBase58())}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-shadow-950/30 rounded-lg border border-shadow-800/50">
                  <p className="text-sm text-midnight-400">
                    Bid amounts are encrypted and cannot be revealed until settlement.
                    The &quot;handle&quot; is a cryptographic reference to the encrypted value.
                  </p>
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

          {/* Winner Actions */}
          {isWinnerDetermined && isWinner && (
            <Card className="border-green-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  You Won!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-midnight-300 mb-4">
                  Congratulations! You have the highest bid. Click below to reveal
                  your bid and complete the payment.
                </p>
                <button className="btn-primary w-full">
                  Reveal & Settle
                </button>
              </CardContent>
            </Card>
          )}

          {/* Auction Closed Info */}
          {isClosed && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">Bidding Closed</h3>
                  <p className="text-midnight-400 text-sm">
                    Processing {auction.bidCount} encrypted bids to determine the winner.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settled Info */}
          {isSettled && (
            <Card className="border-blue-700/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">Auction Settled</h3>
                  <p className="text-midnight-400 text-sm mb-4">
                    Winner: {shortenAddress(auction.winner.toBase58())}
                  </p>
                  <div className="text-2xl font-bold text-white">
                    {formatSol(auction.winningAmount)} SOL
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
}> = ({ label, value, completed }) => (
  <div className="flex items-center gap-4">
    <div
      className={`w-3 h-3 rounded-full ${
        completed ? "bg-green-500" : "bg-midnight-600"
      }`}
    />
    <div className="flex-1 flex items-center justify-between">
      <span className="text-midnight-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  </div>
);
