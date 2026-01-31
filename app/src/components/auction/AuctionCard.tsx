"use client";

import { FC } from "react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { ArrowRight, Users, Lock, Clock } from "lucide-react";
import { Countdown } from "../ui/Countdown";
import { 
  formatSol, 
  getAuctionStateLabel, 
  getAuctionStateColor,
  AuctionState 
} from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

interface AuctionCardProps {
  auction: {
    publicKey: PublicKey;
    title: string;
    description: string;
    reservePrice: bigint;
    startTime: number;
    endTime: number;
    state: AuctionState;
    bidCount: number;
    seller: PublicKey;
  };
  variant?: "vertical" | "horizontal";
}

export const AuctionCard: FC<AuctionCardProps> = ({ auction, variant = "vertical" }) => {
  const isOpen = "open" in auction.state;
  const now = Math.floor(Date.now() / 1000);
  const isActive = isOpen && now < auction.endTime;

  if (variant === "horizontal") {
    return <HorizontalCard auction={auction} isActive={isActive} />;
  }

  return <VerticalCard auction={auction} isActive={isActive} />;
};

// Vertical Card (Grid View)
const VerticalCard: FC<{
  auction: AuctionCardProps["auction"];
  isActive: boolean;
}> = ({ auction, isActive }) => {
  const isOpen = "open" in auction.state;

  return (
    <Link href={`/auction/${auction.publicKey.toBase58()}`}>
      <div className="card-interactive h-full flex flex-col group">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-surface-100 line-clamp-1 group-hover:text-accent-400 transition-colors">
            {auction.title}
          </h3>
          <span className={getAuctionStateColor(auction.state)}>
            {getAuctionStateLabel(auction.state)}
          </span>
        </div>

        {/* Description */}
        <p className="text-surface-500 text-sm line-clamp-2 mb-4 flex-grow">
          {auction.description || "No description provided"}
        </p>

        {/* Stats */}
        <div className="space-y-3">
          {/* Reserve Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500">Reserve</span>
            <span className="font-medium text-surface-100">
              {formatSol(auction.reservePrice)} SOL
            </span>
          </div>

          {/* Bids */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Bids
            </span>
            <span className="font-medium text-surface-100 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-accent-500" />
              {auction.bidCount} sealed
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500">
              {isActive ? "Ends in" : "Status"}
            </span>
            {isActive ? (
              <Countdown endTime={auction.endTime} size="sm" />
            ) : (
              <span className="text-surface-400 text-xs">
                {isOpen ? "Starting soon" : getAuctionStateLabel(auction.state)}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-surface-800 flex items-center justify-between">
          <span className="text-surface-600 text-xs">
            by {shortenAddress(auction.seller.toBase58())}
          </span>
          <span className="text-accent-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            View
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// Horizontal Card (List View)
const HorizontalCard: FC<{
  auction: AuctionCardProps["auction"];
  isActive: boolean;
}> = ({ auction, isActive }) => {
  const isOpen = "open" in auction.state;

  return (
    <Link href={`/auction/${auction.publicKey.toBase58()}`}>
      <div className="card-interactive group">
        <div className="flex items-center gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-surface-100 truncate group-hover:text-accent-400 transition-colors">
                {auction.title}
              </h3>
              <span className={getAuctionStateColor(auction.state)}>
                {getAuctionStateLabel(auction.state)}
              </span>
            </div>
            <p className="text-surface-500 text-sm truncate">
              {auction.description || "No description provided"}
            </p>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-8">
            {/* Reserve */}
            <div className="text-right">
              <p className="text-xs text-surface-500 mb-1">Reserve</p>
              <p className="font-medium text-surface-100">
                {formatSol(auction.reservePrice)} SOL
              </p>
            </div>

            {/* Bids */}
            <div className="text-right">
              <p className="text-xs text-surface-500 mb-1">Bids</p>
              <p className="font-medium text-surface-100 flex items-center justify-end gap-1">
                <Lock className="w-3 h-3 text-accent-500" />
                {auction.bidCount}
              </p>
            </div>

            {/* Time */}
            <div className="text-right min-w-[120px]">
              <p className="text-xs text-surface-500 mb-1">
                {isActive ? "Ends in" : "Status"}
              </p>
              {isActive ? (
                <Countdown endTime={auction.endTime} size="sm" showIcon={false} />
              ) : (
                <p className="text-surface-400 text-sm">
                  {isOpen ? "Starting soon" : getAuctionStateLabel(auction.state)}
                </p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="text-surface-500 group-hover:text-accent-500 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
};
