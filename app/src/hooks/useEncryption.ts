"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { encryptBid, decryptHandle, decryptWithProof } from "@/lib/encryption";

export function useEncryption() {
  const { publicKey, signMessage } = useWallet();
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const encrypt = useCallback(async (amountLamports: bigint): Promise<Buffer | null> => {
    try {
      setEncrypting(true);
      const ciphertext = await encryptBid(amountLamports);
      return ciphertext;
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    } finally {
      setEncrypting(false);
    }
  }, []);

  const decrypt = useCallback(async (handle: string): Promise<string | null> => {
    if (!publicKey || !signMessage) {
      console.error("Wallet not connected");
      return null;
    }

    try {
      setDecrypting(true);
      const plaintext = await decryptHandle(handle, publicKey, signMessage);
      return plaintext;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    } finally {
      setDecrypting(false);
    }
  }, [publicKey, signMessage]);

  const decryptForSettlement = useCallback(async (handle: string) => {
    if (!publicKey || !signMessage) {
      throw new Error("Wallet not connected");
    }

    setDecrypting(true);
    try {
      const result = await decryptWithProof(handle, publicKey, signMessage);
      return result;
    } finally {
      setDecrypting(false);
    }
  }, [publicKey, signMessage]);

  return {
    encrypt,
    decrypt,
    decryptForSettlement,
    encrypting,
    decrypting,
    isReady: !!publicKey && !!signMessage,
  };
}
