"use client";

import { FC } from "react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { ArrowRight, Users, Lock, Clock, Shield, TrendingUp } from "lucide-react";
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
      <div className="group relative h-full">
        {/* Hover gradient effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative card-interactive h-full flex flex-col">
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
          <p className="text-surface-500 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
            {auction.description || "No description provided"}
          </p>

          {/* Stats */}
          <div className="space-y-3">
            {/* Reserve Price */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-accent-500" />
                Reserve
              </span>
              <span className="font-semibold text-surface-100">
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
              <span className="text-surface-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
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
            <span className="text-surface-600 text-xs flex items-center gap-1">
              by <span className="font-mono">{shortenAddress(auction.seller.toBase58())}</span>
            </span>
            <span className="text-accent-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              View
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
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
      <div className="group relative">
        {/* Hover gradient effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative card-interactive">
          <div className="flex items-center gap-6">
            {/* Icon indicator */}
            <div className={`hidden md:flex w-12 h-12 rounded-xl items-center justify-center flex-shrink-0 ${
              isActive 
                ? "bg-success-900/30 border border-success-700/30" 
                : "bg-surface-800/50 border border-surface-700/50"
            }`}>
              {isActive ? (
                <TrendingUp className="w-5 h-5 text-success-500" />
              ) : (
                <Lock className="w-5 h-5 text-surface-500" />
              )}
            </div>

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
                <p className="font-semibold text-surface-100">
                  {formatSol(auction.reservePrice)} SOL
                </p>
              </div>

              {/* Bids */}
              <div className="text-right">
                <p className="text-xs text-surface-500 mb-1">Bids</p>
                <p className="font-medium text-surface-100 flex items-center justify-end gap-1.5">
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
            <div className="w-8 h-8 rounded-lg bg-surface-800/50 flex items-center justify-center text-surface-500 group-hover:text-accent-500 group-hover:bg-accent-900/20 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
