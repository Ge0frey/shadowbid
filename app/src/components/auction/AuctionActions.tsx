"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { 
  Loader2, 
  Lock, 
  Unlock, 
  Trophy, 
  CheckCircle, 
  Play,
  AlertCircle,
  ArrowRight,
  Clock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { getProgram, getReadOnlyProgram } from "@/lib/program";
import { findBidPda, findAllowancePda } from "@/lib/pda";
import { decryptWithProof } from "@/lib/encryption";
import { handleToBuffer, plaintextToBuffer } from "@inco/solana-sdk/utils";
import { formatSol, AuctionState, INCO_LIGHTNING_PROGRAM_ID } from "@/lib/constants";

interface AuctionActionsProps {
  auctionPubkey: PublicKey;
  auction: {
    seller: PublicKey;
    state: AuctionState;
    bidCount: number;
    bidsProcessed: number;
    endTime: number;
    highestBidHandle: bigint;
    currentLeader: PublicKey;
    winner: PublicKey;
    reservePrice: bigint;
  };
  onActionComplete: () => void;
}

interface BidInfo {
  pubkey: PublicKey;
  bidder: PublicKey;
  processed: boolean;
}

export const AuctionActions: FC<AuctionActionsProps> = ({
  auctionPubkey,
  auction,
  onActionComplete,
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [unprocessedBids, setUnprocessedBids] = useState<BidInfo[]>([]);
  const [fetchingBids, setFetchingBids] = useState(false);

  const now = Math.floor(Date.now() / 1000);
  const isOpen = "open" in auction.state;
  const isClosed = "closed" in auction.state;
  const isWinnerDetermined = "winnerDetermined" in auction.state;
  const hasEnded = now >= auction.endTime;
  const allBidsProcessed = auction.bidsProcessed >= auction.bidCount;
  const isWinner = wallet.publicKey && auction.winner.toBase58() === wallet.publicKey.toBase58();
  const isCurrentLeader = wallet.publicKey && auction.currentLeader.toBase58() === wallet.publicKey.toBase58();

  // Fetch unprocessed bids when auction is closed
  const fetchUnprocessedBids = useCallback(async () => {
    if (!isClosed || allBidsProcessed) return;
    
    try {
      setFetchingBids(true);
      const program = getReadOnlyProgram(connection);
      if (!program) return;

      // Fetch all bid accounts for this auction
      const bids = await (program.account as any).bid.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: auctionPubkey.toBase58(),
          },
        },
      ]);

      const unprocessed = bids
        .filter((b: any) => !b.account.processed)
        .map((b: any) => ({
          pubkey: b.publicKey,
          bidder: b.account.bidder,
          processed: b.account.processed,
        }));

      setUnprocessedBids(unprocessed);
    } catch (err) {
      console.error("Error fetching bids:", err);
    } finally {
      setFetchingBids(false);
    }
  }, [connection, auctionPubkey, isClosed, allBidsProcessed]);

  useEffect(() => {
    fetchUnprocessedBids();
  }, [fetchUnprocessedBids]);

  // Close Bidding
  const handleCloseBidding = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    setLoading(true);
    setActionType("close");

    try {
      const program = getProgram(connection, wallet);
      if (!program) throw new Error("Failed to load program");

      await program.methods
        .closeBidding()
        .accounts({
          caller: wallet.publicKey,
          auction: auctionPubkey,
        })
        .rpc();

      toast.success("Bidding closed successfully!");
      onActionComplete();
    } catch (error: any) {
      console.error("Close bidding error:", error);
      toast.error(error.message || "Failed to close bidding");
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Determine Winner (process one bid)
  const handleDetermineWinner = async (bidPubkey: PublicKey) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    setLoading(true);
    setActionType("determine");

    try {
      const program = getProgram(connection, wallet);
      if (!program) throw new Error("Failed to load program");

      await program.methods
        .determineWinner()
        .accounts({
          caller: wallet.publicKey,
          auction: auctionPubkey,
          bid: bidPubkey,
          incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
        })
        .rpc();

      toast.success("Bid processed successfully!");
      onActionComplete();
      fetchUnprocessedBids();
    } catch (error: any) {
      console.error("Determine winner error:", error);
      toast.error(error.message || "Failed to process bid");
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Process all bids sequentially
  const handleProcessAllBids = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    if (unprocessedBids.length === 0) {
      toast.error("No bids to process");
      return;
    }

    setLoading(true);
    setActionType("processAll");

    try {
      const program = getProgram(connection, wallet);
      if (!program) throw new Error("Failed to load program");

      for (let i = 0; i < unprocessedBids.length; i++) {
        const bid = unprocessedBids[i];
        toast.loading(`Processing bid ${i + 1}/${unprocessedBids.length}...`, { id: "process" });

        await program.methods
          .determineWinner()
          .accounts({
            caller: wallet.publicKey,
            auction: auctionPubkey,
            bid: bid.pubkey,
            incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
          })
          .rpc();
      }

      toast.success("All bids processed!", { id: "process" });
      onActionComplete();
    } catch (error: any) {
      console.error("Process all bids error:", error);
      toast.error(error.message || "Failed to process bids", { id: "process" });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Finalize Winner
  const handleFinalizeWinner = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    setLoading(true);
    setActionType("finalize");

    try {
      const program = getProgram(connection, wallet);
      if (!program) throw new Error("Failed to load program");

      // IMPORTANT: Fetch fresh auction data from on-chain to get the latest highestBidHandle
      const freshAuction = await (program.account as any).auction.fetch(auctionPubkey);
      const freshHighestBidHandle = BigInt(freshAuction.highestBidHandle.toString());
      const freshCurrentLeader = freshAuction.currentLeader;

      // Calculate allowance PDA using fresh on-chain data
      const [allowancePda] = findAllowancePda(
        freshHighestBidHandle,
        freshCurrentLeader
      );

      await program.methods
        .finalizeWinner()
        .accounts({
          caller: wallet.publicKey,
          auction: auctionPubkey,
          allowanceAccount: allowancePda,
          winnerAddress: freshCurrentLeader,
          incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Winner finalized! Winner can now settle.");
      onActionComplete();
    } catch (error: any) {
      console.error("Finalize winner error:", error);
      toast.error(error.message || "Failed to finalize winner");
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // Settle Auction (winner only)
  const handleSettleAuction = async () => {
    if (!wallet.publicKey || !wallet.signMessage || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    setLoading(true);
    setActionType("settle");

    try {
      const program = getProgram(connection, wallet);
      if (!program) throw new Error("Failed to load program");

      // Fetch fresh auction data
      toast.loading("Fetching auction data...", { id: "settle" });
      const freshAuction = await (program.account as any).auction.fetch(auctionPubkey);
      const freshHighestBidHandle = BigInt(freshAuction.highestBidHandle.toString());

      toast.loading("Decrypting your bid...", { id: "settle" });

      // Decrypt the winning bid
      const decryptResult = await decryptWithProof(
        freshHighestBidHandle.toString(),
        wallet.publicKey,
        wallet.signMessage
      );

      toast.loading("Verifying and settling...", { id: "settle" });

      // Convert handle and plaintext to bytes
      const handleBytes = handleToBuffer(decryptResult.handle);
      const plaintextBytes = plaintextToBuffer(decryptResult.plaintext);

      // Build transaction with Ed25519 verification instructions
      const tx = await program.methods
        .settleAuction(
          handleBytes as Buffer,
          plaintextBytes as Buffer
        )
        .accounts({
          winner: wallet.publicKey,
          auction: auctionPubkey,
          seller: freshAuction.seller,
          instructions: new PublicKey("Sysvar1nstructions1111111111111111111111111"),
          incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(decryptResult.ed25519Instructions || [])
        .rpc();

      toast.success(
        `Auction settled! You paid ${formatSol(BigInt(decryptResult.plaintext))} SOL`,
        { id: "settle" }
      );
      onActionComplete();
    } catch (error: any) {
      console.error("Settle auction error:", error);
      toast.error(error.message || "Failed to settle auction", { id: "settle" });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  // ==================== RENDER STATES ====================

  // State: Bidding ended with bids - needs closing
  if (isOpen && hasEnded && auction.bidCount > 0) {
    return (
      <ActionCard
        icon={Clock}
        iconColor="text-warning-400"
        title="Bidding Period Ended"
        description={`The auction received ${auction.bidCount} bid${auction.bidCount > 1 ? 's' : ''}. Close bidding to begin winner determination.`}
        borderColor="border-warning-700/30"
      >
        <button
          onClick={handleCloseBidding}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading && actionType === "close" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Closing...
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Close Bidding
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </ActionCard>
    );
  }

  // State: Bidding ended with no bids - cancel
  if (isOpen && hasEnded && auction.bidCount === 0) {
    return (
      <ActionCard
        icon={AlertCircle}
        iconColor="text-error-400"
        title="No Bids Received"
        description="The bidding period ended without any bids. Close to cancel the auction."
        borderColor="border-error-700/30"
      >
        <button
          onClick={handleCloseBidding}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Cancel Auction"
          )}
        </button>
      </ActionCard>
    );
  }

  // State: Closed, processing bids
  if (isClosed && !allBidsProcessed) {
    const progress = Math.round((auction.bidsProcessed / auction.bidCount) * 100);
    
    return (
      <ActionCard
        icon={Play}
        iconColor="text-accent-400"
        title="Process Bids"
        description={`${auction.bidsProcessed} of ${auction.bidCount} bids processed. Continue to determine the winner.`}
        borderColor="border-accent-700/30"
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-surface-500 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {fetchingBids ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-surface-400" />
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleProcessAllBids}
              disabled={loading || unprocessedBids.length === 0}
              className="btn-primary w-full"
            >
              {loading && actionType === "processAll" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Process All ({unprocessedBids.length} remaining)
                </>
              )}
            </button>
          </div>
        )}
      </ActionCard>
    );
  }

  // State: All bids processed, ready to finalize
  if (isClosed && allBidsProcessed) {
    return (
      <ActionCard
        icon={Trophy}
        iconColor="text-accent-400"
        title="Finalize Winner"
        description="All bids have been compared. Finalize to confirm the winner and grant decryption permission."
        borderColor="border-accent-700/30"
      >
        <button
          onClick={handleFinalizeWinner}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading && actionType === "finalize" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Finalizing...
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4" />
              Confirm Winner
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </ActionCard>
    );
  }

  // State: Winner determined, is winner - can settle
  if (isWinnerDetermined && isWinner) {
    return (
      <ActionCard
        icon={CheckCircle}
        iconColor="text-success-400"
        title="You Won!"
        description="Congratulations! You have the highest bid. Reveal your bid and complete the payment."
        borderColor="border-success-700/30"
      >
        <button
          onClick={handleSettleAuction}
          disabled={loading}
          className="btn-success w-full"
        >
          {loading && actionType === "settle" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Settling...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Reveal & Pay
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </ActionCard>
    );
  }

  // State: Winner determined, not winner - waiting
  if (isWinnerDetermined && !isWinner) {
    return (
      <ActionCard
        icon={Clock}
        iconColor="text-surface-400"
        title="Awaiting Settlement"
        description="A winner has been determined. Waiting for them to complete the settlement."
        borderColor="border-surface-700/30"
      >
        <div className="text-center py-2">
          <Loader2 className="w-5 h-5 animate-spin text-surface-500 mx-auto" />
        </div>
      </ActionCard>
    );
  }

  return null;
};

// ==================== ACTION CARD WRAPPER ====================
const ActionCard: FC<{
  icon: FC<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  borderColor: string;
  children: React.ReactNode;
}> = ({ icon: Icon, iconColor, title, description, borderColor, children }) => (
  <Card className={borderColor}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-surface-400 text-sm mb-4">{description}</p>
      {children}
    </CardContent>
  </Card>
);
