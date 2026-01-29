"use client";

import { FC } from "react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { Eye, Users, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/Card";
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
}

export const AuctionCard: FC<AuctionCardProps> = ({ auction }) => {
  const isOpen = "open" in auction.state;
  const now = Math.floor(Date.now() / 1000);
  const isActive = isOpen && now < auction.endTime;

  return (
    <Link href={`/auction/${auction.publicKey.toBase58()}`}>
      <Card className="hover:border-shadow-500/50 transition-all duration-300 cursor-pointer group h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="group-hover:text-shadow-400 transition-colors line-clamp-1">
              {auction.title}
            </CardTitle>
            <span className={`status-badge ${getAuctionStateColor(auction.state)}`}>
              {getAuctionStateLabel(auction.state)}
            </span>
          </div>
          <p className="text-midnight-400 text-sm mt-2 line-clamp-2">
            {auction.description}
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Reserve Price */}
            <div className="flex items-center justify-between">
              <span className="text-midnight-400 text-sm">Reserve Price</span>
              <span className="font-semibold text-white">
                {formatSol(auction.reservePrice)} SOL
              </span>
            </div>

            {/* Bid Count */}
            <div className="flex items-center justify-between">
              <span className="text-midnight-400 text-sm flex items-center gap-1">
                <Users className="w-4 h-4" />
                Bids
              </span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Lock className="w-3 h-3 text-shadow-400" />
                {auction.bidCount} sealed
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between">
              <span className="text-midnight-400 text-sm">
                {isActive ? "Ends in" : "Status"}
              </span>
              {isActive ? (
                <Countdown endTime={auction.endTime} />
              ) : (
                <span className="text-midnight-300">
                  {isOpen ? "Starting soon" : getAuctionStateLabel(auction.state)}
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-midnight-500 text-xs">
              by {shortenAddress(auction.seller.toBase58())}
            </span>
            <span className="text-shadow-400 text-sm flex items-center gap-1 group-hover:text-shadow-300 transition-colors">
              <Eye className="w-4 h-4" />
              View
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
