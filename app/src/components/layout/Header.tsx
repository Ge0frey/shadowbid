"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { 
  Wallet,
  ChevronRight,
  Home
} from "lucide-react";

export const Header: FC = () => {
  const pathname = usePathname();
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  const isLandingPage = pathname === "/";

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey && connected) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, connected, connection]);

  // Get page title based on route
  const getPageInfo = () => {
    if (pathname === "/auctions") return { breadcrumb: "Auctions" };
    if (pathname === "/my-bids") return { breadcrumb: "My Bids" };
    if (pathname === "/my-auctions") return { breadcrumb: "My Auctions" };
    if (pathname.startsWith("/auction/")) return { breadcrumb: "Auction Details" };
    return { breadcrumb: "" };
  };

  const pageInfo = getPageInfo();

  // Landing page header
  if (isLandingPage) {
    return (
      <header className="border-b border-surface-800 bg-surface-950/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="group">
              <span className="text-xl font-bold text-surface-100 tracking-tight group-hover:text-white transition-colors">
                Shadow<span className="text-accent-400 group-hover:text-accent-300">Bid</span>
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Wallet Balance */}
              {connected && balance !== null && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50">
                  <Wallet className="w-4 h-4 text-accent-500" />
                  <span className="text-sm font-medium text-surface-200">
                    {balance.toFixed(4)} <span className="text-surface-500">SOL</span>
                  </span>
                </div>
              )}
              
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // App pages header (with sidebar)
  return (
    <header className="h-16 bg-surface-950/80 border-b border-surface-800/50 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Breadcrumb / Page Title */}
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href="/" 
              className="text-surface-500 hover:text-surface-300 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-surface-600" />
            <span className="text-surface-200 font-medium">{pageInfo.breadcrumb}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance */}
          {connected && balance !== null && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50">
              <Wallet className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-surface-200">
                {balance.toFixed(4)} <span className="text-surface-500">SOL</span>
              </span>
            </div>
          )}
          
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};
