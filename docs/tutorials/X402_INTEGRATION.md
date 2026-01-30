# Tutorial: Integrating KYA with x402 Payments

> Build a paid API endpoint that requires KYA verification before accepting agent payments.

---

## Overview

x402 is Coinbase's HTTP payment protocol for AI agent micropayments. By integrating KYA, your API can:

1. **Know WHO is paying** - Verified agent identity, not just a wallet address
2. **Know WHAT they can do** - Required capabilities before processing
3. **Know WHO is accountable** - Human/org responsible for the agent

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                    x402 ALONE              x402 + KYA                           │
│                    ══════════              ══════════                           │
│                                                                                 │
│   Agent Identity:  Wallet address only     Verified identity + owner chain      │
│   Capabilities:    None                    Permission bitmask + conditions      │
│   Accountability:  Unknown                 Traceable to human/org               │
│   Risk Assessment: Impossible              Trust levels + behavioral data       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Completed [Quick Start](./QUICKSTART.md) - Agent has KYA identity + capability
- Node.js 18+
- Base Sepolia testnet ETH

Install dependencies:

```bash
npm install @anthropic-ai/sdk @coinbase/x402 @kya/sdk ethers next
```

---

## Step 1: Create the API Route

```typescript
// app/api/data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@coinbase/x402/server";
import { createPublicClient, http, getAddress } from "viem";
import { baseSepolia } from "viem/chains";

// EAS ABI for getAttestation
const EAS_ABI = [
  {
    inputs: [{ name: "uid", type: "bytes32" }],
    name: "getAttestation",
    outputs: [
      {
        components: [
          { name: "uid", type: "bytes32" },
          { name: "schema", type: "bytes32" },
          { name: "time", type: "uint64" },
          { name: "expirationTime", type: "uint64" },
          { name: "revocationTime", type: "uint64" },
          { name: "refUID", type: "bytes32" },
          { name: "recipient", type: "address" },
          { name: "attester", type: "address" },
          { name: "revocable", type: "bool" },
          { name: "data", type: "bytes" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";
const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

// KYA verification function
async function verifyKYA(request: NextRequest): Promise<{
  valid: boolean;
  reason?: string;
  details?: {
    identity?: { uid: string; verified: boolean; revoked: boolean };
    capability?: { uid: string; verified: boolean; revoked: boolean };
  };
}> {
  const identityUID = request.headers.get("X-KYA-Identity");
  const capabilityUID = request.headers.get("X-KYA-Capability");

  if (!identityUID) {
    return { valid: false, reason: "Missing X-KYA-Identity header" };
  }

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  try {
    // Verify identity attestation
    const identityAttestation = await client.readContract({
      address: EAS_ADDRESS,
      abi: EAS_ABI,
      functionName: "getAttestation",
      args: [identityUID as `0x${string}`],
    });

    const identity = identityAttestation as {
      uid: string;
      revocationTime: bigint;
      expirationTime: bigint;
    };

    if (identity.uid === ZERO_BYTES32) {
      return { valid: false, reason: "Identity attestation not found" };
    }

    if (identity.revocationTime !== 0n) {
      return {
        valid: false,
        reason: "Identity has been revoked",
        details: {
          identity: { uid: identityUID, verified: true, revoked: true },
        },
      };
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    if (identity.expirationTime !== 0n && identity.expirationTime < now) {
      return { valid: false, reason: "Identity has expired" };
    }

    // Optionally verify capability
    let capabilityDetails;
    if (capabilityUID) {
      const capAttestation = await client.readContract({
        address: EAS_ADDRESS,
        abi: EAS_ABI,
        functionName: "getAttestation",
        args: [capabilityUID as `0x${string}`],
      });

      const capability = capAttestation as {
        uid: string;
        revocationTime: bigint;
        expirationTime: bigint;
        refUID: string;
      };

      if (capability.uid !== ZERO_BYTES32) {
        // Verify capability references the identity
        if (capability.refUID !== identityUID) {
          return {
            valid: false,
            reason: "Capability does not reference the provided identity",
          };
        }

        if (capability.revocationTime !== 0n) {
          return { valid: false, reason: "Capability has been revoked" };
        }

        if (capability.expirationTime !== 0n && capability.expirationTime < now) {
          return { valid: false, reason: "Capability has expired" };
        }

        capabilityDetails = {
          uid: capabilityUID,
          verified: true,
          revoked: false,
        };
      }
    }

    return {
      valid: true,
      details: {
        identity: { uid: identityUID, verified: true, revoked: false },
        capability: capabilityDetails,
      },
    };
  } catch (error) {
    console.error("KYA verification error:", error);
    return { valid: false, reason: "Failed to verify KYA attestations" };
  }
}

// Your actual handler
async function handler(request: NextRequest) {
  // Step 1: Verify KYA before processing
  const kyaResult = await verifyKYA(request);

  if (!kyaResult.valid) {
    return NextResponse.json(
      {
        error: "KYA verification failed",
        reason: kyaResult.reason,
      },
      { status: 403 }
    );
  }

  // Step 2: KYA verified - process the request
  const data = {
    message: "Hello, verified agent!",
    timestamp: new Date().toISOString(),
    kyaVerified: true,
    verificationDetails: kyaResult.details,
  };

  return NextResponse.json(data);
}

// Wrap with x402 middleware
export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001", // Price per request
        network: "eip155:84532", // Base Sepolia
        payTo: process.env.PAYMENT_ADDRESS!, // Your payment address
      },
    ],
    description: "KYA-verified data API with x402 payment",
  },
  // x402 facilitator server
  { url: "https://x402.org/facilitator" }
);
```

---

## Step 2: Configure Environment

```env
# .env.local
PAYMENT_ADDRESS=0xYourPaymentAddress
```

---

## Step 3: Agent Client Implementation

Now build the agent that calls your API:

```typescript
// agent-client.ts
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY!;
const IDENTITY_UID = process.env.KYA_IDENTITY_UID!;
const CAPABILITY_UID = process.env.KYA_CAPABILITY_UID!;

async function callKYAProtectedAPI() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);

  console.log("Agent address:", wallet.address);
  console.log("Identity UID:", IDENTITY_UID);

  // Step 1: Initial request - will get 402
  const initialResponse = await fetch("http://localhost:3000/api/data", {
    headers: {
      "X-KYA-Identity": IDENTITY_UID,
      "X-KYA-Capability": CAPABILITY_UID,
    },
  });

  if (initialResponse.status === 402) {
    console.log("Received 402 - Payment Required");

    // Parse x402 requirements from response
    const paymentRequirements = initialResponse.headers.get("X-Payment-Requirements");
    const requirements = JSON.parse(paymentRequirements || "{}");

    console.log("Payment requirements:", requirements);

    // Step 2: Sign the payment
    const payment = await signX402Payment(wallet, requirements);

    // Step 3: Retry with payment + KYA headers
    const paidResponse = await fetch("http://localhost:3000/api/data", {
      headers: {
        "X-KYA-Identity": IDENTITY_UID,
        "X-KYA-Capability": CAPABILITY_UID,
        "X-Payment": payment,
      },
    });

    if (paidResponse.ok) {
      const data = await paidResponse.json();
      console.log("Success! Response:", data);
      return data;
    } else {
      const error = await paidResponse.json();
      console.error("Request failed:", error);
      throw new Error(error.reason || "Unknown error");
    }
  }
}

async function signX402Payment(
  wallet: ethers.Wallet,
  requirements: any
): Promise<string> {
  // x402 payment signing logic
  // This is simplified - use @coinbase/x402 client in production
  const paymentData = {
    amount: requirements.price,
    payTo: requirements.payTo,
    nonce: Date.now(),
  };

  const signature = await wallet.signMessage(JSON.stringify(paymentData));

  return JSON.stringify({
    ...paymentData,
    signature,
  });
}

// Run
callKYAProtectedAPI().catch(console.error);
```

---

## Step 4: Enhanced Verification with Capability Checks

```typescript
// Require specific permissions
async function verifyKYAWithPermissions(
  request: NextRequest,
  requiredPermissions: bigint
): Promise<{ valid: boolean; reason?: string }> {
  const identityUID = request.headers.get("X-KYA-Identity");
  const capabilityUID = request.headers.get("X-KYA-Capability");

  if (!identityUID || !capabilityUID) {
    return {
      valid: false,
      reason: "Missing required KYA headers",
    };
  }

  // ... basic verification from above ...

  // Decode capability data to check permissions
  const capabilityData = decodeCapabilityData(capability.data);

  // Check if required permissions are present
  if ((capabilityData.permissions & requiredPermissions) !== requiredPermissions) {
    return {
      valid: false,
      reason: `Missing required permissions. Need: ${requiredPermissions}, Have: ${capabilityData.permissions}`,
    };
  }

  return { valid: true };
}

// Usage in handler
async function transactionHandler(request: NextRequest) {
  // Require TRANSACT permission
  const TRANSACT = 1n;

  const kyaResult = await verifyKYAWithPermissions(request, TRANSACT);

  if (!kyaResult.valid) {
    return NextResponse.json(
      { error: kyaResult.reason },
      { status: 403 }
    );
  }

  // Process transaction...
}
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                         COMPLETE REQUEST FLOW                                   │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   🤖 Agent                   🌐 Your API              ⛓️ EAS            │   │
│   │      │                           │                       │              │   │
│   │      │  GET /api/data            │                       │              │   │
│   │      │  X-KYA-Identity: 0x...    │                       │              │   │
│   │      │  X-KYA-Capability: 0x...  │                       │              │   │
│   │      ├──────────────────────────►│                       │              │   │
│   │      │                           │                       │              │   │
│   │      │                           │  getAttestation()     │              │   │
│   │      │                           ├──────────────────────►│              │   │
│   │      │                           │◄──────────────────────┤              │   │
│   │      │                           │  ✅ Valid, not revoked│              │   │
│   │      │                           │                       │              │   │
│   │      │  402 Payment Required     │                       │              │   │
│   │      │  X-Payment-Requirements:  │                       │              │   │
│   │      │  { price: "$0.001" }      │                       │              │   │
│   │      │◄──────────────────────────┤                       │              │   │
│   │      │                           │                       │              │   │
│   │      │  [Sign payment]           │                       │              │   │
│   │      │                           │                       │              │   │
│   │      │  GET /api/data            │                       │              │   │
│   │      │  X-KYA-Identity: 0x...    │                       │              │   │
│   │      │  X-KYA-Capability: 0x...  │                       │              │   │
│   │      │  X-Payment: [signed]      │                       │              │   │
│   │      ├──────────────────────────►│                       │              │   │
│   │      │                           │                       │              │   │
│   │      │                           │  Verify payment       │              │   │
│   │      │                           │  + Re-verify KYA      │              │   │
│   │      │                           │  + Settle on-chain    │              │   │
│   │      │                           │                       │              │   │
│   │      │  200 OK + Data            │                       │              │   │
│   │      │  { kyaVerified: true }    │                       │              │   │
│   │      │◄──────────────────────────┤                       │              │   │
│   │      │                           │                       │              │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Best Practices

### 1. Always Verify KYA Before Payment

```typescript
// CORRECT: Verify KYA first, then process payment
async function handler(request: NextRequest) {
  // 1. KYA verification (free)
  const kyaResult = await verifyKYA(request);
  if (!kyaResult.valid) {
    return NextResponse.json({ error: "KYA invalid" }, { status: 403 });
  }

  // 2. Payment processing (only if KYA passes)
  // This prevents paying for requests that would fail anyway
}
```

### 2. Check Capability Expiration

```typescript
const now = BigInt(Math.floor(Date.now() / 1000));

if (capability.expirationTime !== 0n && capability.expirationTime < now) {
  return { valid: false, reason: "Capability has expired" };
}
```

### 3. Verify Attestation Chain

```typescript
// Capability MUST reference the provided identity
if (capability.refUID !== identityUID) {
  return {
    valid: false,
    reason: "Capability does not belong to this identity",
  };
}
```

### 4. Log Everything

```typescript
console.log("KYA Verification:", {
  identityUID,
  capabilityUID,
  valid: kyaResult.valid,
  timestamp: new Date().toISOString(),
  agentAddress: request.headers.get("X-Wallet-Address"),
});
```

---

## Testing

```typescript
// test/x402-kya.test.ts
import { describe, it, expect } from "vitest";

describe("x402 + KYA Integration", () => {
  it("rejects requests without KYA headers", async () => {
    const response = await fetch("http://localhost:3000/api/data");
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.reason).toContain("Missing X-KYA-Identity");
  });

  it("rejects revoked identities", async () => {
    const response = await fetch("http://localhost:3000/api/data", {
      headers: {
        "X-KYA-Identity": REVOKED_IDENTITY_UID,
      },
    });
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.reason).toContain("revoked");
  });

  it("returns 402 for valid KYA without payment", async () => {
    const response = await fetch("http://localhost:3000/api/data", {
      headers: {
        "X-KYA-Identity": VALID_IDENTITY_UID,
        "X-KYA-Capability": VALID_CAPABILITY_UID,
      },
    });
    expect(response.status).toBe(402);
  });

  it("succeeds with valid KYA + payment", async () => {
    const response = await makeAuthenticatedRequest();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.kyaVerified).toBe(true);
  });
});
```

---

## Next Steps

- **[Add Delegation Support](./DELEGATION.md)** - Allow sub-agents to act on behalf
- **[Production Deployment](./PRODUCTION.md)** - Mainnet considerations
- **[Rate Limiting with KYA](./RATE_LIMITING.md)** - Trust-based rate limits

---

*x402 Integration Tutorial v1.0 | KYA Protocol*
