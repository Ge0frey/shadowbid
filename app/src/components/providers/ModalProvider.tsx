"use client";

import { createContext, useContext, useState, ReactNode, FC } from "react";

interface ModalContextType {
  isCreateAuctionOpen: boolean;
  openCreateAuction: () => void;
  closeCreateAuction: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [isCreateAuctionOpen, setIsCreateAuctionOpen] = useState(false);

  const openCreateAuction = () => setIsCreateAuctionOpen(true);
  const closeCreateAuction = () => setIsCreateAuctionOpen(false);

  return (
    <ModalContext.Provider
      value={{
        isCreateAuctionOpen,
        openCreateAuction,
        closeCreateAuction,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
