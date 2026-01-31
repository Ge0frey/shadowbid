"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { CreateAuctionForm } from "@/components/auction/CreateAuctionForm";

export default function CreateAuctionPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-surface-500" />
        </div>
        <h1 className="heading-3 text-surface-100 mb-2 text-center">
          Connect Your Wallet
        </h1>
        <p className="text-muted text-center max-w-md mb-6">
          Please connect your Solana wallet to create an auction.
        </p>
        <Link href="/auctions" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Browse Auctions
        </Link>
      </div>
    );
  }

  return <CreateAuctionForm />;
}
