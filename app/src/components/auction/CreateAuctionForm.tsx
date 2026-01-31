"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import toast from "react-hot-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { getProgram } from "@/lib/program";
import { findAuctionPda } from "@/lib/pda";
import { parseSol, DEFAULT_AUCTION_DURATION, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from "@/lib/constants";

export const CreateAuctionForm: FC = () => {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [duration, setDuration] = useState("24"); // hours
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!reservePrice || parseFloat(reservePrice) <= 0) {
      toast.error("Please enter a valid reserve price");
      return;
    }

    setLoading(true);

    try {
      const program = getProgram(connection, wallet);
      if (!program) {
        throw new Error("Failed to load program");
      }

      // Generate unique auction ID
      const auctionId = new BN(Date.now());
      
      // Derive auction PDA
      const [auctionPda] = findAuctionPda(wallet.publicKey, auctionId);

      // Parse values
      const reservePriceLamports = parseSol(parseFloat(reservePrice));
      const durationSeconds = new BN(Math.floor(parseFloat(duration) * 3600)); // Convert hours to seconds

      // Create auction
      await program.methods
        .createAuction({
          auctionId,
          title: title.slice(0, MAX_TITLE_LENGTH),
          description: description.slice(0, MAX_DESCRIPTION_LENGTH),
          reservePrice: new BN(reservePriceLamports.toString()),
          duration: durationSeconds,
          itemMint: null,
        })
        .accounts({
          seller: wallet.publicKey,
          auction: auctionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Auction created successfully!");
      router.push(`/auction/${auctionPda.toBase58()}`);
    } catch (error: any) {
      console.error("Create auction error:", error);
      toast.error(error.message || "Failed to create auction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Sealed-Bid Auction</CardTitle>
        <CardDescription>
          Create an auction where all bids are encrypted. No one can see bid amounts
          until the auction settles.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="label">
              Auction Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rare Digital Artwork"
              className="input"
              maxLength={MAX_TITLE_LENGTH}
              required
            />
            <p className="text-midnight-500 text-xs mt-1">
              {title.length}/{MAX_TITLE_LENGTH} characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're auctioning..."
              className="input min-h-[100px] resize-none"
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            <p className="text-midnight-500 text-xs mt-1">
              {description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </p>
          </div>

          {/* Reserve Price */}
          <div>
            <label htmlFor="reserve" className="label">
              Reserve Price (SOL)
            </label>
            <input
              id="reserve"
              type="number"
              step="0.001"
              min="0.001"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              placeholder="1.0"
              className="input"
              required
            />
            <p className="text-midnight-500 text-xs mt-1">
              Minimum bid amount. All bids below this will be rejected.
            </p>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="label">
              Duration
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input"
            >
              <option value="0.0333">2 minutes</option>
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">2 days</option>
              <option value="72">3 days</option>
              <option value="168">7 days</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-shadow-950/50 border border-shadow-700/50 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-shadow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-midnight-300">
                <p className="font-medium text-shadow-300 mb-1">How it works:</p>
                <ul className="space-y-1 text-midnight-400">
                  <li>• Bidders submit encrypted bids that no one can see</li>
                  <li>• After the auction ends, bids are compared using encrypted computation</li>
                  <li>• Only the winner&apos;s bid is revealed during settlement</li>
                  <li>• Losing bids remain secret forever</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !wallet.connected}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Auction...
              </>
            ) : (
              "Create Auction"
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};
