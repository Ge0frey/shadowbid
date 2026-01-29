import { PublicKey } from "@solana/web3.js";


// Program IDs
export const SHADOWBID_PROGRAM_ID = new PublicKey(
  "GGanQwYdzturA2hMuPbR69toMaiHPaGox86YifLjMVzQ"
);

export const INCO_LIGHTNING_PROGRAM_ID = new PublicKey(
  "5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj"
);


// PDA Seeds
export const AUCTION_SEED = Buffer.from("auction");
export const BID_SEED = Buffer.from("bid");


// Network Configuration
export const SOLANA_NETWORK = "devnet";
export const SOLANA_RPC_URL = "https://api.devnet.solana.com";


// Auction Constants
export const MIN_AUCTION_DURATION = 3600; // 1 hour in seconds
export const MAX_AUCTION_DURATION = 604800; // 7 days in seconds
export const DEFAULT_AUCTION_DURATION = 86400; // 24 hours in seconds

export const MAX_TITLE_LENGTH = 64;
export const MAX_DESCRIPTION_LENGTH = 256;


// Display Constants
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Format lamports to SOL with specified decimals
export const formatSol = (lamports: number | bigint, decimals: number = 4): string => {
  const sol = Number(lamports) / LAMPORTS_PER_SOL;
  return sol.toFixed(decimals);
};

// Parse SOL to lamports
export const parseSol = (sol: number | string): bigint => {
  return BigInt(Math.floor(Number(sol) * LAMPORTS_PER_SOL));
};


// Auction States
export type AuctionState = 
  | { open: {} }
  | { closed: {} }
  | { winnerDetermined: {} }
  | { settled: {} }
  | { cancelled: {} };

export const getAuctionStateLabel = (state: AuctionState): string => {
  if ("open" in state) return "Open";
  if ("closed" in state) return "Closed";
  if ("winnerDetermined" in state) return "Winner Determined";
  if ("settled" in state) return "Settled";
  if ("cancelled" in state) return "Cancelled";
  return "Unknown";
};

export const getAuctionStateColor = (state: AuctionState): string => {
  if ("open" in state) return "status-open";
  if ("closed" in state) return "status-closed";
  if ("winnerDetermined" in state) return "status-badge bg-purple-900/50 text-purple-400 border border-purple-700";
  if ("settled" in state) return "status-settled";
  if ("cancelled" in state) return "status-cancelled";
  return "";
};
