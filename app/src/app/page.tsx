"use client";

import { FC } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Shield, 
  Lock, 
  Eye, 
  Zap, 
  ArrowRight, 
  Plus,
  Users,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function HomePage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-shadow-950/50 via-midnight-950 to-midnight-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-shadow-900/20 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-shadow-900/30 border border-shadow-700/50 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-shadow-400" />
              <span className="text-shadow-300 text-sm">Powered by Inco Lightning</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-shadow-200 to-shadow-400 bg-clip-text text-transparent">
                Sealed-Bid Auctions
              </span>
              <br />
              <span className="text-white">
                Where Privacy Meets Trust
              </span>
            </h1>
            
            <p className="text-xl text-midnight-300 mb-8 max-w-2xl mx-auto">
              Place encrypted bids that no one can see. Win fair auctions without 
              front-running, bid manipulation, or last-second sniping.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {connected ? (
                <>
                  <Link href="/auction/create" className="btn-primary py-3 px-8 text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Auction
                  </Link>
                  <Link href="#auctions" className="btn-secondary py-3 px-8 text-lg flex items-center gap-2">
                    Browse Auctions
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <div className="text-midnight-400">
                  Connect your wallet to get started
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-midnight-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-midnight-400 max-w-2xl mx-auto">
              ShadowBid uses Inco&apos;s confidential computing to enable truly sealed auctions
              on Solana.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="Encrypted Bids"
              description="Bids are encrypted client-side using Inco SDK. Even validators can't see bid amounts."
            />
            <FeatureCard
              icon={<Eye className="w-8 h-8" />}
              title="Hidden Until Settlement"
              description="Winner is determined through encrypted comparison. Losing bids are never revealed."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Fair & Transparent"
              description="No front-running, no bid sniping. The highest bidder always wins fairly."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard
              icon={<Shield className="w-6 h-6 text-shadow-400" />}
              value="100%"
              label="Encrypted Bids"
            />
            <StatCard
              icon={<Users className="w-6 h-6 text-shadow-400" />}
              value="0"
              label="Active Auctions"
            />
            <StatCard
              icon={<Lock className="w-6 h-6 text-shadow-400" />}
              value="0"
              label="Sealed Bids"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-shadow-400" />}
              value="0 SOL"
              label="Total Volume"
            />
          </div>
        </div>
      </section>

      {/* Auctions Section */}
      <section id="auctions" className="py-20 bg-midnight-900/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Active Auctions</h2>
            <Link
              href="/auctions"
              className="text-shadow-400 hover:text-shadow-300 flex items-center gap-1 text-sm"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Placeholder for auctions */}
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-midnight-800 flex items-center justify-center">
              <Lock className="w-8 h-8 text-midnight-500" />
            </div>
            <h3 className="text-xl font-semibold text-midnight-300 mb-2">
              No Active Auctions
            </h3>
            <p className="text-midnight-500 mb-6">
              Be the first to create a sealed-bid auction!
            </p>
            {connected && (
              <Link href="/auction/create" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Auction
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-shadow-900/50 to-shadow-950/50 border-shadow-700/50">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Bidding?
              </h2>
              <p className="text-midnight-300 mb-8 max-w-xl mx-auto">
                Connect your Solana wallet and experience the future of fair auctions.
                Your bids remain private, guaranteed by cryptography.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auction/create" className="btn-primary py-3 px-8">
                  Create Your First Auction
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Feature Card Component
const FeatureCard: FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <Card className="text-center hover:border-shadow-500/50 transition-colors">
    <CardContent className="pt-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-shadow-900/50 flex items-center justify-center text-shadow-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-midnight-400">{description}</p>
    </CardContent>
  </Card>
);

// Stat Card Component
const StatCard: FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <div className="text-center">
    <div className="flex items-center justify-center mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-midnight-500 text-sm">{label}</div>
  </div>
);
