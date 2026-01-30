"use client";

import { useAccount, useConnect, useDisconnect, useBalance, useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { USDC_ADDRESS, USDC_ABI } from "@/lib/wagmi";
import { formatUnits } from "viem";

// Helper to truncate addresses for display
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletPanel() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  // ETH balance
  const { data: ethBalance } = useBalance({
    address,
    chainId: baseSepolia.id,
  });

  // USDC balance using useReadContract
  const { data: usdcBalanceRaw } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address,
    },
  });

  // Disconnected state - show connect options
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-electric/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-electric">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Connect Wallet</h3>
            <p className="text-xs text-text-muted">Select your preferred wallet</p>
          </div>
        </div>

        <div className="grid gap-3" role="group" aria-label="Wallet connection options">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="glass-bright rounded-xl p-4 text-left transition-transform duration-200 motion-safe:hover:scale-[1.02] hover:border-electric/50 border border-transparent focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              <span className="text-text-primary font-medium">{connector.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Connected state - show wallet info
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-green-accent/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-accent">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Agent Wallet</h3>
          <p className="text-xs text-text-muted">Connected to Base Sepolia</p>
        </div>
      </div>

      {/* Address Card */}
      <div className="glass rounded-xl p-4 border border-electric/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Address
          </span>
        </div>
        <span className="font-mono text-electric">{truncateAddress(address!)}</span>
      </div>

      {/* Balance Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* ETH Balance */}
        <div className="glass rounded-xl p-4 border border-cyan-accent/30">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase block mb-2">
            ETH
          </span>
          <span className="text-cyan-accent font-mono text-lg">
            {ethBalance ? parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4) : "0.0000"}
          </span>
        </div>

        {/* USDC Balance */}
        <div className="glass rounded-xl p-4 border border-electric/30">
          <span className="text-xs font-semibold tracking-wider text-text-muted uppercase block mb-2">
            USDC
          </span>
          <span className="text-electric font-mono text-lg">
            {usdcBalanceRaw ? parseFloat(formatUnits(usdcBalanceRaw as bigint, 6)).toFixed(2) : "0.00"}
          </span>
        </div>
      </div>

      {/* Network Badge */}
      <div className="flex items-center justify-center">
        <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-cyan-accent/20 text-cyan-accent border border-cyan-accent/30">
          Base Sepolia
        </span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={() => disconnect()}
        className="w-full glass-bright rounded-xl p-3 text-text-muted hover:text-text-primary hover:border-red-500/50 border border-transparent transition-all duration-200 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
      >
        Disconnect
      </button>
    </div>
  );
}
