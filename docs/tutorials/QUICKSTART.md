# Quick Start: Your First Agent Identity

> Get an AI agent registered with a verifiable on-chain identity in under 10 minutes.

---

## Prerequisites

```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher

# A wallet with Base Sepolia ETH for gas
# Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```

---

## Step 1: Install the SDK

```bash
npm install @kya/sdk ethers
```

---

## Step 2: Set Up Your Environment

Create a `.env` file:

```env
# Your wallet private key (for signing attestations)
PRIVATE_KEY=0x...

# Base Sepolia RPC URL
RPC_URL=https://sepolia.base.org

# Agent wallet address (the AI agent you're registering)
AGENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e

# Owner address (human/org responsible for the agent)
OWNER_ADDRESS=0x8ba1f109551bD432803012645Ac136ddd64DBA72
```

---

## Step 3: Create Your First Agent Identity

```typescript
// create-identity.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // 1. Set up provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  console.log("Creating identity with signer:", await signer.getAddress());

  // 2. Initialize KYA SDK
  const kya = new KYA({
    network: "base-sepolia",
    signer,
  });

  // 3. Create the agent identity
  console.log("\n📝 Creating agent identity...");

  const identityUID = await kya.createIdentity({
    agentAddress: process.env.AGENT_ADDRESS!,
    ownerAddress: process.env.OWNER_ADDRESS!,
    displayName: "Trading Bot Alpha",
    description: "Autonomous DeFi trading agent for yield optimization",
  });

  console.log("\n✅ Identity created successfully!");
  console.log("   UID:", identityUID);
  console.log("   View on EAS Explorer:");
  console.log(`   https://base-sepolia.easscan.org/attestation/view/${identityUID}`);

  // 4. Verify it worked
  console.log("\n🔍 Verifying identity...");
  const result = await kya.verify(identityUID);

  if (result.valid) {
    console.log("   ✅ Identity is valid and not revoked");
    console.log("   Decoded data:", JSON.stringify(result.decoded, null, 2));
  } else {
    console.log("   ❌ Verification failed:", result.reason);
  }
}

main().catch(console.error);
```

Run it:

```bash
npx ts-node create-identity.ts
```

Expected output:

```
Creating identity with signer: 0x1234...

📝 Creating agent identity...

✅ Identity created successfully!
   UID: 0xabc123...
   View on EAS Explorer:
   https://base-sepolia.easscan.org/attestation/view/0xabc123...

🔍 Verifying identity...
   ✅ Identity is valid and not revoked
   Decoded data: {
     "agentAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
     "ownerAddress": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
     "displayName": "Trading Bot Alpha",
     ...
   }
```

---

## Step 4: Add Capabilities

Now let's grant your agent specific permissions:

```typescript
// add-capability.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const kya = new KYA({ network: "base-sepolia", signer });

  // The identity UID from step 3
  const identityUID = "0xabc123..."; // Replace with your actual UID

  console.log("📋 Adding capability to agent...");

  // Grant TRANSACT + SIGN permissions
  const capabilityUID = await kya.createCapability({
    parentIdentityUID: identityUID,
    permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    trustLevel: 100,
  });

  console.log("\n✅ Capability granted!");
  console.log("   UID:", capabilityUID);
  console.log("   Permissions: TRANSACT, SIGN");
  console.log("   Expires: 30 days from now");
  console.log("   View on EAS Explorer:");
  console.log(`   https://base-sepolia.easscan.org/attestation/view/${capabilityUID}`);
}

main().catch(console.error);
```

---

## Step 5: Verify the Complete Trust Chain

```typescript
// verify-chain.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const kya = new KYA({ network: "base-sepolia", signer });

  const identityUID = "0xabc123...";    // Your identity UID
  const capabilityUID = "0xdef456..."; // Your capability UID

  console.log("🔗 Verifying trust chain...\n");

  // Verify identity
  const identityResult = await kya.verify(identityUID);
  console.log("Identity:");
  console.log("  Valid:", identityResult.valid);
  console.log("  Owner:", identityResult.decoded?.ownerAddress);

  // Verify capability
  const capResult = await kya.verify(capabilityUID);
  console.log("\nCapability:");
  console.log("  Valid:", capResult.valid);
  console.log("  Permissions:", capResult.decoded?.permissions);
  console.log("  Expires:", new Date(Number(capResult.decoded?.expiresAt) * 1000));

  // Check if capability references the identity
  const capAttestation = capResult.attestation;
  if (capAttestation?.refUID === identityUID) {
    console.log("\n✅ Trust chain verified!");
    console.log("   Capability correctly references identity.");
  }
}

main().catch(console.error);
```

---

## Understanding What You Built

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         YOUR AGENT'S TRUST CHAIN                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                                                                             │
    │   👤 Owner: 0x8ba1f109551bD432803012645Ac136ddd64DBA72                       │
    │      │                                                                      │
    │      │  owns (ownerAddress field)                                           │
    │      ▼                                                                      │
    │   ┌─────────────────────────────────────────────────────────────────────┐   │
    │   │   🤖 KYA-Identity                                                   │   │
    │   │      UID: 0xabc123...                                               │   │
    │   │      Agent: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e              │   │
    │   │      Display Name: "Trading Bot Alpha"                              │   │
    │   └─────────────────────────────────┬───────────────────────────────────┘   │
    │                                     │                                       │
    │                                     │  references (refUID)                  │
    │                                     ▼                                       │
    │   ┌─────────────────────────────────────────────────────────────────────┐   │
    │   │   📋 KYA-Capability                                                 │   │
    │   │      UID: 0xdef456...                                               │   │
    │   │      Permissions: TRANSACT | SIGN (value: 3)                        │   │
    │   │      Expires: 30 days                                               │   │
    │   │      Trust Level: 100                                               │   │
    │   └─────────────────────────────────────────────────────────────────────┘   │
    │                                                                             │
    └─────────────────────────────────────────────────────────────────────────────┘

    When a service verifies this agent:
    1. Check KYA-Capability exists and is not revoked/expired
    2. Follow refUID to KYA-Identity
    3. Verify Identity exists and is not revoked
    4. Extract ownerAddress → This is who's accountable
```

---

## Permission Reference

| Permission | Value | Binary | Description |
|------------|-------|--------|-------------|
| `TRANSACT` | 1 | `0b00000001` | Execute financial transactions |
| `SIGN` | 2 | `0b00000010` | Sign messages on behalf |
| `DEPLOY` | 4 | `0b00000100` | Deploy smart contracts |
| `ADMIN` | 8 | `0b00001000` | Administrative operations |
| `READ_PRIVATE` | 16 | `0b00010000` | Access private data |
| `DELEGATE` | 32 | `0b00100000` | Delegate to sub-agents |
| `CROSS_CHAIN` | 64 | `0b01000000` | Cross-chain operations |

**Combining Permissions:**

```typescript
// Single permission
const canTransact = KYA.Permissions.TRANSACT;  // 1

// Multiple permissions (use bitwise OR)
const tradingBot = KYA.Permissions.TRANSACT | KYA.Permissions.SIGN;  // 3

// Full access (be careful!)
const fullAccess =
  KYA.Permissions.TRANSACT |
  KYA.Permissions.SIGN |
  KYA.Permissions.DEPLOY |
  KYA.Permissions.ADMIN |
  KYA.Permissions.DELEGATE;  // 47

// Check if permission exists (use bitwise AND)
const hasTransact = (permissions & KYA.Permissions.TRANSACT) > 0;
```

---

## Common Patterns

### Off-Chain Attestation (Free)

```typescript
// Create identity without paying gas (EIP-712 signature)
const offchainAttestation = await kya.createIdentityOffchain({
  agentAddress: "0x...",
  ownerAddress: "0x...",
  displayName: "My Agent",
});

// The attestation can be stored anywhere and verified later
console.log(offchainAttestation.signature);
console.log(offchainAttestation.data);
```

### Revoking Credentials

```typescript
// Revoke an identity (permanently)
await kya.revokeIdentity(identityUID);

// Revoke a capability
await kya.revokeCapability(capabilityUID);

// Verification will now fail
const result = await kya.verify(identityUID);
console.log(result.valid);  // false
console.log(result.reason); // "Attestation has been revoked"
```

### Adding Provenance

```typescript
// Document your agent's code origin
const provenanceUID = await kya.createProvenance({
  parentIdentityUID: identityUID,
  sourceCodeHash: KYA.hashString("git:abc123def456"),
  modelHash: KYA.hashString("huggingface:model-v1.0"),
  buildHash: KYA.hashString("docker:sha256:xyz789"),
  builderAddress: await signer.getAddress(),
  provenanceType: 1, // 1=source, 2=model, 3=build, 4=audit
});
```

---

## Next Steps

- **[Add Delegation](./DELEGATION.md)** - Allow your agent to authorize sub-agents
- **[Integrate with x402](./X402_INTEGRATION.md)** - Accept payments that require KYA verification
- **[Production Deployment](./PRODUCTION.md)** - Best practices for mainnet
- **[SDK Reference](./SDK_REFERENCE.md)** - Complete API documentation

---

## Troubleshooting

### "Attestation already exists for this agent"

The agent address already has an identity. Each agent can only have one identity.

```typescript
// Check if identity exists
const existingUID = await kya.getIdentityForAgent(agentAddress);
if (existingUID) {
  console.log("Agent already registered:", existingUID);
}
```

### "Insufficient gas"

Get testnet ETH from the [Base Sepolia faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet).

### "Parent identity does not exist"

When creating a capability, ensure the `parentIdentityUID` references a valid, non-revoked identity.

```typescript
// Verify parent exists first
const parentResult = await kya.verify(parentIdentityUID);
if (!parentResult.valid) {
  throw new Error(`Parent identity invalid: ${parentResult.reason}`);
}
```

---

*Quick Start Tutorial v1.0 | KYA Protocol*
