"use client";

import { FC } from "react";
import Link from "next/link";
import { Github, Twitter, ExternalLink, Gavel } from "lucide-react";

export const Footer: FC = () => {
  return (
    <footer className="border-t border-surface-800 bg-surface-950 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
                <Gavel className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-surface-100">
                ShadowBid
              </span>
            </Link>
            <p className="text-surface-500 text-sm max-w-sm mb-4">
              Sealed-bid auctions on Solana powered by Inco&apos;s confidential computing. 
              Fair auctions where your bid stays private.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Ge0frey/shadowbid"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links - Product */}
          <div>
            <h4 className="font-semibold text-surface-200 mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/auctions"
                  className="text-surface-500 hover:text-surface-200 text-sm transition-colors"
                >
                  Browse Auctions
                </Link>
              </li>
              <li>
                <Link
                  href="/auction/create"
                  className="text-surface-500 hover:text-surface-200 text-sm transition-colors"
                >
                  Create Auction
                </Link>
              </li>
              <li>
                <Link
                  href="/my-bids"
                  className="text-surface-500 hover:text-surface-200 text-sm transition-colors"
                >
                  My Bids
                </Link>
              </li>
              <li>
                <Link
                  href="/my-auctions"
                  className="text-surface-500 hover:text-surface-200 text-sm transition-colors"
                >
                  My Auctions
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Resources */}
          <div>
            <h4 className="font-semibold text-surface-200 mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://inco.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-surface-500 hover:text-surface-200 text-sm transition-colors inline-flex items-center gap-1"
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
                  className="text-surface-500 hover:text-surface-200 text-sm transition-colors inline-flex items-center gap-1"
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
                  className="text-surface-500 hover:text-surface-200 text-sm transition-colors inline-flex items-center gap-1"
                >
                  Helius RPC
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-600 text-sm">
            &copy; {new Date().getFullYear()} ShadowBid. Built for Inco Privacy Hackathon.
          </p>
          <p className="text-surface-600 text-sm">
            Running on Solana Devnet
          </p>
        </div>
      </div>
    </footer>
  );
};
