# KYA Protocol Examples

Practical code examples for common KYA integration patterns.

## Examples Index

| Example | Description | Complexity |
|---------|-------------|------------|
| [Basic Identity](#basic-identity) | Create and verify an agent identity | Beginner |
| [Capability Management](#capability-management) | Grant, check, and revoke capabilities | Beginner |
| [Delegation Chain](#delegation-chain) | Create a 3-level delegation hierarchy | Intermediate |
| [x402 Server](#x402-server) | KYA-protected paid API endpoint | Intermediate |
| [Batch Operations](#batch-operations) | Create multiple attestations efficiently | Advanced |
| [Off-Chain Attestations](#off-chain-attestations) | Free attestations with EIP-712 signing | Advanced |

---

## Basic Identity

Create and verify an agent identity in the simplest way.

```typescript
// examples/basic-identity.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

async function main() {
  // Setup
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const kya = new KYA({ network: "base-sepolia", signer });

  // Create identity
  const identityUID = await kya.createIdentity({
    agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    ownerAddress: await signer.getAddress(), // You are the owner
    displayName: "My First Agent",
    description: "A simple test agent",
  });

  console.log("Created identity:", identityUID);

  // Verify it
  const result = await kya.verify(identityUID);
  console.log("Valid:", result.valid);
  console.log("Agent:", result.decoded?.agentAddress);
  console.log("Owner:", result.decoded?.ownerAddress);
}

main().catch(console.error);
```

**Run it:**
```bash
PRIVATE_KEY=0x... npx ts-node examples/basic-identity.ts
```

---

## Capability Management

Grant specific permissions to your agent.

```typescript
// examples/capability-management.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const kya = new KYA({ network: "base-sepolia", signer });

  const identityUID = process.env.IDENTITY_UID!;

  // ─────────────────────────────────────────────────────────────
  // Grant a capability
  // ─────────────────────────────────────────────────────────────

  const capabilityUID = await kya.createCapability({
    parentIdentityUID: identityUID,

    // Combine permissions with bitwise OR
    permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,

    // Optional: scope to specific contract (0x0 = global)
    targetContract: "0x0000000000000000000000000000000000000000",

    // Expires in 7 days
    expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,

    // Trust level (0-255)
    trustLevel: 100,
  });

  console.log("Capability UID:", capabilityUID);

  // ─────────────────────────────────────────────────────────────
  // Check permissions
  // ─────────────────────────────────────────────────────────────

  const result = await kya.verify(capabilityUID);

  if (result.valid && result.decoded) {
    const permissions = BigInt(result.decoded.permissions as string);

    const hasTransact = (permissions & KYA.Permissions.TRANSACT) > 0n;
    const hasSign = (permissions & KYA.Permissions.SIGN) > 0n;
    const hasDeploy = (permissions & KYA.Permissions.DEPLOY) > 0n;

    console.log("Can TRANSACT:", hasTransact); // true
    console.log("Can SIGN:", hasSign);         // true
    console.log("Can DEPLOY:", hasDeploy);     // false
  }

  // ─────────────────────────────────────────────────────────────
  // Revoke when done
  // ─────────────────────────────────────────────────────────────

  // Uncomment to revoke:
  // await kya.revokeCapability(capabilityUID);
  // console.log("Capability revoked");
}

main().catch(console.error);
```

**Permission combinations:**
```typescript
// Read-only agent
const readOnly = KYA.Permissions.SIGN; // 2

// Trading bot
const tradingBot = KYA.Permissions.TRANSACT | KYA.Permissions.SIGN; // 3

// Deployment agent
const deployer = KYA.Permissions.DEPLOY | KYA.Permissions.ADMIN; // 12

// Full access (be careful!)
const fullAccess =
  KYA.Permissions.TRANSACT |
  KYA.Permissions.SIGN |
  KYA.Permissions.DEPLOY |
  KYA.Permissions.ADMIN |
  KYA.Permissions.READ_PRIVATE |
  KYA.Permissions.DELEGATE |
  KYA.Permissions.CROSS_CHAIN; // 127
```

---

## Delegation Chain

Create a hierarchy where a human delegates to Agent A, who delegates to Agent B.

```typescript
// examples/delegation-chain.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

  // Human owner wallet
  const human = new ethers.Wallet(process.env.HUMAN_PRIVATE_KEY!, provider);
  // Agent A wallet
  const agentA = new ethers.Wallet(process.env.AGENT_A_PRIVATE_KEY!, provider);
  // Agent B wallet
  const agentB = new ethers.Wallet(process.env.AGENT_B_PRIVATE_KEY!, provider);

  const kyaHuman = new KYA({ network: "base-sepolia", signer: human });
  const kyaAgentA = new KYA({ network: "base-sepolia", signer: agentA });

  // ─────────────────────────────────────────────────────────────
  // Step 1: Human creates identity for Agent A
  // ─────────────────────────────────────────────────────────────

  console.log("Creating Agent A identity...");
  const agentAIdentity = await kyaHuman.createIdentity({
    agentAddress: agentA.address,
    ownerAddress: human.address,
    displayName: "Portfolio Manager",
    description: "Primary agent managing the portfolio",
  });
  console.log("Agent A Identity:", agentAIdentity);

  // ─────────────────────────────────────────────────────────────
  // Step 2: Human grants DELEGATE capability to Agent A
  // ─────────────────────────────────────────────────────────────

  console.log("\nGranting DELEGATE capability to Agent A...");
  const agentACapability = await kyaHuman.createCapability({
    parentIdentityUID: agentAIdentity,
    permissions:
      KYA.Permissions.TRANSACT |
      KYA.Permissions.SIGN |
      KYA.Permissions.DELEGATE, // Can create sub-agents!
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    trustLevel: 100,
  });
  console.log("Agent A Capability:", agentACapability);

  // ─────────────────────────────────────────────────────────────
  // Step 3: Human delegates to Agent A (depth 0 → 1)
  // ─────────────────────────────────────────────────────────────

  console.log("\nHuman delegating to Agent A...");
  const delegationToA = await kyaHuman.createDelegation({
    delegator: human.address,
    delegatee: agentA.address,
    scope: KYA.hashString("trading:all"), // Scope of delegation
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    depth: 0, // Human is depth 0
  });
  console.log("Delegation to A:", delegationToA);

  // ─────────────────────────────────────────────────────────────
  // Step 4: Agent A creates identity for Agent B
  // ─────────────────────────────────────────────────────────────

  console.log("\nAgent A creating identity for Agent B...");
  const agentBIdentity = await kyaAgentA.createIdentity({
    agentAddress: agentB.address,
    ownerAddress: human.address, // Owner is still the human!
    displayName: "Trading Executor",
    description: "Sub-agent for executing trades",
  });
  console.log("Agent B Identity:", agentBIdentity);

  // ─────────────────────────────────────────────────────────────
  // Step 5: Agent A delegates to Agent B (depth 1 → 2)
  // ─────────────────────────────────────────────────────────────

  console.log("\nAgent A delegating to Agent B...");
  const delegationToB = await kyaAgentA.createDelegation({
    delegator: agentA.address,
    delegatee: agentB.address,
    scope: KYA.hashString("trading:execute"), // Narrower scope
    expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // Shorter duration
    depth: 1, // Agent A is depth 1, B will be depth 2
  });
  console.log("Delegation to B:", delegationToB);

  // ─────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────

  console.log("\n" + "═".repeat(60));
  console.log("DELEGATION CHAIN CREATED");
  console.log("═".repeat(60));
  console.log(`
    👤 Human: ${human.address}
         │
         │ delegates (depth 0)
         ▼
    🤖 Agent A: ${agentA.address}
       Identity: ${agentAIdentity}
       Capability: ${agentACapability}
       Delegation: ${delegationToA}
         │
         │ delegates (depth 1)
         ▼
    🤖 Agent B: ${agentB.address}
       Identity: ${agentBIdentity}
       Delegation: ${delegationToB}
  `);
}

main().catch(console.error);
```

**Important constraints:**
- Maximum delegation depth is **3** (configurable)
- An agent needs the **DELEGATE** permission to create sub-delegations
- Sub-delegations should have equal or narrower scope
- Sub-delegations should have equal or shorter duration

---

## x402 Server

A complete KYA-protected paid API server.

```typescript
// examples/x402-server.ts
import { createServer } from "http";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";
const ZERO_BYTES32 = "0x" + "0".repeat(64);
const PRICE_USDC = "0.001";
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS!;

// EAS ABI (simplified)
const EAS_ABI = [
  {
    inputs: [{ name: "uid", type: "bytes32" }],
    name: "getAttestation",
    outputs: [
      {
        components: [
          { name: "uid", type: "bytes32" },
          { name: "revocationTime", type: "uint64" },
          { name: "expirationTime", type: "uint64" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

async function verifyKYA(identityUID: string): Promise<boolean> {
  if (!identityUID) return false;

  try {
    const attestation = (await client.readContract({
      address: EAS_ADDRESS,
      abi: EAS_ABI,
      functionName: "getAttestation",
      args: [identityUID as `0x${string}`],
    })) as { uid: string; revocationTime: bigint; expirationTime: bigint };

    if (attestation.uid === ZERO_BYTES32) return false;
    if (attestation.revocationTime !== 0n) return false;

    const now = BigInt(Math.floor(Date.now() / 1000));
    if (attestation.expirationTime !== 0n && attestation.expirationTime < now) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const identityUID = req.headers["x-kya-identity"] as string;
  const payment = req.headers["x-payment"] as string;

  // Step 1: Verify KYA
  const kyaValid = await verifyKYA(identityUID);
  if (!kyaValid) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid KYA identity" }));
    return;
  }

  // Step 2: Check for payment
  if (!payment) {
    res.writeHead(402, {
      "Content-Type": "application/json",
      "X-Payment-Requirements": JSON.stringify({
        price: PRICE_USDC,
        currency: "USDC",
        network: "base-sepolia",
        payTo: PAYMENT_ADDRESS,
      }),
    });
    res.end(JSON.stringify({ error: "Payment required" }));
    return;
  }

  // Step 3: Verify payment (simplified - use x402 SDK in production)
  // const paymentValid = await verifyX402Payment(payment);

  // Step 4: Return data
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Hello, verified agent!",
      kyaIdentity: identityUID,
      timestamp: new Date().toISOString(),
    })
  );
});

server.listen(3000, () => {
  console.log("KYA + x402 server running on http://localhost:3000");
});
```

---

## Batch Operations

Create multiple attestations in a single transaction (gas efficient).

```typescript
// examples/batch-operations.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // Direct EAS access for batch operations
  const eas = new EAS("0x4200000000000000000000000000000000000021");
  eas.connect(signer);

  const identityUID = process.env.IDENTITY_UID!;

  // ─────────────────────────────────────────────────────────────
  // Batch create multiple capabilities
  // ─────────────────────────────────────────────────────────────

  const schemaEncoder = new SchemaEncoder(
    "bytes32 capabilityId,uint256 permissions,address targetContract,uint64 grantedAt,uint64 expiresAt,bytes32 conditionsHash,uint8 trustLevel"
  );

  const capabilities = [
    {
      id: KYA.hashString("cap:trading"),
      permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
    },
    {
      id: KYA.hashString("cap:readonly"),
      permissions: KYA.Permissions.SIGN,
    },
    {
      id: KYA.hashString("cap:admin"),
      permissions: KYA.Permissions.ADMIN,
    },
  ];

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 30 * 24 * 60 * 60;

  const attestationRequests = capabilities.map((cap) => ({
    schema: process.env.CAPABILITY_SCHEMA_UID!,
    data: {
      recipient: process.env.AGENT_ADDRESS!,
      expirationTime: BigInt(expiresAt),
      revocable: true,
      refUID: identityUID,
      data: schemaEncoder.encodeData([
        { name: "capabilityId", value: cap.id, type: "bytes32" },
        { name: "permissions", value: cap.permissions, type: "uint256" },
        {
          name: "targetContract",
          value: "0x0000000000000000000000000000000000000000",
          type: "address",
        },
        { name: "grantedAt", value: BigInt(now), type: "uint64" },
        { name: "expiresAt", value: BigInt(expiresAt), type: "uint64" },
        {
          name: "conditionsHash",
          value: "0x" + "0".repeat(64),
          type: "bytes32",
        },
        { name: "trustLevel", value: 100, type: "uint8" },
      ]),
    },
  }));

  console.log(`Creating ${attestationRequests.length} capabilities in one transaction...`);

  const tx = await eas.multiAttest(attestationRequests);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
  console.log("Gas used:", receipt.gasUsed?.toString());

  // Extract UIDs from events
  // (In production, parse the Attested events from the receipt)
}

main().catch(console.error);
```

---

## Off-Chain Attestations

Create free attestations using EIP-712 signatures.

```typescript
// examples/offchain-attestations.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const kya = new KYA({ network: "base-sepolia", signer });

  // ─────────────────────────────────────────────────────────────
  // Create off-chain identity (FREE - no gas!)
  // ─────────────────────────────────────────────────────────────

  const offchainIdentity = await kya.createIdentityOffchain({
    agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    ownerAddress: await signer.getAddress(),
    displayName: "Off-chain Agent",
    description: "This identity was created for free",
  });

  console.log("Off-chain Identity Created!");
  console.log("Signature:", offchainIdentity.signature);
  console.log("Data:", JSON.stringify(offchainIdentity.data, null, 2));

  // ─────────────────────────────────────────────────────────────
  // Store it anywhere
  // ─────────────────────────────────────────────────────────────

  // Store in IPFS
  // const ipfsHash = await uploadToIPFS(offchainIdentity);

  // Store in database
  // await db.attestations.create({ data: offchainIdentity });

  // Return to client
  // res.json(offchainIdentity);

  // ─────────────────────────────────────────────────────────────
  // Verify off-chain attestation
  // ─────────────────────────────────────────────────────────────

  // Verification is done by checking the EIP-712 signature
  // matches the attester's address and the data wasn't tampered

  const isValid = await verifyOffchainAttestation(
    offchainIdentity,
    await signer.getAddress()
  );
  console.log("Off-chain attestation valid:", isValid);

  // ─────────────────────────────────────────────────────────────
  // Optionally anchor on-chain later
  // ─────────────────────────────────────────────────────────────

  // You can timestamp it on-chain for non-repudiation:
  // await eas.timestamp(offchainIdentity.uid);

  // Or revoke it on-chain:
  // await eas.revokeOffchain(offchainIdentity.uid);
}

async function verifyOffchainAttestation(
  attestation: any,
  expectedAttester: string
): Promise<boolean> {
  // Reconstruct the EIP-712 typed data and verify signature
  // In production, use the EAS SDK's built-in verification

  const recovered = ethers.verifyTypedData(
    attestation.domain,
    attestation.types,
    attestation.message,
    attestation.signature
  );

  return recovered.toLowerCase() === expectedAttester.toLowerCase();
}

main().catch(console.error);
```

**When to use off-chain vs on-chain:**

| Use Case | Recommendation |
|----------|----------------|
| Core agent identity | On-chain |
| Primary capabilities | On-chain |
| Session tokens | Off-chain |
| Behavioral data | Off-chain |
| High-frequency updates | Off-chain |
| Smart contract checks | On-chain |
| Revocation registry | On-chain |

---

## Running the Examples

```bash
# Clone the repo
git clone https://github.com/your-org/kya-protocol
cd kya-protocol

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your keys

# Run an example
npx ts-node docs/examples/basic-identity.ts
```

---

*Examples v1.0 | KYA Protocol*
