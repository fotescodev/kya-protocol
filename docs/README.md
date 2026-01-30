# KYA Protocol Documentation

> Know Your Agent: The identity standard for autonomous AI agents.

---

## What is KYA?

KYA (Know Your Agent) is an on-chain identity standard for AI agents, built on the Ethereum Attestation Service (EAS). It answers the fundamental questions about any agent:

- **Who is this?** - Identity attestation
- **What can it do?** - Capability attestation
- **Who authorized it?** - Delegation attestation
- **Where did it come from?** - Provenance attestation

**Every trust chain terminates at a human. That's accountability.**

---

## Documentation Map

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                           DOCUMENTATION STRUCTURE                               │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   START HERE                                                            │   │
│   │   ══════════                                                            │   │
│   │                                                                         │   │
│   │   📖 WHITEPAPER.md          The complete vision and technical design    │   │
│   │   🎨 VISUAL_CONCEPTS.md     Visual guide to all core concepts           │   │
│   │   📋 EXPLAINER.md           Quick visual explainer with diagrams        │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   ARCHITECTURE                                                          │   │
│   │   ════════════                                                          │   │
│   │                                                                         │   │
│   │   🏗️ ARCHITECTURE.md        System design, components, data flows       │   │
│   │   📜 SPECIFICATION.md       Formal technical specification              │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   TUTORIALS                                                             │   │
│   │   ═════════                                                             │   │
│   │                                                                         │   │
│   │   🚀 tutorials/QUICKSTART.md         Create your first agent identity   │   │
│   │   🔗 tutorials/X402_INTEGRATION.md   Integrate with x402 payments       │   │
│   │   📚 tutorials/SDK_REFERENCE.md      Complete SDK API documentation     │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   EXAMPLES                                                              │   │
│   │   ════════                                                              │   │
│   │                                                                         │   │
│   │   💻 examples/README.md     Runnable code examples for common patterns  │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   BUSINESS & STRATEGY                                                   │   │
│   │   ═══════════════════                                                   │   │
│   │                                                                         │   │
│   │   💼 BUSINESS_STRATEGY.md        Market analysis and GTM strategy       │   │
│   │   🔌 X402_KYA_INTEGRATION_SPEC.md  Detailed x402 integration spec       │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Links

### For Developers

| Goal | Document |
|------|----------|
| Understand the concepts | [Visual Concepts Guide](./VISUAL_CONCEPTS.md) |
| Create an agent identity | [Quick Start Tutorial](./tutorials/QUICKSTART.md) |
| Integrate with x402 | [x402 Integration](./tutorials/X402_INTEGRATION.md) |
| SDK API reference | [SDK Reference](./tutorials/SDK_REFERENCE.md) |
| See code examples | [Examples](./examples/README.md) |

### For Architects

| Goal | Document |
|------|----------|
| System design overview | [Architecture](./ARCHITECTURE.md) |
| Formal specification | [Specification](./SPECIFICATION.md) |
| Whitepaper | [Whitepaper](./WHITEPAPER.md) |

### For Business

| Goal | Document |
|------|----------|
| Market opportunity | [Business Strategy](./BUSINESS_STRATEGY.md) |
| Integration planning | [x402 Integration Spec](./X402_KYA_INTEGRATION_SPEC.md) |

---

## Core Concepts in 60 Seconds

```
The Problem
═══════════════════════════════════════════════════════════════════════════
AI agents transact $24M+ via x402, 3.5M+ transactions via Olas.
But they can't prove WHO they are or WHO is accountable.


The Solution
═══════════════════════════════════════════════════════════════════════════
Four composable attestation schemas built on EAS:

   IDENTITY     ──►   "Who is this agent?"
   CAPABILITY   ──►   "What can it do?"
   DELEGATION   ──►   "Who authorized it?"
   PROVENANCE   ──►   "Where did it come from?"


The Rule
═══════════════════════════════════════════════════════════════════════════
Every chain terminates at a human. Non-negotiable.

   🤖 ──► 🤖 ──► 🤖 ──► 👤
                         └── This is who's accountable
```

---

## The Four Schemas

### 1. KYA-Identity

The agent's passport. One per agent. Links to human/org owner.

```
Agent Address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
Owner Address: 0x8ba1f109551bD432803012645Ac136ddd64DBA72  ← Accountability anchor
Display Name:  Trading Bot Alpha
```

### 2. KYA-Capability

Security clearance. What the agent can do.

```
Permissions: TRANSACT | SIGN (bitmask: 3)
Trust Level: 100/255
Expires:     30 days
```

### 3. KYA-Delegation

Power of attorney. Who authorized the agent.

```
Delegator: 0xHuman...
Delegatee: 0xAgent...
Depth:     0 → 1 → 2 → 3 (max)
```

### 4. KYA-Provenance

Family tree. Where the code came from.

```
Source Hash: 0xabc... (git commit)
Model Hash:  0xdef... (ML weights)
Audit:       Trail of Bits ✓
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   APPLICATIONS                                                                  │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                               │
│   │  x402   │ │ Kite.ai │ │  DeFi   │ │Your App │                               │
│   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘                               │
│        └───────────┴───────────┴───────────┘                                    │
│                            │                                                    │
│   SDK                      │                                                    │
│   ┌────────────────────────▼────────────────────────┐                           │
│   │              @kya/sdk (TypeScript)              │                           │
│   └────────────────────────┬────────────────────────┘                           │
│                            │                                                    │
│   RESOLVERS                │                                                    │
│   ┌────────────────────────▼────────────────────────┐                           │
│   │  KYAIdentityResolver │ KYACapabilityResolver    │                           │
│   └────────────────────────┬────────────────────────┘                           │
│                            │                                                    │
│   EAS                      │                                                    │
│   ┌────────────────────────▼────────────────────────┐                           │
│   │     Ethereum Attestation Service (EAS)          │                           │
│   │     Base • Optimism • Arbitrum • Ethereum       │                           │
│   └─────────────────────────────────────────────────┘                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### 1. Install the SDK

```bash
npm install @kya/sdk ethers
```

### 2. Create an Identity

```typescript
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const kya = new KYA({ network: "base-sepolia", signer });

const identityUID = await kya.createIdentity({
  agentAddress: "0x...",
  ownerAddress: "0x...",
  displayName: "My Agent",
});
```

### 3. Verify

```typescript
const result = await kya.verify(identityUID);
console.log(result.valid); // true
```

**[Continue with the Quick Start Tutorial →](./tutorials/QUICKSTART.md)**

---

## Why KYA?

| Feature | KYA | Wallet Only | Proprietary |
|---------|-----|-------------|-------------|
| On-chain verification | ✅ | ❌ | ❌ |
| Cross-platform portable | ✅ | ✅ | ❌ |
| Capability attestation | ✅ | ❌ | Varies |
| Provenance tracking | ✅ | ❌ | ❌ |
| Delegation chains | ✅ | ❌ | ❌ |
| On-chain revocation | ✅ | ❌ | ❌ |
| Open standard | ✅ | ✅ | ❌ |
| Human accountability | ✅ | ❌ | Varies |

---

## Links

- **GitHub**: [github.com/your-org/kya-protocol](https://github.com/your-org/kya-protocol)
- **NPM**: [@kya/sdk](https://www.npmjs.com/package/@kya/sdk)
- **EAS Explorer**: [base-sepolia.easscan.org](https://base-sepolia.easscan.org)
- **Testnet Faucet**: [coinbase.com/faucets](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

---

## Contributing

KYA is an open specification. We welcome contributions:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## License

MIT License. See [LICENSE](../LICENSE) for details.

---

*KYA Protocol Documentation v1.0*
*The Identity Layer for Autonomous AI Agents*
