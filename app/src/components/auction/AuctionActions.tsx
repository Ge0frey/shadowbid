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
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { getProgram, getReadOnlyProgram } from "@/lib/program";
import { findBidPda, findAllowancePda } from "@/lib/pda";
import { decryptWithProof } from "@/lib/encryption";
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
      const bids = await program.account.bid.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: auctionPubkey.toBase58(),
          },
        },
      ]);

      const unprocessed = bids
        .filter((b) => !b.account.processed)
        .map((b) => ({
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

      // Calculate allowance PDA
      const [allowancePda] = findAllowancePda(
        auction.highestBidHandle,
        auction.currentLeader
      );

      await program.methods
        .finalizeWinner()
        .accounts({
          caller: wallet.publicKey,
          auction: auctionPubkey,
          allowanceAccount: allowancePda,
          winnerAddress: auction.currentLeader,
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
      toast.loading("Decrypting your bid...", { id: "settle" });

      // Decrypt the winning bid
      const decryptResult = await decryptWithProof(
        auction.highestBidHandle.toString(),
        wallet.publicKey,
        wallet.signMessage
      );

      toast.loading("Verifying and settling...", { id: "settle" });

      const program = getProgram(connection, wallet);
      if (!program) throw new Error("Failed to load program");

      // Convert handle and plaintext to bytes
      const handleBytes = Buffer.alloc(16);
      const handleBigInt = auction.highestBidHandle;
      const low = handleBigInt & BigInt("0xFFFFFFFFFFFFFFFF");
      const high = handleBigInt >> BigInt(64);
      handleBytes.writeBigUInt64LE(low, 0);
      handleBytes.writeBigUInt64LE(high, 8);

      const plaintextBigInt = BigInt(decryptResult.plaintext);
      const plaintextBytes = Buffer.alloc(16);
      const ptLow = plaintextBigInt & BigInt("0xFFFFFFFFFFFFFFFF");
      const ptHigh = plaintextBigInt >> BigInt(64);
      plaintextBytes.writeBigUInt64LE(ptLow, 0);
      plaintextBytes.writeBigUInt64LE(ptHigh, 8);

      // Build transaction with Ed25519 verification instructions
      const tx = await program.methods
        .settleAuction(
          Array.from(handleBytes),
          Array.from(plaintextBytes)
        )
        .accounts({
          winner: wallet.publicKey,
          auction: auctionPubkey,
          seller: auction.seller,
          instructions: new PublicKey("Sysvar1nstructions1111111111111111111111111"),
          incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(decryptResult.ed25519Instructions || [])
        .rpc();

      toast.success(
        `Auction settled! You paid ${formatSol(plaintextBigInt)} SOL`,
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

  // Render based on auction state
  if (isOpen && hasEnded && auction.bidCount > 0) {
    return (
      <Card className="border-yellow-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Lock className="w-5 h-5" />
            Bidding Period Ended
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-midnight-300 mb-4">
            The bidding period has ended with {auction.bidCount} bid(s). 
            Close bidding to start winner determination.
          </p>
          <button
            onClick={handleCloseBidding}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
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
              </>
            )}
          </button>
        </CardContent>
      </Card>
    );
  }

  if (isOpen && hasEnded && auction.bidCount === 0) {
    return (
      <Card className="border-red-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            No Bids Received
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-midnight-300 mb-4">
            The bidding period has ended with no bids. Close to cancel the auction.
          </p>
          <button
            onClick={handleCloseBidding}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2"
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
        </CardContent>
      </Card>
    );
  }

  if (isClosed && !allBidsProcessed) {
    return (
      <Card className="border-blue-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Play className="w-5 h-5" />
            Process Bids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-midnight-300 mb-4">
            {auction.bidsProcessed}/{auction.bidCount} bids processed.
            Process remaining bids to determine the winner.
          </p>

          {fetchingBids ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-midnight-400" />
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleProcessAllBids}
                disabled={loading || unprocessedBids.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading && actionType === "processAll" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing All...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Process All Bids ({unprocessedBids.length})
                  </>
                )}
              </button>

              {unprocessedBids.length > 0 && (
                <div className="text-xs text-midnight-500 text-center">
                  or process one at a time:
                </div>
              )}

              {unprocessedBids.slice(0, 3).map((bid, i) => (
                <button
                  key={bid.pubkey.toBase58()}
                  onClick={() => handleDetermineWinner(bid.pubkey)}
                  disabled={loading}
                  className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                >
                  {loading && actionType === "determine" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  Process Bid #{i + 1}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isClosed && allBidsProcessed) {
    return (
      <Card className="border-purple-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Trophy className="w-5 h-5" />
            Finalize Winner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-midnight-300 mb-4">
            All bids processed! Finalize to confirm the winner and grant them
            decryption permission.
          </p>
          <button
            onClick={handleFinalizeWinner}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading && actionType === "finalize" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Finalize Winner
              </>
            )}
          </button>
        </CardContent>
      </Card>
    );
  }

  if (isWinnerDetermined && isWinner) {
    return (
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
            your bid amount and complete the payment to the seller.
          </p>
          <button
            onClick={handleSettleAuction}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading && actionType === "settle" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Settling...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Reveal & Settle
              </>
            )}
          </button>
        </CardContent>
      </Card>
    );
  }

  if (isWinnerDetermined && !isWinner) {
    return (
      <Card className="border-yellow-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Trophy className="w-5 h-5" />
            Winner Determined
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-midnight-300">
            A winner has been determined. Waiting for them to settle the auction.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};
