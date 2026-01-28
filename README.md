<p align="center">
  <img src="https://img.shields.io/badge/Status-TESTNET-orange?style=for-the-badge" alt="Testnet Status"/>
  <img src="https://img.shields.io/badge/Version-0.1.0-blue?style=for-the-badge" alt="Version 0.1.0"/>
  <img src="https://img.shields.io/badge/Network-Base%20Sepolia-8453ff?style=for-the-badge" alt="Base Sepolia"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<h1 align="center">KYA Protocol</h1>

<p align="center">
  <strong>Know Your Agent</strong><br/>
  An on-chain identity standard for autonomous AI agents built on the Ethereum Attestation Service
</p>

<p align="center">
  <a href="#the-problem">Problem</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#schemas">Schemas</a> &bull;
  <a href="#packages">Packages</a> &bull;
  <a href="#development">Development</a> &bull;
  <a href="#documentation">Docs</a>
</p>

---

> **Note**
> KYA is live on **Base Sepolia testnet**. Schema definitions and SDK interfaces are stabilizing but may still change before mainnet. Feedback welcome.

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

// Grant capabilities with permission bitmasks
const capUID = await kya.createCapability({
  parentIdentityUID: identityUID,
  permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
  expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
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

### Record Provenance

```typescript
const provenanceUID = await kya.createProvenance({
  parentIdentityUID: identityUID,
  sourceCodeHash: KYA.hashString("https://github.com/org/agent@v1.2.0"),
  provenanceType: 1, // source code
});
```

### Create Delegation

```typescript
const delegationUID = await kya.createDelegation({
  parentIdentityUID: identityUID,
  delegator: "0xHuman...",
  delegatee: "0xSubAgent...",
  scope: "trade:execute",
  expiresAt: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
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

### Smart Contracts

Two custom resolver contracts enforce on-chain invariants:

| Contract | Enforces |
|----------|----------|
| **`KYAIdentityResolver`** | One identity per agent address, non-zero owner/agent validation, optional attester whitelist, 2-step admin transfer |
| **`KYACapabilityResolver`** | Parent identity must exist, not be revoked, and not be expired |

## Schemas

| Schema | Purpose | Resolver | Fields |
|--------|---------|----------|--------|
| **KYA-Identity** | Agent passport — one per agent address | `KYAIdentityResolver` | `agentDID`, `agentAddress`, `ownerAddress`, `displayNameHash`, `descriptionHash`, `createdAt`, `version`, `metadataURI` |
| **KYA-Capability** | Permission grants tied to an identity | `KYACapabilityResolver` | `capabilityId`, `permissions`, `targetContract`, `grantedAt`, `expiresAt`, `conditionsHash`, `trustLevel` |
| **KYA-Provenance** | Code lineage and audit trail | None (v1) | `sourceCodeHash`, `modelHash`, `buildHash`, `builderAddress`, `auditReportHash`, `buildTimestamp`, `previousVersionUID`, `provenanceType` |
| **KYA-Delegation** | Authorization chains between agents | None (v1) | `delegator`, `delegatee`, `scope`, `constraints`, `delegatedAt`, `expiresAt`, `depth` |

### Permission Bitmasks

Capabilities use a bitmask system for fine-grained permission control:

| Permission | Bit | Value | Description |
|------------|-----|-------|-------------|
| `TRANSACT` | 0 | `1` | Execute transactions |
| `SIGN` | 1 | `2` | Sign messages |
| `DEPLOY` | 2 | `4` | Deploy contracts |
| `ADMIN` | 3 | `8` | Administrative operations |
| `READ_PRIVATE` | 4 | `16` | Access private data |
| `DELEGATE` | 5 | `32` | Delegate to sub-agents |
| `CROSS_CHAIN` | 6 | `64` | Cross-chain operations |

```typescript
// Compose permissions with bitwise OR
const permissions = KYA.Permissions.TRANSACT | KYA.Permissions.SIGN | KYA.Permissions.DELEGATE;
```

## Packages

```
kya-protocol/
├── packages/
│   ├── contracts/       # Hardhat — Solidity resolvers, tests, deploy script
│   └── sdk/             # @kya/sdk — TypeScript SDK
├── docs/                # Specification, whitepaper, explainer
├── examples/            # Runnable examples
└── package.json         # npm workspaces root
```

| Package | Description | Tests |
|---------|-------------|-------|
| [`@kya/contracts`](./packages/contracts) | Solidity resolver contracts, Hardhat tests, deployment script | 11 |
| [`@kya/sdk`](./packages/sdk) | TypeScript SDK — identity, capability, provenance, delegation, verification, off-chain support | 7 |

## Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
# Install all workspace dependencies
npm install

# Compile contracts
cd packages/contracts && npx hardhat compile

# Run contract tests (11 tests)
npx hardhat test

# Build SDK
cd ../sdk && npm run build

# Run SDK tests (7 tests)
npm test
```

Or from the repo root:

```bash
npm run build   # compile contracts + build SDK
npm test        # run all 18 tests across both packages
```

### Deploy to Base Sepolia

```bash
# 1. Configure environment
cp .env.example .env
# Set BASE_SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY in .env

# 2. Deploy resolvers and register schemas
cd packages/contracts
npm run deploy:base-sepolia
```

The deploy script will:
1. Deploy `KYAIdentityResolver` (whitelist enabled, deployer added as first attester)
2. Register the Identity schema with the resolver
3. Deploy `KYACapabilityResolver` (linked to the Identity schema UID)
4. Register the Capability schema with the resolver
5. Register the Provenance and Delegation schemas (no resolvers)
6. Write all addresses and schema UIDs to `deployments/base-sepolia.json`

### Network Info

| | Address |
|--|---------|
| **Network** | Base Sepolia (chain ID `84532`) |
| **EAS** | `0x4200000000000000000000000000000000000021` |
| **SchemaRegistry** | `0x4200000000000000000000000000000000000020` |

## Security

### Contract Security Features

- **One identity per agent** — the resolver enforces a unique mapping from agent address to identity UID
- **Non-zero validation** — both agent and owner addresses must be non-zero
- **Attester whitelist** — optional access control for who can create attestations
- **2-step admin transfer** — admin privileges require `transferAdmin` + `acceptAdmin` to prevent accidental transfers
- **Parent validation** — capabilities are rejected if the referenced identity is revoked or expired

### Reporting Vulnerabilities

This is alpha software. **Do not use in production.**

To report security issues, please email security@edgeoftrust.com.

## Documentation

| Document | Description |
|----------|-------------|
| [SPECIFICATION.md](./docs/SPECIFICATION.md) | Full technical spec — schemas, resolvers, integration patterns |
| [WHITEPAPER.md](./docs/WHITEPAPER.md) | Market context, protocol landscape, adoption pathways |
| [EXPLAINER.md](./docs/EXPLAINER.md) | Visual explainer with diagrams |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT — See [LICENSE](./LICENSE)

---

<p align="center">
  <em>The agents are coming. It's time to know who they are.</em>
</p>

<p align="center">
  <sub>Built by <a href="https://edgeoftrust.com">Edge of Trust</a></sub>
</p>
