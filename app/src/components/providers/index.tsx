"use client";

import { FC, ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "react-hot-toast";

// Dynamically import WalletProvider with SSR disabled to prevent hydration errors
const WalletProviderDynamic = dynamic(
  () => import("./WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

interface Props {
  children: ReactNode;
}

export const Providers: FC<Props> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryProvider>
      {mounted ? (
        <WalletProviderDynamic>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#fff",
                border: "1px solid #334155",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </WalletProviderDynamic>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-midnight-400">Loading...</div>
        </div>
      )}
    </QueryProvider>
  );
};
