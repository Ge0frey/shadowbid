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
  Gavel,
  TrendingUp,
  CheckCircle,
  Package
} from "lucide-react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { useAuctions } from "@/hooks/useAuctions";
import { useModal } from "@/components/providers/ModalProvider";

type ViewMode = "grid" | "list";
type FilterState = "all" | "active" | "ended" | "settled";

export default function MyAuctionsPage() {
  const { publicKey, connected } = useWallet();
  const { auctions, loading, error, refetch } = useAuctions(
    publicKey ? { seller: publicKey } : undefined
  );
  const { openCreateAuction } = useModal();

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

  // Stats
  const stats = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const active = auctions.filter(a => "open" in a.state && a.endTime > now).length;
    const settled = auctions.filter(a => "settled" in a.state).length;
    const totalBids = auctions.reduce((sum, a) => sum + a.bidCount, 0);
    return { active, settled, total: auctions.length, totalBids };
  }, [auctions]);

  if (!connected) {
    return (
      <div className="min-h-screen">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/50 to-surface-950 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center">
              <Lock className="w-10 h-10 text-surface-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="heading-2 text-surface-100 mb-3 text-center">
            Connect Your Wallet
          </h1>
          <p className="text-muted text-center max-w-md mb-6">
            Please connect your wallet to view and manage your auctions.
          </p>
          
          <Link href="/auctions" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Browse Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-surface-800">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 to-surface-950" />
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Link 
                href="/auctions" 
                className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-200 text-sm mb-4 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Auctions
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-surface-100 mb-2">
                My Auctions
              </h1>
              <p className="text-surface-400">
                Manage and track auctions you&apos;ve created
              </p>
            </div>
            
            <button onClick={openCreateAuction} className="btn-primary btn-lg">
              <Plus className="w-5 h-5" />
              Create Auction
            </button>
          </div>

          {/* Stats Row */}
          {auctions.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/40 border border-surface-700/50">
                <TrendingUp className="w-4 h-4 text-success-500" />
                <span className="text-surface-400">Active:</span>
                <span className="font-semibold text-surface-100">{stats.active}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/40 border border-surface-700/50">
                <CheckCircle className="w-4 h-4 text-accent-500" />
                <span className="text-surface-400">Settled:</span>
                <span className="font-semibold text-surface-100">{stats.settled}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/40 border border-surface-700/50">
                <Lock className="w-4 h-4 text-purple-500" />
                <span className="text-surface-400">Total Bids:</span>
                <span className="font-semibold text-accent-400">{stats.totalBids}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-20 border-b border-surface-800/50 bg-surface-950/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-800/50 rounded-xl p-1.5">
              {(["all", "active", "ended", "settled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filter === f
                      ? "bg-surface-700 text-surface-100 shadow-sm"
                      : "text-surface-400 hover:text-surface-200 hover:bg-surface-700/50"
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
                className={`p-2.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-surface-700 text-surface-100"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-md transition-all ${
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
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
            <p className="text-muted">Loading your auctions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-error-400 mb-4">{error}</p>
            <button onClick={refetch} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center">
                <Gavel className="w-10 h-10 text-surface-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-surface-200 mb-2">
              {filter === "all" ? "No Auctions Yet" : `No ${filter} auctions`}
            </h3>
            <p className="text-muted max-w-md mb-8 leading-relaxed">
              {filter === "all" 
                ? "You haven't created any auctions yet. Start by creating your first sealed-bid auction!"
                : `You don't have any ${filter} auctions at the moment.`}
            </p>
            {filter === "all" && (
              <button onClick={openCreateAuction} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Your First Auction
              </button>
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
