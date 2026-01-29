export const SITE = {
  name: "KYA Protocol",
  tagline: "Know Your Agent",
  description:
    "An on-chain identity standard for autonomous AI agents built on the Ethereum Attestation Service",
  url: "https://kyaprotocol.com",
  github: "https://github.com/aspect-build/kya-protocol",
  twitter: "https://x.com/kyaprotocol",
} as const;

export const BUILDER = {
  name: "Daniel Fotescu",
  role: "Builder at the intersection of Web3 and AI",
  portfolio: "https://edgeoftrust.com",
  github: "https://github.com/dfotesco",
  linkedin: "https://linkedin.com/in/dfotesco",
  twitter: "https://x.com/dfotesco",
  email: "daniel@edgeoftrust.com",
} as const;

export const STATS = [
  { value: 24, suffix: "M+", prefix: "$", label: "Transacted via x402" },
  { value: 3.5, suffix: "M+", prefix: "", label: "Agent transactions (Olas)" },
  { value: 75, suffix: "%", prefix: "", label: "Safe txns on Gnosis by agents" },
] as const;

export const SCHEMAS = [
  {
    name: "Identity",
    question: "Who is this agent?",
    description: "Agent passport — one per agent address, linking to a human owner. The foundational schema that everything else builds on.",
    color: "electric",
    fields: ["agentDID", "agentAddress", "ownerAddress", "displayNameHash", "descriptionHash", "createdAt", "version", "metadataURI"],
    useCases: [
      "DeFi trading bot proving it belongs to a licensed fund",
      "Customer service agent verified by a real company",
      "Content moderation bot traceable to its operator",
    ],
  },
  {
    name: "Capability",
    question: "What can it do?",
    description: "Permission grants with bitmasks, target contracts, and expiration. Fine-grained access control for agent actions.",
    color: "cyan-accent",
    fields: ["capabilityId", "permissions", "targetContract", "grantedAt", "expiresAt", "conditionsHash", "trustLevel"],
    useCases: [
      "Limit a trading bot to TRANSACT-only, no DEPLOY or ADMIN",
      "Time-bound permissions that expire after 30 days",
      "Restrict an agent to interact with specific contracts only",
    ],
  },
  {
    name: "Provenance",
    question: "Where did it come from?",
    description: "Code lineage — source hashes, model hashes, audit reports. Verifiable build provenance for every agent.",
    color: "green-accent",
    fields: ["sourceCodeHash", "modelHash", "buildHash", "builderAddress", "auditReportHash", "buildTimestamp", "previousVersionUID", "provenanceType"],
    useCases: [
      "Prove an agent runs audited, unmodified code",
      "Track which GPT-4 version a financial advisor agent uses",
      "Verify the build pipeline hasn't been tampered with",
    ],
  },
  {
    name: "Delegation",
    question: "Who authorized it?",
    description: "Authorization chains between agents with scoped constraints. How agents grant sub-agents limited power.",
    color: "purple-accent",
    fields: ["delegator", "delegatee", "scope", "constraints", "delegatedAt", "expiresAt", "depth"],
    useCases: [
      "A portfolio agent delegating trade execution to sub-agents",
      "Multi-sig requiring 3-of-5 agent approvals for large transfers",
      "Supply chain agent authorizing logistics sub-agents per region",
    ],
  },
] as const;

export const PERMISSIONS = [
  { name: "TRANSACT", bit: 0, value: 1 },
  { name: "SIGN", bit: 1, value: 2 },
  { name: "DEPLOY", bit: 2, value: 4 },
  { name: "ADMIN", bit: 3, value: 8 },
  { name: "READ_PRIVATE", bit: 4, value: 16 },
  { name: "DELEGATE", bit: 5, value: 32 },
  { name: "CROSS_CHAIN", bit: 6, value: 64 },
] as const;

export const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Schemas", href: "#schemas" },
  { label: "Demo", href: "/demo" },
  { label: "Developers", href: "#code-example" },
  { label: "About", href: "#builder" },
] as const;
