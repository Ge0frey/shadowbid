"use client";

import { FC, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { getProgram } from "@/lib/program";
import { findBidPda } from "@/lib/pda";
import { encryptBid } from "@/lib/encryption";
import { parseSol, INCO_LIGHTNING_PROGRAM_ID } from "@/lib/constants";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    const amountLamports = parseSol(parseFloat(bidAmount));
    if (amountLamports < reservePrice) {
      toast.error(`Bid must be at least ${Number(reservePrice) / 1e9} SOL`);
      return;
    }

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-shadow-400" />
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
            <input
              id="bid"
              type="number"
              step="0.001"
              min={Number(reservePrice) / 1e9}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Min: ${Number(reservePrice) / 1e9} SOL`}
              className="input"
              disabled={loading}
              required
            />
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-2 text-sm text-midnight-400 bg-midnight-800/50 rounded-lg p-3">
            <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>
              Your bid is encrypted using Inco&apos;s confidential computing.
              Only you will know your bid amount.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !wallet.connected}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
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
