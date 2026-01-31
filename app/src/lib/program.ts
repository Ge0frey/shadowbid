import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { SHADOWBID_PROGRAM_ID } from "./constants";

// The IDL will be copied here after running: anchor build
// Then: cp target/idl/shadowbid.json app/src/lib/idl/
let IDL: Idl | null = null;

try {
  // Dynamic import for the IDL
  IDL = require("./idl/shadowbid.json");
} catch {
  console.warn("IDL not found. Run 'anchor build' and copy IDL to app/src/lib/idl/");
}

/**
 * Gets the ShadowBid program instance
 */
export function getProgram(
  connection: Connection,
  wallet: any // AnchorWallet
): Program | null {
  if (!IDL) {
    console.error("IDL not loaded");
    return null;
  }

  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  return new Program(IDL as Idl, provider);
}

/**
 * Creates a read-only program instance (no wallet required)
 */
export function getReadOnlyProgram(connection: Connection): Program | null {
  if (!IDL) {
    console.error("IDL not loaded");
    return null;
  }

  // Create a minimal provider without wallet
  const provider = {
    connection,
  };

  return new Program(IDL as Idl, provider as any);
}


// Type exports from IDL
export interface AuctionAccount {
  seller: PublicKey;
  itemMint: PublicKey;
  title: number[];
  description: number[];
  reservePrice: bigint;
  startTime: bigint;
  endTime: bigint;
  state: AuctionState;
  bidCount: number;
  bidsProcessed: number;
  highestBidHandle: bigint;
  currentLeader: PublicKey;
  winner: PublicKey;
  winningAmount: bigint;
  auctionId: bigint;
  bump: number;
}

export interface BidAccount {
  auction: PublicKey;
  bidder: PublicKey;
  encryptedAmount: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  processed: boolean;
  bump: number;
}

export type AuctionState =
  | { open: {} }
  | { closed: {} }
  | { winnerDetermined: {} }
  | { settled: {} }
  | { cancelled: {} };


// Helper functions

/**
 * Converts a byte array to a string (for title/description)
 */
export function bytesToString(bytes: number[]): string {
  return String.fromCharCode(...bytes.filter(b => b !== 0));
}

/**
 * Converts a string to a padded byte array
 */
export function stringToBytes(str: string, length: number): number[] {
  const bytes = new Array(length).fill(0);
  const strBytes = Buffer.from(str);
  strBytes.copy(Buffer.from(bytes), 0, 0, Math.min(strBytes.length, length));
  return bytes;
}
