"use client";

import { FC } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Gavel, Plus } from "lucide-react";

export const Header: FC = () => {
  const { connected } = useWallet();

  return (
    <header className="border-b border-midnight-800 bg-midnight-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-shadow-500 to-shadow-700 rounded-lg flex items-center justify-center group-hover:from-shadow-400 group-hover:to-shadow-600 transition-all">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-shadow-300 bg-clip-text text-transparent">
              ShadowBid
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-midnight-300 hover:text-white transition-colors"
            >
              Auctions
            </Link>
            <Link
              href="/my-bids"
              className="text-midnight-300 hover:text-white transition-colors"
            >
              My Bids
            </Link>
            <Link
              href="/my-auctions"
              className="text-midnight-300 hover:text-white transition-colors"
            >
              My Auctions
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {connected && (
              <Link
                href="/auction/create"
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Auction</span>
              </Link>
            )}
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
};
