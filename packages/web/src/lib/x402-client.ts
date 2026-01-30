"use client";

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import type { WalletClient } from "viem";
import { useWalletClient } from "wagmi";
import { useMemo } from "react";

/**
 * Adapter to convert a viem WalletClient to the ClientEvmSigner interface
 * required by the x402 ExactEvmScheme
 */
function walletClientToSigner(walletClient: WalletClient) {
  const account = walletClient.account;
  if (!account) {
    throw new Error("WalletClient must have an account");
  }

  return {
    address: account.address,
    signTypedData: async (message: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }): Promise<`0x${string}`> => {
      return walletClient.signTypedData({
        account,
        domain: message.domain as Parameters<typeof walletClient.signTypedData>[0]["domain"],
        types: message.types as Parameters<typeof walletClient.signTypedData>[0]["types"],
        primaryType: message.primaryType,
        message: message.message,
      });
    },
  };
}

/**
 * Creates an x402-enabled fetch function that automatically handles
 * 402 Payment Required responses using the provided wallet for signing.
 *
 * @param walletClient - The viem WalletClient to use for signing payments
 * @returns A wrapped fetch function that handles x402 payments automatically
 *
 * @example
 * ```typescript
 * const walletClient = useWalletClient();
 * if (walletClient.data) {
 *   const fetchWithPay = createX402Fetch(walletClient.data);
 *   const response = await fetchWithPay('/api/paid-endpoint');
 * }
 * ```
 */
export function createX402Fetch(walletClient: WalletClient): typeof fetch {
  const signer = walletClientToSigner(walletClient);

  // Create x402 client and register EVM exact scheme with wildcard support
  const client = new x402Client().register("eip155:*", new ExactEvmScheme(signer));

  // Wrap native fetch with x402 payment handling
  return wrapFetchWithPayment(fetch, client);
}

/**
 * React hook that provides an x402-enabled fetch function.
 *
 * Returns null if no wallet is connected, otherwise returns a fetch function
 * that automatically handles 402 Payment Required responses.
 *
 * @returns The wrapped fetch function or null if no wallet connected
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const x402Fetch = useX402Fetch();
 *
 *   const handleRequest = async () => {
 *     if (!x402Fetch) {
 *       alert('Please connect your wallet first');
 *       return;
 *     }
 *     const response = await x402Fetch('/api/paid-endpoint');
 *     const data = await response.json();
 *   };
 *
 *   return <button onClick={handleRequest}>Make Paid Request</button>;
 * }
 * ```
 */
export function useX402Fetch(): typeof fetch | null {
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!walletClient) {
      return null;
    }
    return createX402Fetch(walletClient);
  }, [walletClient]);
}
