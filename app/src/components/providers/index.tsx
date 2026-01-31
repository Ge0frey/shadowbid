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
              duration: 4000,
              style: {
                background: "#1c1917", // surface-900
                color: "#fafaf9", // surface-50
                border: "1px solid #292524", // surface-800
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
              success: {
                iconTheme: {
                  primary: "#10b981", // success-500
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f43f5e", // error-500
                  secondary: "#fff",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#f59e0b", // accent-500
                  secondary: "#fff",
                },
              },
            }}
          />
        </WalletProviderDynamic>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-surface-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-surface-400 text-sm">Loading...</span>
          </div>
        </div>
      )}
    </QueryProvider>
  );
};
