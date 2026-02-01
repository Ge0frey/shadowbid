"use client";

import { FC, useState, useEffect, createContext, useContext, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Ticket,
  Shield,
  ExternalLink,
  Github,
  TrendingUp,
  Lock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Context for sidebar collapsed state
const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export const useSidebar = () => useContext(SidebarContext);

// Provider component to wrap both sidebar and main content
export const SidebarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

const navLinks = [
  { 
    href: "/auctions", 
    label: "Browse Auctions", 
    icon: TrendingUp
  },
  { 
    href: "/my-bids", 
    label: "My Bids", 
    icon: Ticket
  },
  { 
    href: "/my-auctions", 
    label: "My Auctions", 
    icon: LayoutDashboard
  },
];

export const Sidebar: FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, setCollapsed } = useSidebar();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={`p-4 flex items-center ${collapsed && !isMobile ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="group">
          {collapsed && !isMobile ? (
            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-white tracking-tight">Sb</span>
            </div>
          ) : (
            <div>
              <span className="text-lg font-bold text-surface-100 tracking-tight group-hover:text-white transition-colors">
                Shadow<span className="text-accent-400 group-hover:text-accent-300">Bid</span>
              </span>
              <span className="text-[9px] text-surface-500 uppercase tracking-widest block -mt-0.5">Sealed Auctions</span>
            </div>
          )}
        </Link>
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md text-surface-500 hover:text-surface-100 hover:bg-surface-800/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed && !isMobile ? link.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  collapsed && !isMobile ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-accent-500/15 text-accent-400"
                    : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/40"
                }`}
              >
                <link.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-accent-400" : ""}`} />
                {(!collapsed || isMobile) && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={`mt-auto border-t border-surface-800/50 ${collapsed && !isMobile ? "px-2 py-3" : "p-3"}`}>
        {/* Status row */}
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-4 px-2 py-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent-500" />
              <span className="text-[11px] text-surface-400">Privacy</span>
              <span className="text-[11px] font-medium text-surface-200">100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
              <span className="text-[11px] text-surface-400">Network</span>
              <span className="text-[11px] font-medium text-success-400">Live</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2 mb-2">
            <div className="flex items-center gap-1" title="Privacy: 100%">
              <Lock className="w-3.5 h-3.5 text-accent-500" />
            </div>
            <div className="flex items-center gap-1" title="Network: Live">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
            </div>
          </div>
        )}
        
        {/* Links row */}
        {(!collapsed || isMobile) ? (
          <>
            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-surface-500 mb-1">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-accent-500/70" />
                <span>Inco Powered</span>
              </div>
              <span className="text-surface-600">Devnet</span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="https://github.com/Ge0frey/shadowbid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-surface-500 hover:text-surface-300 hover:bg-surface-800/40 transition-all text-xs"
              >
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
              <a
                href="https://inco.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-surface-500 hover:text-surface-300 hover:bg-surface-800/40 transition-all text-xs"
              >
                Inco
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <a
              href="https://github.com/Ge0frey/shadowbid"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="p-2 rounded-md text-surface-500 hover:text-surface-300 hover:bg-surface-800/40 transition-all"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://inco.org"
              target="_blank"
              rel="noopener noreferrer"
              title="Inco"
              className="p-2 rounded-md text-surface-500 hover:text-surface-300 hover:bg-surface-800/40 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-900/90 border border-surface-800/50 text-surface-400 hover:text-surface-100 transition-all backdrop-blur-sm"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex fixed top-0 left-0 h-screen bg-surface-950 border-r border-surface-800/50 flex-col z-40 transition-all duration-200 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {sidebarContent(false)}
        
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors shadow-lg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-surface-950 border-r border-surface-800/50 flex flex-col z-50 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
};
