"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { 
  Gavel, 
  Plus, 
  Menu, 
  X,
  LayoutDashboard,
  Ticket,
  Home
} from "lucide-react";

const navLinks = [
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/my-bids", label: "My Bids", icon: Ticket },
  { href: "/my-auctions", label: "My Auctions", icon: LayoutDashboard },
];

export const Header: FC = () => {
  const pathname = usePathname();
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingPage = pathname === "/";

  return (
    <header className="border-b border-surface-800 bg-surface-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-accent-600 rounded-lg flex items-center justify-center group-hover:bg-accent-500 transition-colors">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-surface-100">
              ShadowBid
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-surface-800 text-surface-100"
                      : "text-surface-400 hover:text-surface-100 hover:bg-surface-800/50"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {connected && (
              <Link
                href="/auction/create"
                className="hidden sm:flex btn-primary text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Create Auction</span>
              </Link>
            )}
            
            <WalletMultiButton />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-surface-400 hover:text-surface-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-800 py-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-surface-800 text-surface-100"
                        : "text-surface-400 hover:text-surface-100 hover:bg-surface-800/50"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              {connected && (
                <Link
                  href="/auction/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-accent-400 hover:bg-surface-800/50"
                >
                  <Plus className="w-4 h-4" />
                  Create Auction
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
