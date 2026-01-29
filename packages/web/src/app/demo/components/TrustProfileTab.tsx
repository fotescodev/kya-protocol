"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type SchemaNode = {
  id: string;
  name: string;
  color: string;
  angle: number;
  attestations: number;
  status: "active" | "pending" | "expired";
  details: {
    uid: string;
    created: string;
    expires?: string;
    attester: string;
  };
};

const schemaNodes: SchemaNode[] = [
  {
    id: "identity",
    name: "Identity",
    color: "electric",
    angle: 0,
    attestations: 1,
    status: "active",
    details: {
      uid: "0x1a2b3c...f4e5d6",
      created: "2024-01-15",
      attester: "0x8ba1...DBA72 (Owner)",
    },
  },
  {
    id: "capability",
    name: "Capability",
    color: "cyan-accent",
    angle: 90,
    attestations: 3,
    status: "active",
    details: {
      uid: "0x7g8h9i...j0k1l2",
      created: "2024-01-16",
      expires: "2024-04-16",
      attester: "0x8ba1...DBA72 (Owner)",
    },
  },
  {
    id: "provenance",
    name: "Provenance",
    color: "green-accent",
    angle: 180,
    attestations: 2,
    status: "active",
    details: {
      uid: "0x3m4n5o...p6q7r8",
      created: "2024-01-14",
      attester: "Trail of Bits",
    },
  },
  {
    id: "delegation",
    name: "Delegation",
    color: "purple-accent",
    angle: 270,
    attestations: 1,
    status: "pending",
    details: {
      uid: "0x9s0t1u...v2w3x4",
      created: "2024-02-01",
      expires: "2024-02-08",
      attester: "0x742d...f44e (Agent)",
    },
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  electric: {
    bg: "bg-electric/20",
    border: "border-electric/50",
    text: "text-electric",
    glow: "shadow-electric/30",
  },
  "cyan-accent": {
    bg: "bg-cyan-accent/20",
    border: "border-cyan-accent/50",
    text: "text-cyan-accent",
    glow: "shadow-cyan-accent/30",
  },
  "green-accent": {
    bg: "bg-green-accent/20",
    border: "border-green-accent/50",
    text: "text-green-accent",
    glow: "shadow-green-accent/30",
  },
  "purple-accent": {
    bg: "bg-purple-accent/20",
    border: "border-purple-accent/50",
    text: "text-purple-accent",
    glow: "shadow-purple-accent/30",
  },
};

const statusColors: Record<string, string> = {
  active: "text-green-accent bg-green-accent/10",
  pending: "text-yellow-500 bg-yellow-500/10",
  expired: "text-red-500 bg-red-500/10",
};

export function TrustProfileTab() {
  const [selectedNode, setSelectedNode] = useState<SchemaNode | null>(null);
  const [agentAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");

  const totalAttestations = schemaNodes.reduce((sum, n) => sum + n.attestations, 0);
  const activeSchemas = schemaNodes.filter((n) => n.status === "active").length;

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Left: Visual graph */}
      <div className="lg:col-span-3">
        <div className="glass-bright rounded-2xl p-6 relative">
          <h3 className="font-semibold text-lg mb-4">Trust Profile Visualization</h3>

          {/* Node graph container */}
          <div className="relative aspect-square max-w-md mx-auto">
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
              {schemaNodes.map((node) => {
                const angle = (node.angle * Math.PI) / 180;
                // radius=140 gives endpoints at 15%/85% matching node positions
                const radius = 140;
                const x = 200 + radius * Math.sin(angle);
                const y = 200 - radius * Math.cos(angle);

                return (
                  <line
                    key={node.id}
                    x1="200"
                    y1="200"
                    x2={x}
                    y2={y}
                    stroke={`var(--color-${node.color})`}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-30"
                  />
                );
              })}
            </svg>

            {/* Center node (Agent) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div
                className={cn(
                  "w-24 h-24 rounded-2xl glass-bright border-2 border-white/20 flex flex-col items-center justify-center transition-all duration-300",
                  !selectedNode && "ring-4 ring-white/10"
                )}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-text-primary mb-1"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-xs font-medium">Agent</span>
              </div>
            </div>

            {/* Schema nodes */}
            {schemaNodes.map((node) => {
              const angle = (node.angle * Math.PI) / 180;
              // 35% from center keeps nodes safely within container
              const x = 50 + 35 * Math.sin(angle);
              const y = 50 - 35 * Math.cos(angle);
              const colors = colorClasses[node.color];
              const isSelected = selectedNode?.id === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  <div
                    className={cn(
                      "w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300",
                      colors.bg,
                      colors.border,
                      isSelected && "ring-4 ring-offset-2 ring-offset-navy shadow-lg",
                      isSelected && colors.glow,
                      "hover:scale-105"
                    )}
                  >
                    <span className={cn("text-xs font-semibold", colors.text)}>{node.name}</span>
                    <span className="text-xs text-text-muted mt-0.5">{node.attestations}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-accent" />
              <span className="text-text-muted">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-text-muted">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-text-muted">Expired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Details panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Agent summary */}
        <div className="glass-bright rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Agent Summary</h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">Address</span>
              <code className="text-xs font-mono text-text-secondary">
                {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">Total Attestations</span>
              <span className="text-text-primary font-semibold">{totalAttestations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">Active Schemas</span>
              <span className="text-green-accent font-semibold">{activeSchemas}/4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">Trust Score</span>
              <span className="text-electric font-semibold">85/100</span>
            </div>
          </div>

          {/* Trust meter */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-muted">Trust Level</span>
              <span className="text-electric font-medium">High</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric to-cyan-accent rounded-full transition-all duration-500"
                style={{ width: "85%" }}
              />
            </div>
          </div>
        </div>

        {/* Selected schema details */}
        <div className="glass-bright rounded-2xl p-6">
          <h3 className="font-semibold mb-4">
            {selectedNode ? `${selectedNode.name} Details` : "Schema Details"}
          </h3>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={cn("text-xs px-2 py-1 rounded-full", statusColors[selectedNode.status])}>
                  {selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}
                </span>
                <span className="text-text-muted text-xs">
                  {selectedNode.attestations} attestation{selectedNode.attestations !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="glass rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs text-text-muted block mb-1">Attestation UID</span>
                  <code className="text-xs font-mono text-text-secondary">{selectedNode.details.uid}</code>
                </div>
                <div>
                  <span className="text-xs text-text-muted block mb-1">Created</span>
                  <span className="text-sm text-text-primary">{selectedNode.details.created}</span>
                </div>
                {selectedNode.details.expires && (
                  <div>
                    <span className="text-xs text-text-muted block mb-1">Expires</span>
                    <span className="text-sm text-text-primary">{selectedNode.details.expires}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-text-muted block mb-1">Attester</span>
                  <span className="text-sm text-text-primary">{selectedNode.details.attester}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-text-muted text-sm">Click on a schema node to view its attestation details</p>
          )}
        </div>

        {/* Quick actions */}
        <div className="glass-bright rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full glass rounded-lg px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-electric">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add New Attestation
            </button>
            <button className="w-full glass rounded-lg px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-accent">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Update Capabilities
            </button>
            <button className="w-full glass rounded-lg px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-accent">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Export Trust Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
