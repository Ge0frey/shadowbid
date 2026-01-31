"use client";

import { FC, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Loader2, 
  Lock, 
  Plus, 
  ArrowLeft,
  LayoutGrid,
  List,
  Filter
} from "lucide-react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { useAuctions } from "@/hooks/useAuctions";

type ViewMode = "grid" | "list";
type FilterState = "all" | "active" | "ended" | "settled";

export default function MyAuctionsPage() {
  const { publicKey, connected } = useWallet();
  const { auctions, loading, error, refetch } = useAuctions(
    publicKey ? { seller: publicKey } : undefined
  );

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterState>("all");

  // Filter auctions
  const filteredAuctions = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    
    return auctions.filter((auction) => {
      const isOpen = "open" in auction.state;
      const isSettled = "settled" in auction.state;
      const isActive = isOpen && auction.endTime > now;

      switch (filter) {
        case "active":
          return isActive;
        case "ended":
          return !isActive && !isSettled;
        case "settled":
          return isSettled;
        case "all":
        default:
          return true;
      }
    });
  }, [auctions, filter]);

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-surface-500" />
        </div>
        <h1 className="heading-3 text-surface-100 mb-2 text-center">
          Connect Your Wallet
        </h1>
        <p className="text-muted text-center max-w-md">
          Please connect your wallet to view your auctions.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-surface-800 bg-surface-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link 
                href="/auctions" 
                className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-200 text-sm mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Auctions
              </Link>
              <h1 className="heading-2 text-surface-100">My Auctions</h1>
              <p className="text-muted mt-1">
                Manage auctions you&apos;ve created
              </p>
            </div>
            <Link href="/auction/create" className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Auction
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-surface-800/50 bg-surface-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1">
              {(["all", "active", "ended", "settled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === f
                      ? "bg-surface-700 text-surface-100"
                      : "text-surface-400 hover:text-surface-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-surface-700 text-surface-100"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-surface-700 text-surface-100"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500 mb-4" />
            <p className="text-muted">Loading your auctions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-error-400 mb-4">{error}</p>
            <button onClick={refetch} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="heading-3 text-surface-200 mb-2">
              {filter === "all" ? "No Auctions Yet" : `No ${filter} auctions`}
            </h3>
            <p className="text-muted max-w-md mb-6">
              {filter === "all" 
                ? "You haven't created any auctions yet. Start by creating your first sealed-bid auction!"
                : `You don't have any ${filter} auctions.`}
            </p>
            {filter === "all" && (
              <Link href="/auction/create" className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Auction
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.publicKey.toBase58()}
                auction={auction}
                variant={viewMode === "list" ? "horizontal" : "vertical"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
