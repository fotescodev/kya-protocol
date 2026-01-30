"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { DEMO_TOKENS } from "../data";

interface ApiRequestPanelProps {
  onExecute: (token: string, wallet: string) => void;
  isLoading: boolean;
  response: any | null;
  error: string | null;
}

export function ApiRequestPanel({
  onExecute,
  isLoading,
  response,
  error,
}: ApiRequestPanelProps) {
  const { address } = useAccount();
  const [selectedToken, setSelectedToken] = useState(DEMO_TOKENS[0].address);

  const handleExecute = () => {
    if (address) {
      onExecute(selectedToken, address);
    }
  };

  const selectedTokenData = DEMO_TOKENS.find((t) => t.address === selectedToken);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Alchemy Token API</h3>
        <p className="text-sm text-text-muted">KYA-Verified Access</p>
      </div>

      {/* Token Selection */}
      <div className="glass rounded-xl p-4 border border-electric/30">
        <label
          htmlFor="token-select"
          className="block text-xs font-semibold tracking-wider text-text-muted uppercase mb-2"
        >
          Select Token
        </label>
        <select
          id="token-select"
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-text-muted/20 text-text-primary focus:outline-none focus:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy transition-colors"
        >
          {DEMO_TOKENS.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>
      </div>

      {/* Wallet Address Input */}
      <div className="glass rounded-xl p-4 border border-cyan-accent/30">
        <label
          htmlFor="wallet-address"
          className="block text-xs font-semibold tracking-wider text-text-muted uppercase mb-2"
        >
          Wallet Address
        </label>
        <input
          id="wallet-address"
          type="text"
          value={address || "Connect wallet to continue"}
          readOnly
          aria-readonly="true"
          className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-text-muted/20 text-text-secondary font-mono text-sm focus:outline-none cursor-not-allowed"
        />
      </div>

      {/* Cost Info Box */}
      <div className="glass rounded-xl p-4 border border-purple-accent/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-electric/5 to-purple-accent/5 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Cost
            </span>
            <p className="text-lg font-semibold text-electric">$0.001 USDC</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Network
            </span>
            <p className="text-sm text-text-secondary">
              {selectedTokenData?.chainName || "Base Sepolia"}
            </p>
          </div>
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={isLoading || !address}
        aria-busy={isLoading}
        aria-disabled={!address}
        className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-electric hover:bg-electric/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
      >
        {isLoading ? (
          <>
            <svg
              className="motion-safe:animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          "Request Token Data"
        )}
      </button>

      {/* Error State */}
      {error && (
        <div className="rounded-xl p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="glass rounded-xl p-4 border border-green-accent/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Response
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-accent/20 text-green-accent border border-green-accent/30">
              Success
            </span>
          </div>
          <div className="glass-bright rounded-lg p-3 overflow-x-auto">
            <pre className="text-xs text-text-secondary">
              <code>{JSON.stringify(response, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
