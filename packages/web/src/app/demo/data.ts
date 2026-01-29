export const DEMO_SCHEMAS = [
  {
    id: "identity",
    name: "Identity",
    question: "Who is this agent?",
    description:
      "Agent passport — one per agent address, linking to a human owner. The foundational schema that everything else builds on.",
    color: "electric",
    fields: [
      {
        name: "agentDID",
        type: "string",
        description: "Decentralized identifier for the agent",
        example: "did:ethr:0x1234...abcd",
      },
      {
        name: "agentAddress",
        type: "address",
        description: "Ethereum address of the agent",
        example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      },
      {
        name: "ownerAddress",
        type: "address",
        description: "Ethereum address of the human owner",
        example: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      },
      {
        name: "displayNameHash",
        type: "bytes32",
        description: "Keccak256 hash of agent display name",
        example: "0xa1b2c3d4...",
      },
      {
        name: "descriptionHash",
        type: "bytes32",
        description: "Keccak256 hash of agent description",
        example: "0xe5f6g7h8...",
      },
      {
        name: "createdAt",
        type: "uint256",
        description: "Unix timestamp of identity creation",
        example: "1704067200",
      },
      {
        name: "version",
        type: "uint8",
        description: "Schema version number",
        example: "1",
      },
      {
        name: "metadataURI",
        type: "string",
        description: "IPFS or HTTP URI for additional metadata",
        example: "ipfs://Qm...",
      },
    ],
    codeExample: `import { KYA } from "@kya/sdk";

const kya = new KYA({ provider });

// Create an identity attestation
const identity = await kya.identity.create({
  agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  ownerAddress: signer.address,
  displayName: "Trading Bot Alpha",
  description: "Automated DeFi trading agent",
  metadataURI: "ipfs://Qm..."
});

console.log("Identity UID:", identity.uid);`,
  },
  {
    id: "capability",
    name: "Capability",
    question: "What can it do?",
    description:
      "Permission grants with bitmasks, target contracts, and expiration. Fine-grained access control for agent actions.",
    color: "cyan-accent",
    fields: [
      {
        name: "capabilityId",
        type: "bytes32",
        description: "Unique identifier for this capability grant",
        example: "0x1234567890abcdef...",
      },
      {
        name: "permissions",
        type: "uint256",
        description: "Bitmask of granted permissions (TRANSACT=1, SIGN=2, DEPLOY=4, ADMIN=8)",
        example: "3 (TRANSACT | SIGN)",
      },
      {
        name: "targetContract",
        type: "address",
        description: "Contract this capability applies to (or 0x0 for any)",
        example: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
      {
        name: "grantedAt",
        type: "uint256",
        description: "Unix timestamp when capability was granted",
        example: "1704067200",
      },
      {
        name: "expiresAt",
        type: "uint256",
        description: "Unix timestamp when capability expires (0 for never)",
        example: "1735689600",
      },
      {
        name: "conditionsHash",
        type: "bytes32",
        description: "Hash of additional conditions (e.g., spending limits)",
        example: "0x...",
      },
      {
        name: "trustLevel",
        type: "uint8",
        description: "Trust tier (0-255, higher = more trusted)",
        example: "100",
      },
    ],
    codeExample: `import { KYA, Permission } from "@kya/sdk";

const kya = new KYA({ provider });

// Grant capabilities to an agent
const capability = await kya.capability.grant({
  agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  permissions: Permission.TRANSACT | Permission.SIGN,
  targetContract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  trustLevel: 100
});

console.log("Capability UID:", capability.uid);`,
  },
  {
    id: "provenance",
    name: "Provenance",
    question: "Where did it come from?",
    description:
      "Code lineage — source hashes, model hashes, audit reports. Verifiable build provenance for every agent.",
    color: "green-accent",
    fields: [
      {
        name: "sourceCodeHash",
        type: "bytes32",
        description: "Hash of the agent's source code repository",
        example: "0xabc123...",
      },
      {
        name: "modelHash",
        type: "bytes32",
        description: "Hash of the AI model used (if applicable)",
        example: "0xdef456...",
      },
      {
        name: "buildHash",
        type: "bytes32",
        description: "Hash of the compiled/deployed artifact",
        example: "0x789ghi...",
      },
      {
        name: "builderAddress",
        type: "address",
        description: "Address of the entity that built/deployed",
        example: "0x...",
      },
      {
        name: "auditReportHash",
        type: "bytes32",
        description: "Hash of security audit report (if audited)",
        example: "0x...",
      },
      {
        name: "buildTimestamp",
        type: "uint256",
        description: "Unix timestamp of the build",
        example: "1704067200",
      },
      {
        name: "previousVersionUID",
        type: "bytes32",
        description: "UID of previous version attestation (for upgrades)",
        example: "0x...",
      },
      {
        name: "provenanceType",
        type: "uint8",
        description: "Type: 0=source, 1=binary, 2=model, 3=hybrid",
        example: "3",
      },
    ],
    codeExample: `import { KYA, ProvenanceType } from "@kya/sdk";

const kya = new KYA({ provider });

// Attest agent provenance
const provenance = await kya.provenance.attest({
  agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  sourceCodeHash: "0xabc123...",
  modelHash: "0xdef456...", // GPT-4 model hash
  buildHash: "0x789ghi...",
  auditReportHash: "0x...", // Trail of Bits audit
  provenanceType: ProvenanceType.HYBRID
});

console.log("Provenance UID:", provenance.uid);`,
  },
  {
    id: "delegation",
    name: "Delegation",
    question: "Who authorized it?",
    description:
      "Authorization chains between agents with scoped constraints. How agents grant sub-agents limited power.",
    color: "purple-accent",
    fields: [
      {
        name: "delegator",
        type: "address",
        description: "Address of the delegating agent/owner",
        example: "0x...",
      },
      {
        name: "delegatee",
        type: "address",
        description: "Address of the agent receiving delegation",
        example: "0x...",
      },
      {
        name: "scope",
        type: "bytes32",
        description: "Hash defining the scope of delegation",
        example: "0x...",
      },
      {
        name: "constraints",
        type: "bytes",
        description: "Encoded constraints (spending limits, time windows, etc.)",
        example: "0x...",
      },
      {
        name: "delegatedAt",
        type: "uint256",
        description: "Unix timestamp of delegation",
        example: "1704067200",
      },
      {
        name: "expiresAt",
        type: "uint256",
        description: "Unix timestamp when delegation expires",
        example: "1735689600",
      },
      {
        name: "depth",
        type: "uint8",
        description: "Delegation depth (0 = direct from owner)",
        example: "1",
      },
    ],
    codeExample: `import { KYA } from "@kya/sdk";

const kya = new KYA({ provider });

// Delegate authority to a sub-agent
const delegation = await kya.delegation.create({
  delegator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  delegatee: "0x9876543210fedcba...",
  scope: "trading:execute",
  constraints: {
    maxTransactionValue: "1000000000000000000", // 1 ETH
    allowedPairs: ["ETH/USDC", "ETH/DAI"]
  },
  expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
});

console.log("Delegation UID:", delegation.uid);`,
  },
] as const;

export const USE_CASES = [
  {
    id: "ecommerce",
    title: "E-Commerce Agent",
    industry: "Retail",
    description:
      "An AI shopping assistant that can browse products, compare prices, and complete purchases on behalf of users.",
    icon: "shopping-cart",
    scenario: `A user wants to buy a laptop. The AI agent:
1. Searches multiple retailers for the best price
2. Verifies product authenticity
3. Applies discount codes
4. Completes checkout with stored payment info`,
    attestations: [
      {
        schema: "Identity",
        purpose: "Links agent to e-commerce platform",
        data: { displayName: "ShopBot Pro", owner: "RetailCorp Inc." },
      },
      {
        schema: "Capability",
        purpose: "Limited to TRANSACT, max $500/day",
        data: { permissions: "TRANSACT", limit: "$500/day" },
      },
      {
        schema: "Provenance",
        purpose: "Audited codebase, GPT-4 model",
        data: { audit: "CertiK", model: "gpt-4-turbo" },
      },
    ],
    code: `// Verify agent before allowing purchase
const agent = await kya.resolve("0x742d...");

if (!agent.hasCapability(Permission.TRANSACT)) {
  throw new Error("Agent not authorized to transact");
}

if (agent.capability.dailyLimit < orderTotal) {
  throw new Error("Order exceeds agent's daily limit");
}

// Proceed with purchase
await processOrder(agent, cart);`,
  },
  {
    id: "enterprise",
    title: "Enterprise Procurement",
    industry: "B2B",
    description:
      "Autonomous procurement agents that negotiate contracts, manage vendor relationships, and process purchase orders.",
    icon: "briefcase",
    scenario: `A procurement agent handling office supplies:
1. Monitors inventory levels across locations
2. Solicits quotes from approved vendors
3. Negotiates terms within policy bounds
4. Issues POs with proper approvals`,
    attestations: [
      {
        schema: "Identity",
        purpose: "Corporate procurement bot",
        data: { displayName: "ProcureAI", owner: "Acme Corp" },
      },
      {
        schema: "Delegation",
        purpose: "Delegated from CFO with constraints",
        data: { delegator: "CFO Wallet", scope: "procurement:execute" },
      },
      {
        schema: "Capability",
        purpose: "TRANSACT + SIGN for approved vendors",
        data: { permissions: "TRANSACT | SIGN", targets: "Approved Vendors" },
      },
    ],
    code: `// Multi-level approval for large orders
const delegation = await kya.delegation.verify(
  agent.address,
  "procurement:execute"
);

if (orderTotal > delegation.constraints.maxValue) {
  // Escalate to human approver
  await requestHumanApproval(order, delegation.delegator);
  return;
}

// Agent can proceed autonomously
await submitPurchaseOrder(order);`,
  },
  {
    id: "defi",
    title: "DeFi Trading Agent",
    industry: "Finance",
    description:
      "Algorithmic trading agents that execute strategies across DeFi protocols with verifiable constraints.",
    icon: "trending-up",
    scenario: `A yield optimization agent:
1. Monitors APY across lending protocols
2. Rebalances positions for optimal yield
3. Manages risk within defined parameters
4. Reports all actions on-chain`,
    attestations: [
      {
        schema: "Identity",
        purpose: "Links to licensed fund manager",
        data: { displayName: "YieldMax Bot", owner: "Alpha Fund LLC" },
      },
      {
        schema: "Capability",
        purpose: "TRANSACT only, specific DeFi contracts",
        data: { permissions: "TRANSACT", targets: "Aave, Compound, Uniswap" },
      },
      {
        schema: "Provenance",
        purpose: "Audited strategy, versioned model",
        data: { audit: "Trail of Bits", version: "2.1.0" },
      },
      {
        schema: "Delegation",
        purpose: "From fund to sub-agents per strategy",
        data: { depth: 1, scope: "strategy:yield-farming" },
      },
    ],
    code: `// DeFi protocol verifies agent before interaction
const verifier = new KYAVerifier(EAS_ADDRESS);

const result = await verifier.verifyAgent(agentAddress, {
  requiredSchemas: ["identity", "capability", "provenance"],
  requiredCapabilities: [Permission.TRANSACT],
  allowedContracts: [AAVE_POOL, COMPOUND_COMET]
});

if (!result.valid) {
  revert("Agent verification failed: " + result.reason);
}

// Agent is verified, allow interaction
_executeStrategy(agentAddress, params);`,
  },
] as const;

export const VERIFICATION_STEPS = [
  {
    step: 1,
    title: "Receive Agent Request",
    description: "A smart contract or dApp receives a transaction from an agent address",
    icon: "inbox",
    duration: 500,
  },
  {
    step: 2,
    title: "Query EAS Registry",
    description: "Look up attestations for the agent address on the Ethereum Attestation Service",
    icon: "search",
    duration: 800,
  },
  {
    step: 3,
    title: "Verify Identity",
    description: "Confirm the agent has a valid Identity attestation linking to a human owner",
    icon: "user-check",
    duration: 600,
  },
  {
    step: 4,
    title: "Check Capabilities",
    description: "Validate the agent has the required permissions for this action",
    icon: "shield-check",
    duration: 700,
  },
  {
    step: 5,
    title: "Validate Provenance",
    description: "Optionally verify the agent's code provenance and audit status",
    icon: "file-check",
    duration: 500,
  },
  {
    step: 6,
    title: "Allow or Reject",
    description: "Based on verification results, proceed with or reject the transaction",
    icon: "check-circle",
    duration: 400,
  },
] as const;

export const TRUST_PROFILE_NODES = [
  { id: "agent", label: "Agent", type: "center" },
  { id: "identity", label: "Identity", type: "schema", color: "electric" },
  { id: "capability", label: "Capability", type: "schema", color: "cyan-accent" },
  { id: "provenance", label: "Provenance", type: "schema", color: "green-accent" },
  { id: "delegation", label: "Delegation", type: "schema", color: "purple-accent" },
] as const;

export const DEMO_TABS = [
  { id: "schemas", label: "Schemas", icon: "layers" },
  { id: "use-cases", label: "Use Cases", icon: "briefcase" },
  { id: "attestation", label: "Create Attestation", icon: "plus-circle" },
  { id: "verify", label: "Verify Agent", icon: "shield" },
  { id: "trust-profile", label: "Trust Profile", icon: "network" },
] as const;
