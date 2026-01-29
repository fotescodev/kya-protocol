export const CODE_SNIPPETS = [
  {
    label: "Create Identity",
    filename: "register.ts",
    language: "typescript" as const,
    code: `import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://sepolia.base.org"
);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const kya = new KYA({ network: "base-sepolia", signer });

// Register agent identity (on-chain attestation)
const identityUID = await kya.createIdentity({
  agentAddress: "0xAgent...",
  ownerAddress: "0xHuman...",
  displayName: "TradingBot Alpha",
  description: "Autonomous market-making agent",
});`,
  },
  {
    label: "Grant Capability",
    filename: "capability.ts",
    language: "typescript" as const,
    code: `// Grant capabilities with permission bitmasks
const capUID = await kya.createCapability({
  parentIdentityUID: identityUID,
  permissions:
    KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
  expiresAt:
    Math.floor(Date.now() / 1000) + 86400 * 30,
});

// Available permissions:
// TRANSACT (1) | SIGN (2) | DEPLOY (4)
// ADMIN (8) | READ_PRIVATE (16)
// DELEGATE (32) | CROSS_CHAIN (64)`,
  },
  {
    label: "Verify",
    filename: "verify.ts",
    language: "typescript" as const,
    code: `// Verify any attestation — on-chain or off-chain
const result = await kya.verify(identityUID);

console.log(result.valid);
// true

console.log(result.attestation);
// { uid, attester, recipient, time, ... }

console.log(result.decoded);
// { agentDID, agentAddress, ownerAddress, ... }`,
  },
  {
    label: "CLI Output",
    filename: "terminal",
    language: "terminal" as const,
    code: "",
  },
];

export const CLI_OUTPUT_LINES = [
  { type: "prompt" as const, text: "$ npx @kya/cli register --network base-sepolia" },
  { type: "info" as const, text: "  Connecting to Base Sepolia..." },
  { type: "success" as const, text: "  Connected to EAS at 0x4200...0021" },
  { type: "info" as const, text: "  Creating identity attestation..." },
  { type: "plain" as const, text: "" },
  { type: "success" as const, text: "  Identity registered on-chain" },
  { type: "plain" as const, text: "  UID:      0x7f3a...c91e" },
  { type: "plain" as const, text: "  Agent:    0xAbC1...f429" },
  { type: "plain" as const, text: "  Owner:    0x1234...5678" },
  { type: "dim" as const, text: "  Schema:   KYAIdentitySchema v1" },
  { type: "dim" as const, text: "  Resolver: 0x8B2c...9f01 (133 lines, 8 tests)" },
  { type: "plain" as const, text: "" },
  { type: "prompt" as const, text: "$ npx @kya/cli grant --uid 0x7f3a...c91e --permissions TRANSACT,SIGN" },
  { type: "info" as const, text: "  Granting capabilities..." },
  { type: "success" as const, text: "  Capability granted" },
  { type: "plain" as const, text: "  Permissions: TRANSACT | SIGN (3)" },
  { type: "plain" as const, text: "  Expires:     2025-03-15T00:00:00Z" },
  { type: "plain" as const, text: "" },
  { type: "prompt" as const, text: "$ npx @kya/cli verify 0x7f3a...c91e" },
  { type: "success" as const, text: "  Valid: true" },
  { type: "success" as const, text: "  Trust chain: Human → Agent (depth: 1)" },
];
