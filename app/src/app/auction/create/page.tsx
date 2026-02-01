"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useModal } from "@/components/providers/ModalProvider";

export default function CreateAuctionPage() {
  const router = useRouter();
  const { openCreateAuction } = useModal();

  useEffect(() => {
    // Open the modal and redirect to auctions page
    openCreateAuction();
    router.replace("/auctions");
  }, [openCreateAuction, router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
      <p className="text-surface-400">Opening create auction...</p>
    </div>
  );
}
