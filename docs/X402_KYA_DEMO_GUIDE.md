# KYA + x402 Demo Guide for Alchemy

**Autonomous Agent Identity Meets Micropayments**

This guide walks you through the complete KYA + x402 integration demo, explaining every component so you can confidently present it to Alchemy.

---

## Table of Contents

- [The Story](#the-story)
- [Architecture Overview](#architecture-overview)
- [Live Deployment](#live-deployment)
- [Running the Demo](#running-the-demo)
- [Step-by-Step Demo Flow](#step-by-step-demo-flow)
- [Technical Deep Dive](#technical-deep-dive)
- [Key Talking Points for Alchemy](#key-talking-points-for-alchemy)
- [Troubleshooting](#troubleshooting)

---

## The Story

> "An autonomous trading agent needs token balance data from Alchemy's API. Before the API serves data, it needs to answer three questions:
>
> 1. **Who is this agent?** (KYA Identity)
> 2. **What can it do?** (KYA Capability - TRANSACT permission)
> 3. **Who's accountable?** (KYA Delegation chain to human owner)
> 4. **How does it pay?** (x402 micropayment - $0.001 USDC)
>
> KYA + x402 answers all four in a single HTTP request."

This demo proves that **verified agent identity + frictionless payments = the future of API monetization**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEMO UI (/demo/x402)                            │
│                                                                         │
│   ┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐    │
│   │ WalletPanel │    │ AgentIdentity    │    │  ApiRequestPanel   │    │
│   │             │    │ Panel            │    │                    │    │
│   │ • Connect   │    │ • Identity UID   │    │ • Select Token     │    │
│   │ • ETH bal   │    │ • Capability     │    │ • Execute Request  │    │
│   │ • USDC bal  │    │ • Delegation     │    │ • View Response    │    │
│   └─────────────┘    └──────────────────┘    └────────────────────┘    │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    VerificationFlow                              │  │
│   │  Request → Identity → Capability → Delegation → Payment → Data  │  │
│   └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    /api/alchemy/token (Protected API)                   │
│                                                                         │
│   1. x402 Middleware intercepts request                                 │
│      → Returns 402 Payment Required with payment details                │
│                                                                         │
│   2. Client signs USDC payment, retries with X-PAYMENT header           │
│                                                                         │
│   3. KYA Verification                                                   │
│      → Verify Identity attestation on EAS                               │
│      → Verify TRANSACT capability                                       │
│      → Verify Delegation chain to human owner                           │
│                                                                         │
│   4. Return Alchemy-style token balance response                        │
│      → Payment settled only on success (status < 400)                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Base Sepolia (Chain ID: 84532)                       │
│                                                                         │
│   EAS Contract: 0x4200000000000000000000000000000000000021               │
│   Schema Registry: 0x4200000000000000000000000000000000000020            │
│   USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Live Deployment

### Network: Base Sepolia (Testnet)

| Resource | Address/Link |
|----------|--------------|
| Chain ID | `84532` (CAIP-2: `eip155:84532`) |
| RPC URL | `https://sepolia.base.org` |
| Block Explorer | [basescan.org/sepolia](https://sepolia.basescan.org) |
| EAS Explorer | [base-sepolia.easscan.org](https://base-sepolia.easscan.org) |

### KYA Schema UIDs

| Schema | UID | Explorer |
|--------|-----|----------|
| Identity | `0xfd036643b5e887b2b037fdeedad4d16585546af58e47241166651a43d94a58f5` | [View](https://base-sepolia.easscan.org/schema/view/0xfd036643b5e887b2b037fdeedad4d16585546af58e47241166651a43d94a58f5) |
| Capability | `0x85a9deca937936c6977f5b56aba4cefe723efe80246534cea81232f56c74bb50` | [View](https://base-sepolia.easscan.org/schema/view/0x85a9deca937936c6977f5b56aba4cefe723efe80246534cea81232f56c74bb50) |
| Provenance | `0xd3a0ab5f0145efe491c315a1188dac178bcf0e166c0081af9f1548959583c1fe` | [View](https://base-sepolia.easscan.org/schema/view/0xd3a0ab5f0145efe491c315a1188dac178bcf0e166c0081af9f1548959583c1fe) |
| Delegation | `0x64ad390f03550b4ad8a71a0407ec3e261fae71cb5c58b8fb3c69a867bc879ae5` | [View](https://base-sepolia.easscan.org/schema/view/0x64ad390f03550b4ad8a71a0407ec3e261fae71cb5c58b8fb3c69a867bc879ae5) |

### Demo Agent Attestations

| Attestation | UID | Explorer |
|-------------|-----|----------|
| **Identity** | `0x6ba4ce7faff6c1c0c09c320e1f3d64f69b66c577f6135a26bae079d815d4f00a` | [View on EAS](https://base-sepolia.easscan.org/attestation/view/0x6ba4ce7faff6c1c0c09c320e1f3d64f69b66c577f6135a26bae079d815d4f00a) |
| **Capability** | `0xa96e6ce8fa24709796bc7e4af7574258cd85315820d2420d109f490de3e0bfdc` | [View on EAS](https://base-sepolia.easscan.org/attestation/view/0xa96e6ce8fa24709796bc7e4af7574258cd85315820d2420d109f490de3e0bfdc) |
| **Delegation** | `0xe0b62f44024dca674127eccb784e1465ee1aa46eb5f22abea45d4878998c3f99` | [View on EAS](https://base-sepolia.easscan.org/attestation/view/0xe0b62f44024dca674127eccb784e1465ee1aa46eb5f22abea45d4878998c3f99) |

### Addresses

| Role | Address |
|------|---------|
| Agent (Trading Bot Alpha) | `0x825329E9666B8Eb97bbaF8E623E9E98462b2A60d` |
| Human Owner | `0x6A0E9E21eb8681c45260cE71dd969BA5Dbb28A91` |
| USDC Contract | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

---

## Running the Demo

### Prerequisites

1. **Wallet with Base Sepolia funds**:
   - Get testnet ETH: [Coinbase Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
   - Get testnet USDC: [Circle Faucet](https://faucet.circle.com/) (select Base Sepolia)

2. **MetaMask or WalletConnect-compatible wallet**

### Start the Demo

```bash
cd packages/web
npm run dev
```

Open [http://localhost:3000/demo/x402](http://localhost:3000/demo/x402)

---

## Step-by-Step Demo Flow

### Step 1: Connect Wallet

1. Click any wallet option (MetaMask recommended)
2. Approve connection to Base Sepolia
3. Verify you see:
   - Your address (truncated)
   - ETH balance (need gas)
   - USDC balance (need $0.001+ for payment)

**What's happening**: The demo uses wagmi/viem to connect your wallet. Your wallet will sign the x402 payment.

### Step 2: Review Agent Identity

The **Agent Attestations** panel shows the pre-deployed KYA attestations:

| Card | What It Shows |
|------|---------------|
| **Identity** | The agent's on-chain identity (Trading Bot Alpha), linked to human owner |
| **Capability** | TRANSACT + SIGN permissions (bitmask: 0x03) |
| **Delegation** | Human owner → Agent delegation with `trading:execute` scope |

**Click "View on EAS Explorer"** to show the live attestations on-chain.

### Step 3: Configure Request

In the **Alchemy Token API** panel:

1. Select a token (USDC or WETH)
2. Your connected wallet address auto-fills
3. Note the cost: **$0.001 USDC**

### Step 4: Execute Request

Click **"Request Token Data"** and watch the verification flow:

| Step | What Happens | Duration |
|------|--------------|----------|
| 1. Request Received | API receives request with KYA headers | 300ms |
| 2. KYA Identity | Verify identity attestation on EAS | 800ms |
| 3. TRANSACT Capability | Verify agent has TRANSACT permission | 600ms |
| 4. Delegation Chain | Verify delegation back to human owner | 500ms |
| 5. x402 Payment | Sign + settle $0.001 USDC payment | 2000ms |
| 6. Data Delivered | Return token balance data | 400ms |

### Step 5: View Response

On success, you'll see an Alchemy-style JSON response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "address": "0xYourWallet...",
    "tokenBalances": [{
      "contractAddress": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "tokenBalance": "1234567890"
    }]
  },
  "meta": {
    "kyaVerified": true,
    "verificationDetails": {
      "identity": { "uid": "0x6ba4...", "verified": true, "revoked": false },
      "capability": { "uid": "0xa96e...", "verified": true, "revoked": false },
      "delegation": { "uid": "0xe0b6...", "verified": true, "revoked": false }
    },
    "timestamp": "2026-01-30T16:45:00.000Z"
  }
}
```

**Key point**: The `meta.kyaVerified: true` proves the agent's identity was verified on-chain before the API served data.

---

## Technical Deep Dive

### How x402 Works

x402 is the **HTTP 402 Payment Required** protocol:

```
1. Client sends request
   GET /api/alchemy/token?token=USDC&wallet=0x...

2. Server returns 402 with payment instructions
   HTTP 402 Payment Required
   X-Payment-Required: {
     "scheme": "exact",
     "price": "$0.001",
     "network": "eip155:84532",
     "payTo": "0x..."
   }

3. Client signs USDC payment, retries with header
   GET /api/alchemy/token?token=USDC&wallet=0x...
   X-Payment: {signed payment proof}

4. Server verifies payment, processes request
   HTTP 200 OK
   {token balance data}
```

### How KYA Verification Works

The API extracts three headers from every request:

```typescript
const identityUid = request.headers.get("X-KYA-Identity");
const capabilityUid = request.headers.get("X-KYA-Capability");
const delegationUid = request.headers.get("X-KYA-Delegation");
```

For each UID, it queries EAS on Base Sepolia:

```typescript
const eas = new EAS("0x4200000000000000000000000000000000000021");
const attestation = await eas.getAttestation(uid);

// Check attestation exists and isn't revoked
if (!attestation || attestation.revocationTime > 0n) {
  return { valid: false, reason: "Attestation not found or revoked" };
}
```

### The KYA Schema Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                  KYA-Identity                       │
│  "This agent exists and is owned by this human"    │
│                                                     │
│  • agentAddress: 0x825329E9...                     │
│  • ownerAddress: 0x6A0E9E21...                     │
│  • displayName: "Trading Bot Alpha"                │
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌───────────────────┐         ┌─────────────────────┐
│  KYA-Capability   │         │   KYA-Delegation    │
│  "What can it do" │         │  "Who authorized"   │
│                   │         │                     │
│  • TRANSACT (1)   │         │  • delegator: Owner │
│  • SIGN (2)       │         │  • delegatee: Agent │
│  • bitmask: 0x03  │         │  • scope: trading   │
│  • trustLevel: 2  │         │  • depth: 0         │
└───────────────────┘         └─────────────────────┘
```

### API Route Implementation

```typescript
// /api/alchemy/token/route.ts

export const GET = withX402(
  handler,          // Your API logic
  {
    accepts: [{
      scheme: "exact",
      price: "$0.001",
      network: "eip155:84532",  // Base Sepolia
      payTo: PAYMENT_ADDRESS,
    }],
    description: "KYA-verified token balance API",
  },
  server            // x402 resource server
);
```

The `withX402` middleware:
1. Checks for payment header
2. If missing, returns 402 with payment instructions
3. If present, verifies payment signature
4. Calls your handler
5. Settles payment only if handler returns 2xx

---

## Key Talking Points for Alchemy

### 1. The Problem You Solve

> "As AI agents increasingly consume APIs autonomously, you face three challenges:
>
> 1. **Identity**: Who is this agent? Is it legitimate?
> 2. **Authorization**: What is this agent allowed to do?
> 3. **Accountability**: If something goes wrong, who's responsible?
>
> Traditional API keys can't answer these questions. KYA provides cryptographic proof of all three."

### 2. Why On-Chain Attestations Matter

> "KYA attestations are stored on EAS (Ethereum Attestation Service), not in a centralized database. This means:
>
> - **Tamper-proof**: Can't be faked or modified
> - **Revocable**: Owner can revoke agent permissions instantly
> - **Auditable**: Complete history visible on-chain
> - **Interoperable**: Any API can verify the same attestations"

### 3. The x402 Value Proposition

> "x402 enables micropayments without:
>
> - Monthly subscriptions (pay per request)
> - Credit card processing fees (crypto-native)
> - Invoice management (instant settlement)
> - Chargebacks (cryptographically signed)
>
> Alchemy could monetize every API call at fractions of a cent."

### 4. The Combined Superpower

> "KYA + x402 together create **trusted, monetized agent endpoints**:
>
> - Know exactly which agent is calling
> - Know what it's authorized to do
> - Know who's accountable (human owner)
> - Get paid instantly per request
>
> This is the infrastructure for the agentic economy."

### 5. Integration Effort

> "For Alchemy, integration requires:
>
> 1. Add x402 middleware to API routes (~10 lines)
> 2. Add KYA verification (~50 lines)
> 3. Configure payment address
>
> That's it. No new infrastructure needed."

---

## Troubleshooting

### "Wallet not connected"

- Ensure MetaMask is unlocked
- Check you're on Base Sepolia network
- Refresh the page

### "Insufficient USDC balance"

- Get testnet USDC from [Circle Faucet](https://faucet.circle.com/)
- Select "Base Sepolia" network
- Request USDC (not EURC)

### "KYA verification failed"

- Check attestation UIDs in `data.ts` match deployed attestations
- Verify attestations haven't been revoked on EAS Explorer
- Ensure API route is reading correct headers

### "Payment failed"

- Ensure USDC approval for x402 facilitator
- Check wallet has ETH for gas
- Verify x402 facilitator URL is correct

---

## File Reference

| File | Purpose |
|------|---------|
| `packages/web/src/app/demo/x402/page.tsx` | Demo page entry |
| `packages/web/src/app/demo/x402/X402Demo.tsx` | Main demo component |
| `packages/web/src/app/demo/x402/data.ts` | Attestation UIDs, tokens, verification steps |
| `packages/web/src/app/demo/x402/components/` | UI components |
| `packages/web/src/app/api/alchemy/token/route.ts` | x402 + KYA protected API |
| `packages/web/src/lib/wagmi.ts` | Wallet configuration |
| `packages/web/src/lib/x402-client.ts` | x402 fetch wrapper |
| `packages/sdk/src/constants.ts` | KYA schema UIDs |
| `scripts/setup-x402-demo.ts` | Attestation deployment script |

---

## Next Steps After Demo

1. **Production Deployment**: Deploy to mainnet with real USDC
2. **Real Alchemy Integration**: Replace mock data with live Alchemy API calls
3. **Rate Limiting**: Add per-agent rate limits based on trust level
4. **Analytics**: Track verified agents and payment volume
5. **SDK Release**: Publish `@kya/sdk` for easy integration

---

**Questions?** Open an issue or reach out to the team.
