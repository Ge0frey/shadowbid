"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  X,
  CheckCircle,
  Shield,
  FileText,
  Sparkles,
  Zap,
  EyeOff,
  Gavel
} from "lucide-react";
import { useModal } from "@/components/providers/ModalProvider";
import { getProgram } from "@/lib/program";
import { findAuctionPda } from "@/lib/pda";
import { parseSol, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from "@/lib/constants";

export const CreateAuctionModal: FC = () => {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { isCreateAuctionOpen, closeCreateAuction } = useModal();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [duration, setDuration] = useState("1440");
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isCreateAuctionOpen) {
      setTitle("");
      setDescription("");
      setReservePrice("");
      setDuration("1440");
    }
  }, [isCreateAuctionOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isCreateAuctionOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreateAuctionOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCreateAuctionOpen && !loading) {
        closeCreateAuction();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isCreateAuctionOpen, loading, closeCreateAuction]);

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

      const auctionId = new BN(Date.now());
      const [auctionPda] = findAuctionPda(wallet.publicKey, auctionId);

      const reservePriceLamports = parseSol(parseFloat(reservePrice));
      const durationSeconds = new BN(parseInt(duration) * 60);

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
      closeCreateAuction();
      router.push(`/auction/${auctionPda.toBase58()}`);
    } catch (error: any) {
      console.error("Create auction error:", error);
      toast.error(error.message || "Failed to create auction");
    } finally {
      setLoading(false);
    }
  };

  if (!isCreateAuctionOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-surface-950/90 backdrop-blur-md z-[60]"
        onClick={() => !loading && closeCreateAuction()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-surface-800">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-600/10 to-purple-600/10" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-100">Create Auction</h2>
                  <p className="text-sm text-surface-500">Set up a sealed-bid auction</p>
                </div>
              </div>
              <button
                onClick={() => !loading && closeCreateAuction()}
                disabled={loading}
                className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {!wallet.connected ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-surface-500" />
                </div>
                <h3 className="text-lg font-semibold text-surface-200 mb-2">Connect Your Wallet</h3>
                <p className="text-surface-500 text-sm">
                  Please connect your Solana wallet to create an auction.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="modal-title" className="label flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent-500" />
                    Auction Title <span className="text-error-400">*</span>
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Rare Digital Artwork"
                    className="input"
                    maxLength={MAX_TITLE_LENGTH}
                    required
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-surface-600 text-xs">A clear, descriptive name</p>
                    <p className="text-surface-600 text-xs">{title.length}/{MAX_TITLE_LENGTH}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="modal-description" className="label flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent-500" />
                    Description
                  </label>
                  <textarea
                    id="modal-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you're auctioning..."
                    className="input min-h-[100px] resize-none"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-surface-600 text-xs">Optional but recommended</p>
                    <p className="text-surface-600 text-xs">{description.length}/{MAX_DESCRIPTION_LENGTH}</p>
                  </div>
                </div>

                {/* Reserve Price & Duration */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-reserve" className="label flex items-center gap-2">
                      <Coins className="w-4 h-4 text-accent-500" />
                      Reserve Price <span className="text-error-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="modal-reserve"
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={reservePrice}
                        onChange={(e) => setReservePrice(e.target.value)}
                        placeholder="1.0"
                        className="input pr-14"
                        required
                        disabled={loading}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm font-medium">
                        SOL
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="modal-duration" className="label flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-500" />
                      Duration
                    </label>
                    <select
                      id="modal-duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="input"
                      disabled={loading}
                    >
                      {durationOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} {opt.sublabel && `(${opt.sublabel})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
                  <h4 className="text-sm font-medium text-surface-200 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent-500" />
                    Sealed-Bid Privacy
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {[
                      { icon: Lock, text: "Encrypted bids" },
                      { icon: EyeOff, text: "Hidden amounts" },
                      { icon: CheckCircle, text: "Fair competition" },
                      { icon: Zap, text: "Single transaction" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-surface-400">
                        <item.icon className="w-3.5 h-3.5 text-success-500" />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {wallet.connected && (
            <div className="px-6 py-4 border-t border-surface-800 bg-surface-900/50">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => closeCreateAuction()}
                  disabled={loading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !title.trim() || !reservePrice}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Gavel className="w-4 h-4" />
                      Create Auction
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
