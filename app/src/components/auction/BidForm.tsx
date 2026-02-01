"use client";

import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
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
    <div className="rounded-2xl bg-gradient-to-br from-surface-900/90 to-surface-900/70 border border-accent-800/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-800/50 to-accent-900/30 border border-accent-700/40 flex items-center justify-center">
            <Lock className="w-4.5 h-4.5 text-accent-400" />
          </div>
          <h3 className="text-base font-bold text-surface-100">Place Sealed Bid</h3>
        </div>
        <p className="text-sm text-surface-400 leading-relaxed">
          Your bid will be encrypted. No one can see the amount until settlement.
        </p>
      </div>

      {/* Form */}
      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="bid" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
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
                className="w-full bg-surface-800/60 border border-surface-700/50 rounded-xl px-4 py-3.5 text-surface-100 placeholder-surface-500 transition-all duration-200 hover:border-surface-600/50 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-600/50 pr-16"
                disabled={loading}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-medium">
                SOL
              </span>
            </div>
            <p className="text-surface-500 text-xs mt-2.5">
              Reserve price: <span className="text-surface-300 font-medium">{formatSol(reservePrice)} SOL</span>
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-start gap-3 bg-success-950/30 rounded-xl p-4 border border-success-800/30">
            <div className="w-8 h-8 rounded-lg bg-success-900/40 border border-success-700/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-success-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-success-300 mb-0.5">End-to-end encrypted</p>
              <p className="text-xs text-surface-400 leading-relaxed">
                Your bid is encrypted using Inco&apos;s confidential computing.
                Only you will know your bid amount.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !wallet.connected}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-semibold text-sm shadow-lg shadow-accent-500/20 hover:from-accent-500 hover:to-accent-400 hover:shadow-accent-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{encrypting ? "Encrypting..." : "Submitting..."}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Place Encrypted Bid</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
