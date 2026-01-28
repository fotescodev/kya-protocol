<p align="center">
  <img src="https://img.shields.io/badge/Status-DRAFT%20ALPHA-orange?style=for-the-badge" alt="Draft Alpha Status"/>
  <img src="https://img.shields.io/badge/Version-0.1.0-blue?style=for-the-badge" alt="Version 0.1.0"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<h1 align="center">KYA Protocol</h1>

<p align="center">
  <strong>Know Your Agent</strong><br/>
  An on-chain identity standard for autonomous AI agents built on the Ethereum Attestation Service
</p>

<p align="center">
  <a href="#the-problem">Problem</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#packages">Packages</a> •
  <a href="#documentation">Docs</a>
</p>

---

> **Warning**
> This specification is in **DRAFT** status. Schema definitions, resolver contracts, and SDK interfaces are subject to change. Not recommended for production use.

---

## The Problem

AI agents are transacting at unprecedented scale — yet they remain **"unbanked ghosts"** with no way to prove who they are, what they're authorized to do, or who's accountable when they fail.

**Humans have KYC. Agents need KYA.**

## Quick Start

### Install

```bash
npm install @kya/sdk ethers
```

### Create an Agent Identity

```typescript
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const kya = new KYA({ network: "base-sepolia", signer });

// Register agent identity (on-chain attestation)
const identityUID = await kya.createIdentity({
  agentAddress: "0xAgent...",
  ownerAddress: "0xHuman...", // accountability anchor
  displayName: "TradingBot Alpha",
  description: "Autonomous market-making agent",
});

// Grant capabilities
const capUID = await kya.createCapability({
  parentIdentityUID: identityUID,
  permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
  expiresAt: Date.now() + 86400 * 30 * 1000, // 30 days
});

// Verify any attestation
const result = await kya.verify(identityUID);
console.log(result.valid); // true
```

### Off-chain (Zero Gas)

```typescript
// EIP-712 signed attestation — no gas cost
const offchain = await kya.createIdentityOffchain({
  agentAddress: "0xAgent...",
  ownerAddress: "0xHuman...",
  displayName: "TradingBot Alpha",
});
```

## Architecture

KYA provides four composable attestation schemas built on [EAS](https://attest.sh):

```
┌──────────────────────────────────────────────────────────────────┐
│                        KYA TRUST CHAIN                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   IDENTITY ────► CAPABILITY ────► DELEGATION ────► PROVENANCE    │
│   "Who?"         "What?"          "By whom?"       "From where?" │
│                                                                  │
│   Every chain terminates at a human. Always.                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

| Schema | Purpose | On-chain Resolver |
|--------|---------|-------------------|
| **KYA-Identity** | Agent passport — one per agent address | `KYAIdentityResolver` |
| **KYA-Capability** | Permission grants tied to an identity | `KYACapabilityResolver` |
| **KYA-Provenance** | Code lineage and audit trail | None (v1) |
| **KYA-Delegation** | Authorization chains | None (v1) |

### Smart Contracts

Two custom resolver contracts enforce on-chain invariants:

- **`KYAIdentityResolver`** — one identity per agent, non-zero owner, optional attester whitelist
- **`KYACapabilityResolver`** — validates parent identity is valid, not revoked, not expired

## Packages

```
kya-protocol/
├── packages/
│   ├── contracts/       # Hardhat project — Solidity resolvers + deploy script
│   └── sdk/             # @kya/sdk — TypeScript SDK
├── docs/                # Specification, whitepaper, explainer
├── assets/              # Design files
├── examples/            # Runnable examples
└── package.json         # npm workspaces root
```

| Package | Description |
|---------|-------------|
| [`@kya/contracts`](./packages/contracts) | Solidity resolver contracts, Hardhat tests, deployment script |
| [`@kya/sdk`](./packages/sdk) | TypeScript SDK — `KYA` class with identity, capability, provenance, delegation, verification, and off-chain support |

### Development

```bash
# Install all dependencies
npm install

# Compile contracts
cd packages/contracts && npx hardhat compile

# Run contract tests (9 tests)
npx hardhat test

# Build SDK
cd ../sdk && npm run build

# Run SDK tests (7 tests)
npm test
```

### Deploy to Base Sepolia

```bash
cp .env.example .env
# Edit .env with your RPC URL and deployer private key

cd packages/contracts
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## Documentation

| Document | Description |
|----------|-------------|
| [SPECIFICATION.md](./docs/SPECIFICATION.md) | Full technical spec — schemas, resolvers, integration patterns |
| [WHITEPAPER.md](./docs/WHITEPAPER.md) | Market context, protocol landscape, adoption pathways |
| [EXPLAINER.md](./docs/EXPLAINER.md) | Visual explainer with diagrams |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Security

This is alpha software. **Do not use in production.**

To report security issues, please email security@edgeoftrust.com.

## License

MIT — See [LICENSE](./LICENSE)

---

<p align="center">
  <em>The agents are coming. It's time to know who they are.</em>
</p>

<p align="center">
  <sub>Built by <a href="https://edgeoftrust.com">Edge of Trust</a></sub>
</p>
