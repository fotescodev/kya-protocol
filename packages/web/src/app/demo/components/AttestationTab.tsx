"use client";

import { useState, useMemo } from "react";
import { DEMO_SCHEMAS } from "../data";
import { CopyButton } from "@/components/ui/CopyButton";
import { highlightCode } from "@/lib/highlight";
import { cn } from "@/lib/cn";

type FormData = {
  schemaId: string;
  agentAddress: string;
  ownerAddress: string;
  displayName: string;
  permissions: string[];
  targetContract: string;
  expiresIn: string;
};

const colorStyles: Record<string, { text: string; bg: string; border: string }> = {
  electric: {
    text: "text-electric",
    bg: "bg-electric/10",
    border: "border-electric/30",
  },
  "cyan-accent": {
    text: "text-cyan-accent",
    bg: "bg-cyan-accent/10",
    border: "border-cyan-accent/30",
  },
  "green-accent": {
    text: "text-green-accent",
    bg: "bg-green-accent/10",
    border: "border-green-accent/30",
  },
  "purple-accent": {
    text: "text-purple-accent",
    bg: "bg-purple-accent/10",
    border: "border-purple-accent/30",
  },
};

const PERMISSION_OPTIONS = [
  { name: "TRANSACT", bit: 0, value: 1 },
  { name: "SIGN", bit: 1, value: 2 },
  { name: "DEPLOY", bit: 2, value: 4 },
  { name: "ADMIN", bit: 3, value: 8 },
  { name: "READ_PRIVATE", bit: 4, value: 16 },
  { name: "DELEGATE", bit: 5, value: 32 },
];

export function AttestationTab() {
  const [formData, setFormData] = useState<FormData>({
    schemaId: "identity",
    agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    ownerAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    displayName: "Trading Bot Alpha",
    permissions: ["TRANSACT", "SIGN"],
    targetContract: "",
    expiresIn: "30",
  });

  const selectedSchema = DEMO_SCHEMAS.find((s) => s.id === formData.schemaId) || DEMO_SCHEMAS[0];
  const styles = colorStyles[selectedSchema.color];

  const permissionsBitmask = useMemo(() => {
    return formData.permissions.reduce((acc, perm) => {
      const option = PERMISSION_OPTIONS.find((p) => p.name === perm);
      return acc | (option?.value || 0);
    }, 0);
  }, [formData.permissions]);

  const generatedCode = useMemo(() => {
    const expiresAt =
      formData.expiresIn && parseInt(formData.expiresIn) > 0
        ? `Math.floor(Date.now() / 1000) + ${parseInt(formData.expiresIn)} * 24 * 60 * 60`
        : "0";

    switch (formData.schemaId) {
      case "identity":
        return `import { KYA } from "@kya/sdk";

const kya = new KYA({ provider });

const identity = await kya.identity.create({
  agentAddress: "${formData.agentAddress}",
  ownerAddress: "${formData.ownerAddress}",
  displayName: "${formData.displayName}",
  description: "Created via KYA Demo",
  metadataURI: "ipfs://..."
});

console.log("Identity UID:", identity.uid);`;

      case "capability":
        return `import { KYA, Permission } from "@kya/sdk";

const kya = new KYA({ provider });

const capability = await kya.capability.grant({
  agentAddress: "${formData.agentAddress}",
  permissions: ${permissionsBitmask}, // ${formData.permissions.join(" | ")}
  targetContract: "${formData.targetContract || "0x0000000000000000000000000000000000000000"}",
  expiresAt: ${expiresAt},
  trustLevel: 100
});

console.log("Capability UID:", capability.uid);`;

      case "provenance":
        return `import { KYA, ProvenanceType } from "@kya/sdk";

const kya = new KYA({ provider });

const provenance = await kya.provenance.attest({
  agentAddress: "${formData.agentAddress}",
  sourceCodeHash: "0x...", // Hash of source repo
  modelHash: "0x...", // AI model hash
  buildHash: "0x...", // Build artifact hash
  provenanceType: ProvenanceType.HYBRID
});

console.log("Provenance UID:", provenance.uid);`;

      case "delegation":
        return `import { KYA } from "@kya/sdk";

const kya = new KYA({ provider });

const delegation = await kya.delegation.create({
  delegator: "${formData.ownerAddress}",
  delegatee: "${formData.agentAddress}",
  scope: "execute:${formData.displayName.toLowerCase().replace(/\s+/g, "-")}",
  constraints: {
    maxTransactionValue: "1000000000000000000" // 1 ETH
  },
  expiresAt: ${expiresAt}
});

console.log("Delegation UID:", delegation.uid);`;

      default:
        return "// Select a schema to generate code";
    }
  }, [formData, permissionsBitmask]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form panel */}
      <div className="glass-bright rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", styles.bg)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={styles.text}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Create Attestation</h3>
            <p className="text-text-muted text-sm">Fill in the form to generate SDK code</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Schema selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Schema Type</label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_SCHEMAS.map((schema) => {
                const schemaStyles = colorStyles[schema.color];
                const isSelected = formData.schemaId === schema.id;

                return (
                  <button
                    key={schema.id}
                    onClick={() => handleInputChange("schemaId", schema.id)}
                    className={cn(
                      "glass rounded-lg px-3 py-2 text-sm text-left transition-all cursor-pointer border",
                      isSelected ? schemaStyles.border : "border-transparent",
                      isSelected && schemaStyles.bg
                    )}
                  >
                    <span className={cn("font-medium", isSelected ? schemaStyles.text : "text-text-primary")}>
                      {schema.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent Address */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Agent Address</label>
            <input
              type="text"
              value={formData.agentAddress}
              onChange={(e) => handleInputChange("agentAddress", e.target.value)}
              className="w-full glass rounded-lg px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-electric/50"
              placeholder="0x..."
            />
          </div>

          {/* Owner Address (for Identity/Delegation) */}
          {(formData.schemaId === "identity" || formData.schemaId === "delegation") && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {formData.schemaId === "delegation" ? "Delegator Address" : "Owner Address"}
              </label>
              <input
                type="text"
                value={formData.ownerAddress}
                onChange={(e) => handleInputChange("ownerAddress", e.target.value)}
                className="w-full glass rounded-lg px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-electric/50"
                placeholder="0x..."
              />
            </div>
          )}

          {/* Display Name (for Identity) */}
          {formData.schemaId === "identity" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                className="w-full glass rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-electric/50"
                placeholder="My Agent"
              />
            </div>
          )}

          {/* Permissions (for Capability) */}
          {formData.schemaId === "capability" && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Permissions
                  <span className="text-text-muted font-normal ml-2">
                    (Bitmask: {permissionsBitmask})
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const isSelected = formData.permissions.includes(perm.name);

                    return (
                      <button
                        key={perm.name}
                        onClick={() => togglePermission(perm.name)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border",
                          isSelected
                            ? "bg-cyan-accent/20 text-cyan-accent border-cyan-accent/30"
                            : "glass border-transparent text-text-muted hover:text-text-secondary"
                        )}
                      >
                        {perm.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Target Contract
                  <span className="text-text-muted font-normal ml-2">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.targetContract}
                  onChange={(e) => handleInputChange("targetContract", e.target.value)}
                  className="w-full glass rounded-lg px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-electric/50"
                  placeholder="0x... (leave empty for any)"
                />
              </div>
            </>
          )}

          {/* Expiration (for Capability/Delegation) */}
          {(formData.schemaId === "capability" || formData.schemaId === "delegation") && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Expires In (days)
                <span className="text-text-muted font-normal ml-2">(0 = never)</span>
              </label>
              <input
                type="number"
                value={formData.expiresIn}
                onChange={(e) => handleInputChange("expiresIn", e.target.value)}
                className="w-full glass rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-electric/50"
                placeholder="30"
                min="0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Generated code panel */}
      <div className="glass-bright rounded-2xl overflow-hidden flex flex-col">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-text-muted text-xs font-mono">create-{formData.schemaId}.ts</span>
          <CopyButton text={generatedCode} />
        </div>

        {/* Code content */}
        <div className="p-4 overflow-x-auto flex-1">
          <table className="text-sm leading-relaxed w-full">
            <tbody>
              {generatedCode.split("\n").map((line, i) => (
                <tr key={i} className="leading-relaxed">
                  <td className="terminal-line-number pr-4 select-none align-top font-mono text-right w-[2ch]">
                    {i + 1}
                  </td>
                  <td>
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(line),
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hint */}
        <div className="border-t border-border px-4 py-3 bg-white/[0.02]">
          <p className="text-text-muted text-xs flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Code updates in real-time as you modify the form
          </p>
        </div>
      </div>
    </div>
  );
}
