"use client";

import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Loader2, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { getProgram } from "@/lib/program";
import { findBidPda } from "@/lib/pda";
import { encryptBid } from "@/lib/encryption";
import { parseSol, formatSol, INCO_LIGHTNING_PROGRAM_ID } from "@/lib/constants";

interface BidFormProps {
  auctionPubkey: PublicKey;
  reservePrice: bigint;
  onBidPlaced?: () => void;
}

export const BidForm: FC<BidFormProps> = ({
  auctionPubkey,
  reservePrice,
  onBidPlaced,
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [encrypting, setEncrypting] = useState(false);

  const minBid = Number(reservePrice) / 1e9;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      toast.error(`Bid must be at least ${minBid} SOL`);
      return;
    }

    const amountLamports = parseSol(amount);

    setLoading(true);

    try {
      // Step 1: Encrypt the bid
      setEncrypting(true);
      toast.loading("Encrypting your bid...", { id: "encrypt" });
      
      const ciphertext = await encryptBid(amountLamports);
      
      toast.dismiss("encrypt");
      toast.success("Bid encrypted successfully");
      setEncrypting(false);

      // Step 2: Submit to blockchain
      const program = getProgram(connection, wallet);
      if (!program) {
        throw new Error("Failed to load program");
      }

      // Derive bid PDA
      const [bidPda] = findBidPda(auctionPubkey, wallet.publicKey);

      toast.loading("Submitting encrypted bid...", { id: "submit" });

      await program.methods
        .placeBid(ciphertext)
        .accounts({
          bidder: wallet.publicKey,
          auction: auctionPubkey,
          bid: bidPda,
          incoLightningProgram: INCO_LIGHTNING_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.dismiss("submit");
      toast.success("Bid placed successfully!");
      
      setBidAmount("");
      onBidPlaced?.();
    } catch (error: any) {
      console.error("Place bid error:", error);
      toast.dismiss("encrypt");
      toast.dismiss("submit");
      toast.error(error.message || "Failed to place bid");
    } finally {
      setLoading(false);
      setEncrypting(false);
    }
  };

  return (
    <Card className="border-accent-800/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-accent-500" />
          Place Sealed Bid
        </CardTitle>
        <CardDescription>
          Your bid will be encrypted. No one can see the amount until settlement.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bid" className="label">
              Bid Amount (SOL)
            </label>
            <div className="relative">
              <input
                id="bid"
                type="number"
                step="0.001"
                min={minBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Min: ${minBid} SOL`}
                className="input pr-16"
                disabled={loading}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm">
                SOL
              </span>
            </div>
            <p className="text-surface-600 text-xs mt-2">
              Reserve price: {formatSol(reservePrice)} SOL
            </p>
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-3 text-sm bg-success-950/30 rounded-lg p-4 border border-success-800/30">
            <ShieldCheck className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-success-300 mb-1">End-to-end encrypted</p>
              <p className="text-surface-400">
                Your bid is encrypted using Inco&apos;s confidential computing.
                Only you will know your bid amount.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !wallet.connected}
            className="btn-primary w-full btn-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {encrypting ? "Encrypting..." : "Submitting..."}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Place Encrypted Bid
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};
