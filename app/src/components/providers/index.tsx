"use client";

import { FC, ReactNode } from "react";
import { WalletProvider } from "./WalletProvider";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "react-hot-toast";

interface Props {
  children: ReactNode;
}

export const Providers: FC<Props> = ({ children }) => {
  return (
    <QueryProvider>
      <WalletProvider>
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
      </WalletProvider>
    </QueryProvider>
  );
};
