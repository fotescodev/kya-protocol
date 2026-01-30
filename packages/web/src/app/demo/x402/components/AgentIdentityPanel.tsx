"use client";

import { DEMO_AGENT } from "../data";

// Helper to truncate addresses/UIDs for display
function truncate(str: string, startChars = 10, endChars = 4): string {
  if (str.length <= startChars + endChars + 3) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}

// EAS Base Sepolia explorer URL
const EAS_EXPLORER_URL = "https://base-sepolia.easscan.org/attestation/view";

export function AgentIdentityPanel() {
  const { identity, capability, delegation } = DEMO_AGENT;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Agent Attestations</h3>

      <div className="grid gap-4">
        {/* Identity Card */}
        <div className="glass rounded-xl p-4 border border-electric/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Identity
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-electric/20 text-electric border border-electric/30">
              Valid
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">UID</span>
              <span className="font-mono text-text-secondary">{truncate(identity.uid, 10, 6)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Display Name</span>
              <span className="text-electric font-medium">{identity.displayName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Owner</span>
              <span className="font-mono text-text-secondary">{truncate(identity.ownerAddress, 6, 4)}</span>
            </div>
            <a
              href={`${EAS_EXPLORER_URL}/${identity.uid}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View identity attestation on EAS Explorer (opens in new tab)"
              className="inline-flex items-center gap-1.5 text-xs text-electric hover:underline mt-2 focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded"
            >
              View on EAS Explorer
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Capability Card */}
        <div className="glass rounded-xl p-4 border border-cyan-accent/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Capability
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-accent/20 text-cyan-accent border border-cyan-accent/30">
              TRANSACT
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Permissions</span>
              <div className="flex gap-1.5">
                {capability.permissions.slice(0, 2).map((perm) => (
                  <span
                    key={perm}
                    className="px-1.5 py-0.5 text-xs font-mono rounded bg-cyan-accent/10 text-cyan-accent"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Bitmask</span>
              <span className="font-mono text-text-secondary text-xs">{truncate(capability.permissionsBitmask, 10, 6)}</span>
            </div>
          </div>
        </div>

        {/* Delegation Card */}
        <div className="glass rounded-xl p-4 border border-purple-accent/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-accent/5 to-purple-accent/5 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Delegation
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-accent/20 text-purple-accent border border-purple-accent/30">
                Depth: {delegation.depth}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Delegator</span>
                <span className="font-mono text-text-secondary">{truncate(delegation.delegator, 6, 4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Scope</span>
                <span className="text-green-accent font-mono text-xs">{delegation.scope}</span>
              </div>
              <a
                href={`${EAS_EXPLORER_URL}/${delegation.uid}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View delegation attestation on EAS Explorer (opens in new tab)"
                className="inline-flex items-center gap-1.5 text-xs text-purple-accent hover:underline mt-2 focus-visible:ring-2 focus-visible:ring-purple-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded"
              >
                View on EAS Explorer
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
