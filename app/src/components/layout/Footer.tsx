"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Github, 
  Twitter, 
  ExternalLink, 
  Shield, 
  Lock,
  Zap,
  Heart
} from "lucide-react";

export const Footer: FC = () => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Compact footer for app pages (with sidebar)
  if (!isLandingPage) {
    return (
      <footer className="border-t border-surface-800/50 bg-surface-950/50 mt-auto">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-surface-500 text-xs">
              <span>&copy; {new Date().getFullYear()} ShadowBid</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Built with <Heart className="w-3 h-3 text-error-400" /> 
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <a
                href="https://github.com/Ge0frey/shadowbid"
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-500 hover:text-surface-300 transition-colors flex items-center gap-1"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
              <a
                href="https://inco.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-500 hover:text-surface-300 transition-colors flex items-center gap-1"
              >
                Inco
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="flex items-center gap-1.5 text-surface-500">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                <span>Devnet</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for landing page
  return (
    <footer className="border-t border-surface-800 bg-surface-950 mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-4 group">
              <span className="text-2xl font-bold text-surface-100 tracking-tight group-hover:text-white transition-colors">
                Shadow<span className="text-accent-400 group-hover:text-accent-300">Bid</span>
              </span>
            </Link>
            <p className="text-surface-400 text-sm max-w-sm mb-6 leading-relaxed">
              The first sealed-bid auction protocol on Solana. 
              Powered by Inco&apos;s confidential computing for truly private and fair auctions.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-xs text-surface-400">
                <Lock className="w-3 h-3 text-accent-500" />
                End-to-End Encrypted
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-xs text-surface-400">
                <Shield className="w-3 h-3 text-emerald-500" />
                MEV Protected
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-xs text-surface-400">
                <Zap className="w-3 h-3 text-amber-500" />
                Single Transaction
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Ge0frey/shadowbid"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-surface-800/50 border border-surface-700/50 flex items-center justify-center text-surface-400 hover:text-surface-100 hover:bg-surface-800 hover:border-surface-600 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Ge0frey_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-surface-800/50 border border-surface-700/50 flex items-center justify-center text-surface-400 hover:text-surface-100 hover:bg-surface-800 hover:border-surface-600 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="md:col-span-7">
            <div className="grid sm:grid-cols-3 gap-8">
              {/* Product Links */}
              <div>
                <h4 className="font-semibold text-surface-100 mb-4 text-sm uppercase tracking-wide">
                  Product
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/auctions"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1 group"
                    >
                      Browse Auctions
                      <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auction/create"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1 group"
                    >
                      Create Auction
                      <ExternalLink className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/my-bids"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors"
                    >
                      My Bids
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/my-auctions"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors"
                    >
                      My Auctions
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Technology Links */}
              <div>
                <h4 className="font-semibold text-surface-100 mb-4 text-sm uppercase tracking-wide">
                  Technology
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="https://inco.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      Inco Network
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://solana.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      Solana
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://helius.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      Helius RPC
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.anchor-lang.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      Anchor Framework
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h4 className="font-semibold text-surface-100 mb-4 text-sm uppercase tracking-wide">
                  Resources
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="https://github.com/Ge0frey/shadowbid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      Documentation
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Ge0frey/shadowbid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      Source Code
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://explorer.solana.com/?cluster=devnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-surface-100 text-sm transition-colors inline-flex items-center gap-1.5"
                    >
                      Solana Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-surface-500 text-sm">
              <span>&copy; {new Date().getFullYear()} ShadowBid.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Built with <Heart className="w-3.5 h-3.5 text-error-400" /> 
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-surface-500">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span>Solana Devnet</span>
              </div>
              <div className="flex items-center gap-1.5 text-surface-500">
                <Shield className="w-3.5 h-3.5 text-accent-500" />
                <span>Inco Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
