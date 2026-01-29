"use client";

import { FC } from "react";
import { Github, Twitter, ExternalLink } from "lucide-react";

export const Footer: FC = () => {
  return (
    <footer className="border-t border-midnight-800 bg-midnight-950 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-midnight-400 text-sm">
            <span className="font-semibold text-shadow-400">ShadowBid</span>
            {" - "}
            Sealed-bid auctions powered by{" "}
            <a
              href="https://inco.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-shadow-400 hover:text-shadow-300 inline-flex items-center gap-1"
            >
              Inco
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-midnight-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-midnight-400 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          <div className="text-midnight-500 text-sm">
            Built for Inco Privacy Hackathon 2026
          </div>
        </div>
      </div>
    </footer>
  );
};
