"use client";

import { FC, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Search,
  Filter,
  Plus,
  Loader2,
  Lock,
  RefreshCw,
  LayoutGrid,
  List
} from "lucide-react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { useAuctions } from "@/hooks/useAuctions";

type ViewMode = "grid" | "list";
type FilterState = "all" | "active" | "ended" | "settled";

export default function AuctionsPage() {
  const { connected } = useWallet();
  const { auctions, loading, error, refetch } = useAuctions();
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterState>("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and search auctions
  const filteredAuctions = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    
    return auctions.filter((auction) => {
      // Apply state filter
      const isOpen = "open" in auction.state;
      const isClosed = "closed" in auction.state;
      const isWinnerDetermined = "winnerDetermined" in auction.state;
      const isSettled = "settled" in auction.state;
      const isActive = isOpen && auction.endTime > now;
      const hasEnded = isOpen && auction.endTime <= now;

      switch (filter) {
        case "active":
          return isActive;
        case "ended":
          return hasEnded || isClosed || isWinnerDetermined;
        case "settled":
          return isSettled;
        case "all":
        default:
          return true;
      }
    }).filter((auction) => {
      // Apply search filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        auction.title.toLowerCase().includes(query) ||
        auction.description.toLowerCase().includes(query)
      );
    });
  }, [auctions, filter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const active = auctions.filter(a => "open" in a.state && a.endTime > now).length;
    const total = auctions.length;
    const totalBids = auctions.reduce((sum, a) => sum + a.bidCount, 0);
    return { active, total, totalBids };
  }, [auctions]);

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="border-b border-surface-800 bg-surface-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="heading-2 text-surface-100">Browse Auctions</h1>
              <p className="text-muted mt-1">
                Discover sealed-bid auctions with encrypted bidding
              </p>
            </div>
            {connected && (
              <Link href="/auction/create" className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Auction
              </Link>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted">Active:</span>
              <span className="font-medium text-success-400">{stats.active}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">Total:</span>
              <span className="font-medium text-surface-200">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-accent-500" />
              <span className="text-muted">Sealed Bids:</span>
              <span className="font-medium text-accent-400">{stats.totalBids}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="border-b border-surface-800/50 bg-surface-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-800/50 rounded-lg p-1">
              {(["active", "ended", "settled", "all"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === f
                      ? "bg-surface-700 text-surface-100"
                      : "text-surface-400 hover:text-surface-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  placeholder="Search auctions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 py-2.5 w-full sm:w-64"
                />
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

              {/* Refresh */}
              <button
                onClick={refetch}
                className="btn-ghost p-2"
                title="Refresh auctions"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auctions Grid/List */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-500 mb-4" />
            <p className="text-muted">Loading auctions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-error-400 mb-4">{error}</p>
            <button onClick={refetch} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <EmptyState filter={filter} connected={connected} />
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

// Empty State Component
const EmptyState: FC<{ filter: FilterState; connected: boolean }> = ({
  filter,
  connected,
}) => {
  const messages = {
    active: {
      title: "No Active Auctions",
      description: "There are no active auctions right now. Check back soon or create your own!",
    },
    ended: {
      title: "No Ended Auctions",
      description: "No auctions have ended yet. Active auctions will appear here once they close.",
    },
    settled: {
      title: "No Settled Auctions",
      description: "No auctions have been settled yet.",
    },
    all: {
      title: "No Auctions Found",
      description: "Be the first to create a sealed-bid auction!",
    },
  };

  const { title, description } = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-surface-500" />
      </div>
      <h3 className="heading-3 text-surface-200 mb-2">{title}</h3>
      <p className="text-muted max-w-md mb-6">{description}</p>
      {connected && filter === "active" && (
        <Link href="/auction/create" className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Auction
        </Link>
      )}
    </div>
  );
};
