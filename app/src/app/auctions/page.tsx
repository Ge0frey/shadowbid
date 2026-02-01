"use client";

import { FC, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Search,
  Plus,
  Loader2,
  Lock,
  RefreshCw,
  LayoutGrid,
  List,
  Gavel,
  TrendingUp,
  Shield,
  Sparkles
} from "lucide-react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { useAuctions } from "@/hooks/useAuctions";
import { useModal } from "@/components/providers/ModalProvider";

type ViewMode = "grid" | "list";
type FilterState = "all" | "active" | "ended" | "settled";

export default function AuctionsPage() {
  const { connected } = useWallet();
  const { auctions, loading, error, refetch } = useAuctions();
  const { openCreateAuction } = useModal();
  
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
      {/* Hero Header Section */}
      <div className="relative overflow-hidden border-b border-surface-800">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 to-surface-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/60 border border-surface-700/50 text-sm text-surface-400 mb-4">
                <Sparkles className="w-4 h-4 text-accent-500" />
                Discover Auctions
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-surface-100 mb-2">
                Browse Auctions
              </h1>
              <p className="text-surface-400 max-w-lg">
                Explore sealed-bid auctions where your strategy stays private. 
                Place encrypted bids with confidence.
              </p>
            </div>
            
            {connected && (
              <button onClick={openCreateAuction} className="btn-primary btn-lg group">
                <Plus className="w-5 h-5" />
                Create Auction
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
            <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4 text-success-500" />
                Active
              </div>
              <div className="text-2xl font-bold text-surface-100">{stats.active}</div>
            </div>
            <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                <Gavel className="w-4 h-4 text-accent-500" />
                Total
              </div>
              <div className="text-2xl font-bold text-surface-100">{stats.total}</div>
            </div>
            <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-surface-500 text-sm mb-1">
                <Lock className="w-4 h-4 text-purple-500" />
                Sealed Bids
              </div>
              <div className="text-2xl font-bold text-accent-400">{stats.totalBids}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="sticky top-16 z-20 border-b border-surface-800/50 bg-surface-950/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-800/50 rounded-xl p-1.5">
              {(["active", "ended", "settled", "all"] as const).map((f) => (
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

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  placeholder="Search auctions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 py-2.5 w-full sm:w-72 bg-surface-800/50 border-surface-700/50"
                />
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
                  title="Grid view"
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
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={refetch}
                className="btn-ghost p-2.5 rounded-lg hover:bg-surface-800"
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
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
            <p className="text-muted">Loading auctions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-error-900/30 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-error-400" />
            </div>
            <p className="text-error-400 mb-4">{error}</p>
            <button onClick={refetch} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <EmptyState filter={filter} connected={connected} onCreateAuction={openCreateAuction} />
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
const EmptyState: FC<{ 
  filter: FilterState; 
  connected: boolean;
  onCreateAuction: () => void;
}> = ({ filter }) => {
  const messages = {
    active: {
      title: "No Active Auctions",
      description: "There are no active auctions right now. Check back soon or create your own sealed-bid auction using the button above!",
      icon: TrendingUp,
    },
    ended: {
      title: "No Ended Auctions",
      description: "No auctions have ended yet. Active auctions will appear here once they close.",
      icon: Gavel,
    },
    settled: {
      title: "No Settled Auctions",
      description: "No auctions have been settled yet. Completed auctions will appear here.",
      icon: Shield,
    },
    all: {
      title: "No Auctions Found",
      description: "Be the first to create a sealed-bid auction on ShadowBid!",
      icon: Lock,
    },
  };

  const { title, description, icon: Icon } = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Decorative background */}
      <div className="relative mb-8">
        <div className="absolute inset-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700 flex items-center justify-center">
          <Icon className="w-10 h-10 text-surface-500" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-surface-200 mb-2">{title}</h3>
      <p className="text-muted max-w-md leading-relaxed">{description}</p>
    </div>
  );
};
