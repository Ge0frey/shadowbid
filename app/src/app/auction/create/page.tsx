"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { redirect } from "next/navigation";
import { CreateAuctionForm } from "@/components/auction/CreateAuctionForm";

export default function CreateAuctionPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Connect Wallet Required
          </h1>
          <p className="text-midnight-400">
            Please connect your wallet to create an auction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateAuctionForm />
    </div>
  );
}
