"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import toast from "react-hot-toast";
import { 
  Loader2, 
  Info, 
  Lock, 
  Clock, 
  Coins,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { getProgram } from "@/lib/program";
import { findAuctionPda } from "@/lib/pda";
import { parseSol, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from "@/lib/constants";

export const CreateAuctionForm: FC = () => {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [duration, setDuration] = useState("1440"); // minutes (24 hours default)
  const [loading, setLoading] = useState(false);

  const durationOptions = [
    { value: "2", label: "2 minutes", sublabel: "Testing" },
    { value: "60", label: "1 hour", sublabel: "" },
    { value: "360", label: "6 hours", sublabel: "" },
    { value: "720", label: "12 hours", sublabel: "" },
    { value: "1440", label: "24 hours", sublabel: "Recommended" },
    { value: "2880", label: "2 days", sublabel: "" },
    { value: "4320", label: "3 days", sublabel: "" },
    { value: "10080", label: "7 days", sublabel: "" },
  ];

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
      const durationSeconds = new BN(parseInt(duration) * 60); // Convert minutes to seconds

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-surface-800 bg-surface-950">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href="/auctions" 
            className="inline-flex items-center gap-2 text-surface-400 hover:text-surface-200 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Auctions
          </Link>
          <h1 className="heading-2 text-surface-100">Create Auction</h1>
          <p className="text-muted mt-1">Set up a new sealed-bid auction</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="label">
                    Auction Title <span className="text-error-400">*</span>
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
                  <p className="text-surface-600 text-xs mt-2">
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
                    className="input min-h-[120px] resize-none"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <p className="text-surface-600 text-xs mt-2">
                    {description.length}/{MAX_DESCRIPTION_LENGTH} characters
                  </p>
                </div>

                {/* Reserve Price */}
                <div>
                  <label htmlFor="reserve" className="label flex items-center gap-2">
                    <Coins className="w-4 h-4 text-accent-500" />
                    Reserve Price (SOL) <span className="text-error-400">*</span>
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
                  <p className="text-surface-600 text-xs mt-2">
                    Minimum bid amount. All bids below this will be rejected.
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="label flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-500" />
                    Duration
                  </label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="input"
                  >
                    {durationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} {opt.sublabel && `(${opt.sublabel})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* How it works */}
                <div className="bg-surface-800/50 rounded-xl p-5 border border-surface-700/50">
                  <h4 className="font-medium text-surface-200 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent-500" />
                    How sealed-bid auctions work
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Bidders submit encrypted bids that no one can see",
                      "After the auction ends, bids are compared using encrypted computation",
                      "Only the winner's bid is revealed during settlement",
                      "Losing bids remain secret forever",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-surface-400">
                        <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !wallet.connected}
                  className="btn-primary w-full btn-lg"
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

                {!wallet.connected && (
                  <p className="text-center text-surface-500 text-sm">
                    Connect your wallet to create an auction
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
