"use client";

import { FC, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar, SidebarProvider, useSidebar } from "./Sidebar";

interface LayoutWrapperProps {
  children: ReactNode;
}

// Inner component that uses sidebar context
const MainContent: FC<{ children: ReactNode }> = ({ children }) => {
  const { collapsed } = useSidebar();
  
  return (
    <div 
      className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
        collapsed ? "lg:ml-16" : "lg:ml-56"
      }`}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export const LayoutWrapper: FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Landing page: full-width layout without sidebar
  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // App pages: layout with persistent sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        {/* Sidebar - Fixed on left (desktop) / Overlay (mobile) */}
        <Sidebar />
        
        {/* Main content area - offset for sidebar on desktop */}
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
};
