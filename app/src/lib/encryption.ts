import { encryptValue } from "@inco/solana-sdk/encryption";
import { decrypt } from "@inco/solana-sdk/attested-decrypt";
import { hexToBuffer } from "@inco/solana-sdk/utils";
import { PublicKey } from "@solana/web3.js";

/**
 * Encrypts a bid amount using Inco SDK
 * @param amountLamports - The bid amount in lamports
 * @returns The encrypted ciphertext as a Buffer
 */
export async function encryptBid(amountLamports: bigint): Promise<Buffer> {
  try {
    const encryptedHex = await encryptValue(amountLamports);
    return hexToBuffer(encryptedHex);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt bid amount");
  }
}

/**
 * Decrypts an encrypted handle using Inco SDK
 * Requires the user to have decryption permission (via allow())
 * 
 * @param handle - The encrypted handle as a string
 * @param address - The user's public key
 * @param signMessage - The wallet's signMessage function
 * @returns The decrypted plaintext value
 */
export async function decryptHandle(
  handle: string,
  address: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<string | null> {
  try {
    const result = await decrypt([handle], {
      address,
      signMessage,
    });
    
    return result.plaintexts[0];
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

/**
 * Decrypts a handle and returns both plaintext and Ed25519 instructions
 * for on-chain verification (used in settle_auction)
 */
export async function decryptWithProof(
  handle: string,
  address: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
) {
  try {
    const result = await decrypt([handle], {
      address,
      signMessage,
    });
    
    return {
      plaintext: result.plaintexts[0],
      handle: result.handles[0],
      signature: result.signatures[0],
      ed25519Instructions: result.ed25519Instructions,
    };
  } catch (error) {
    console.error("Decryption with proof failed:", error);
    throw new Error("Failed to decrypt with proof");
  }
}

/**
 * Validates that a value can be encrypted
 * @param value - The value to validate
 * @returns true if the value can be encrypted
 */
export function canEncrypt(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "number" && !Number.isInteger(value)) return false;
  if (typeof value === "string" || typeof value === "object") return false;
  return true;
}

/**
 * Formats an encrypted handle for display
 * @param handle - The handle as u128 or string
 * @returns Truncated display string
 */
export function formatHandle(handle: bigint | string | number): string {
  const str = handle.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 6)}...${str.slice(-6)}`;
}
