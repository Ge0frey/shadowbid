"use client";

import { FC } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, Lock, Plus, ArrowLeft } from "lucide-react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { useAuctions } from "@/hooks/useAuctions";

export default function MyAuctionsPage() {
  const { publicKey, connected } = useWallet();
  const { auctions, loading, error, refetch } = useAuctions(
    publicKey ? { seller: publicKey } : undefined
  );

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-midnight-500" />
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-midnight-400">
            Please connect your wallet to view your auctions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-midnight-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">My Auctions</h1>
            <p className="text-midnight-400 text-sm">Manage your sealed-bid auctions</p>
          </div>
        </div>
        <Link href="/auction/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Auction</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-shadow-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 btn-secondary"
          >
            Try Again
          </button>
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-midnight-800 flex items-center justify-center">
            <Lock className="w-8 h-8 text-midnight-500" />
          </div>
          <h3 className="text-xl font-semibold text-midnight-300 mb-2">
            No Auctions Yet
          </h3>
          <p className="text-midnight-500 mb-6">
            You haven&apos;t created any auctions yet. Start by creating your first sealed-bid auction!
          </p>
          <Link href="/auction/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Auction
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.publicKey.toBase58()} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
