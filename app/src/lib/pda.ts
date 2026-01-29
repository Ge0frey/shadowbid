import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {
  SHADOWBID_PROGRAM_ID,
  INCO_LIGHTNING_PROGRAM_ID,
  AUCTION_SEED,
  BID_SEED,
} from "./constants";

/**
 * Derives the auction PDA
 * Seeds: ["auction", seller, auction_id]
 */
export function findAuctionPda(
  seller: PublicKey,
  auctionId: BN | bigint | number
): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8);
  
  if (auctionId instanceof BN) {
    idBuffer.set(auctionId.toArrayLike(Buffer, "le", 8));
  } else {
    const bn = new BN(auctionId.toString());
    idBuffer.set(bn.toArrayLike(Buffer, "le", 8));
  }

  return PublicKey.findProgramAddressSync(
    [AUCTION_SEED, seller.toBuffer(), idBuffer],
    SHADOWBID_PROGRAM_ID
  );
}

/**
 * Derives the bid PDA
 * Seeds: ["bid", auction, bidder]
 */
export function findBidPda(
  auction: PublicKey,
  bidder: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [BID_SEED, auction.toBuffer(), bidder.toBuffer()],
    SHADOWBID_PROGRAM_ID
  );
}

/**
 * Derives the Inco allowance PDA
 * Seeds: [handle_bytes (16 bytes LE), allowed_address]
 */
export function findAllowancePda(
  handle: bigint | string,
  allowedAddress: PublicKey
): [PublicKey, number] {
  const handleBigInt = typeof handle === "string" ? BigInt(handle) : handle;
  
  const handleBuffer = Buffer.alloc(16);
  // Write as little-endian u128
  const low = handleBigInt & BigInt("0xFFFFFFFFFFFFFFFF");
  const high = handleBigInt >> BigInt(64);
  
  handleBuffer.writeBigUInt64LE(low, 0);
  handleBuffer.writeBigUInt64LE(high, 8);

  return PublicKey.findProgramAddressSync(
    [handleBuffer, allowedAddress.toBuffer()],
    INCO_LIGHTNING_PROGRAM_ID
  );
}

/**
 * Extracts handle from account data
 * Handles are stored as u128 at a specific offset
 */
export function extractHandle(
  accountData: Buffer,
  offset: number = 72 // Adjust based on account structure
): bigint | null {
  if (accountData.length < offset + 16) {
    return null;
  }

  const handleBytes = accountData.slice(offset, offset + 16);
  let handle = BigInt(0);
  
  for (let i = 15; i >= 0; i--) {
    handle = handle * BigInt(256) + BigInt(handleBytes[i]);
  }
  
  return handle;
}

/**
 * Converts a handle to a buffer for instruction data
 */
export function handleToBuffer(handle: bigint | string): Buffer {
  const handleBigInt = typeof handle === "string" ? BigInt(handle) : handle;
  
  const buffer = Buffer.alloc(16);
  const low = handleBigInt & BigInt("0xFFFFFFFFFFFFFFFF");
  const high = handleBigInt >> BigInt(64);
  
  buffer.writeBigUInt64LE(low, 0);
  buffer.writeBigUInt64LE(high, 8);
  
  return buffer;
}

/**
 * Converts a plaintext value to a buffer for instruction data
 */
export function plaintextToBuffer(plaintext: bigint | string | number): Buffer {
  const value = typeof plaintext === "string" ? BigInt(plaintext) : BigInt(plaintext);
  
  const buffer = Buffer.alloc(16);
  const low = value & BigInt("0xFFFFFFFFFFFFFFFF");
  const high = value >> BigInt(64);
  
  buffer.writeBigUInt64LE(low, 0);
  buffer.writeBigUInt64LE(high, 8);
  
  return buffer;
}
