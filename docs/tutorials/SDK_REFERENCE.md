# KYA SDK Reference

> Complete API documentation for the @kya/sdk package.

---

## Installation

```bash
npm install @kya/sdk ethers
# or
yarn add @kya/sdk ethers
# or
pnpm add @kya/sdk ethers
```

---

## Quick Start

```typescript
import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const kya = new KYA({
  network: "base-sepolia",
  signer,
});
```

---

## Class: KYA

The main class for all KYA operations.

### Constructor

```typescript
new KYA(config: KYAConfig)
```

#### KYAConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `network` | `string` | Yes | Network identifier: `"base-sepolia"`, `"base"`, `"optimism"`, `"arbitrum"` |
| `signer` | `ethers.Signer` | Yes | Ethers signer for signing transactions |
| `schemaUIDs` | `SchemaUIDs` | No | Custom schema UIDs (uses defaults if omitted) |

```typescript
interface SchemaUIDs {
  identity?: string;
  capability?: string;
  provenance?: string;
  delegation?: string;
}
```

---

## Identity Operations

### createIdentity

Creates an on-chain identity attestation for an agent.

```typescript
async createIdentity(params: CreateIdentityParams): Promise<string>
```

#### Parameters

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `agentAddress` | `string` | Yes | The agent's wallet address |
| `ownerAddress` | `string` | Yes | Human/org responsible for the agent |
| `displayName` | `string` | Yes | Human-readable name |
| `description` | `string` | No | Agent description |
| `agentDID` | `string` | No | W3C DID identifier |
| `metadataURI` | `string` | No | IPFS/HTTPS link to extended metadata |

#### Returns

`string` - The attestation UID

#### Example

```typescript
const identityUID = await kya.createIdentity({
  agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  ownerAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  displayName: "Trading Bot Alpha",
  description: "Autonomous DeFi trading agent",
});
```

---

### createIdentityOffchain

Creates a free off-chain identity attestation using EIP-712 signing.

```typescript
async createIdentityOffchain(params: CreateIdentityParams): Promise<OffchainAttestation>
```

#### Returns

```typescript
interface OffchainAttestation {
  uid: string;
  signature: string;
  data: {
    schema: string;
    recipient: string;
    time: number;
    expirationTime: number;
    revocable: boolean;
    refUID: string;
    data: string;
  };
  domain: EIP712Domain;
  types: EIP712Types;
  message: EIP712Message;
}
```

#### Example

```typescript
const offchainIdentity = await kya.createIdentityOffchain({
  agentAddress: "0x...",
  ownerAddress: "0x...",
  displayName: "Free Agent",
});

// Store anywhere - IPFS, database, return to client
console.log(offchainIdentity.signature);
```

---

### revokeIdentity

Revokes an identity attestation. This is permanent.

```typescript
async revokeIdentity(uid: string): Promise<void>
```

#### Example

```typescript
await kya.revokeIdentity("0xabc123...");
// Identity is now permanently revoked
```

---

## Capability Operations

### createCapability

Creates a capability attestation granting permissions to an agent.

```typescript
async createCapability(params: CreateCapabilityParams): Promise<string>
```

#### Parameters

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `parentIdentityUID` | `string` | Yes | The identity this capability belongs to |
| `permissions` | `bigint` | Yes | Bitmask of permissions |
| `targetContract` | `string` | No | Contract this applies to (0x0 = global) |
| `expiresAt` | `number` | No | Unix timestamp for expiration |
| `conditionsHash` | `string` | No | Hash of off-chain conditions |
| `trustLevel` | `number` | No | Trust score 0-255 |

#### Example

```typescript
const capabilityUID = await kya.createCapability({
  parentIdentityUID: identityUID,
  permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
  expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  trustLevel: 100,
});
```

---

### createCapabilityOffchain

Creates a free off-chain capability attestation.

```typescript
async createCapabilityOffchain(params: CreateCapabilityParams): Promise<OffchainAttestation>
```

---

### revokeCapability

Revokes a capability attestation.

```typescript
async revokeCapability(uid: string): Promise<void>
```

---

## Delegation Operations

### createDelegation

Creates a delegation attestation allowing one address to act on behalf of another.

```typescript
async createDelegation(params: CreateDelegationParams): Promise<string>
```

#### Parameters

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `delegator` | `string` | Yes | Address granting delegation |
| `delegatee` | `string` | Yes | Address receiving delegation |
| `scope` | `string` | Yes | Scope of delegation (capability hash or wildcard) |
| `expiresAt` | `number` | No | Unix timestamp for expiration |
| `depth` | `number` | Yes | Current delegation depth (max 3) |
| `constraints` | `bigint` | No | Additional constraint bitmask |

#### Example

```typescript
const delegationUID = await kya.createDelegation({
  delegator: "0xHuman...",
  delegatee: "0xAgent...",
  scope: KYA.hashString("trading:all"),
  expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  depth: 0, // Human is depth 0
});
```

---

## Provenance Operations

### createProvenance

Creates a provenance attestation documenting code origin and audit history.

```typescript
async createProvenance(params: CreateProvenanceParams): Promise<string>
```

#### Parameters

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `parentIdentityUID` | `string` | Yes | The identity this provenance belongs to |
| `sourceCodeHash` | `string` | Yes | Hash of source code (git commit, IPFS) |
| `modelHash` | `string` | No | Hash of ML model weights |
| `buildHash` | `string` | No | Hash of build artifact |
| `builderAddress` | `string` | No | Address of builder/deployer |
| `auditReportHash` | `string` | No | Hash of security audit |
| `previousVersionUID` | `string` | No | UID of previous version |
| `provenanceType` | `number` | Yes | 1=source, 2=model, 3=build, 4=audit |

#### Example

```typescript
const provenanceUID = await kya.createProvenance({
  parentIdentityUID: identityUID,
  sourceCodeHash: KYA.hashString("git:abc123def"),
  modelHash: KYA.hashString("hf:model-v1.0"),
  builderAddress: await signer.getAddress(),
  provenanceType: 1, // Source
});
```

---

## Verification

### verify

Verifies an attestation is valid, not revoked, and not expired.

```typescript
async verify(uid: string): Promise<VerifyResult>
```

#### Returns

```typescript
interface VerifyResult {
  valid: boolean;
  reason?: string;           // If invalid, why
  decoded?: Record<string, unknown>;  // Decoded attestation data
  attestation?: {
    uid: string;
    attester: string;
    recipient: string;
    time: bigint;
    revocationTime: bigint;
    expirationTime: bigint;
    refUID: string;
    schema: string;
  };
}
```

#### Example

```typescript
const result = await kya.verify(identityUID);

if (result.valid) {
  console.log("Agent:", result.decoded?.agentAddress);
  console.log("Owner:", result.decoded?.ownerAddress);
} else {
  console.log("Invalid:", result.reason);
}
```

---

## Static Properties

### KYA.Permissions

Permission flag constants for capability bitmasks.

```typescript
static Permissions = {
  TRANSACT: 1n,      // Execute financial transactions
  SIGN: 2n,          // Sign messages
  DEPLOY: 4n,        // Deploy contracts
  ADMIN: 8n,         // Administrative operations
  READ_PRIVATE: 16n, // Access private data
  DELEGATE: 32n,     // Delegate to sub-agents
  CROSS_CHAIN: 64n,  // Cross-chain operations
}
```

#### Usage

```typescript
// Single permission
const canTransact = KYA.Permissions.TRANSACT;

// Multiple permissions
const tradingBot = KYA.Permissions.TRANSACT | KYA.Permissions.SIGN;

// Check permission
const hasTransact = (permissions & KYA.Permissions.TRANSACT) > 0n;
```

---

### KYA.hashString

Utility to hash strings using keccak256.

```typescript
static hashString(value: string): string
```

#### Example

```typescript
const scopeHash = KYA.hashString("trading:execute");
// Returns: 0x...
```

---

## Error Handling

All methods throw errors with descriptive messages:

```typescript
try {
  await kya.createIdentity({ ... });
} catch (error) {
  if (error.message.includes("already exists")) {
    console.log("Agent already has an identity");
  } else if (error.message.includes("gas")) {
    console.log("Insufficient gas");
  } else {
    console.log("Unknown error:", error.message);
  }
}
```

Common errors:

| Error | Cause | Solution |
|-------|-------|----------|
| "Identity already exists for this agent" | Agent address already registered | Use existing identity or new agent address |
| "Parent identity not found" | Invalid parentIdentityUID | Verify the identity UID exists |
| "Parent identity is revoked" | Trying to add capability to revoked identity | Cannot add capabilities to revoked identities |
| "Insufficient gas" | Wallet needs more ETH | Get testnet ETH from faucet |
| "Unauthorized attester" | Resolver whitelist enabled | Contact admin to be whitelisted |

---

## TypeScript Types

Full type definitions:

```typescript
// Configuration
interface KYAConfig {
  network: "base-sepolia" | "base" | "optimism" | "arbitrum";
  signer: ethers.Signer;
  schemaUIDs?: {
    identity?: string;
    capability?: string;
    provenance?: string;
    delegation?: string;
  };
}

// Identity
interface CreateIdentityParams {
  agentAddress: string;
  ownerAddress: string;
  displayName: string;
  description?: string;
  agentDID?: string;
  metadataURI?: string;
}

// Capability
interface CreateCapabilityParams {
  parentIdentityUID: string;
  permissions: bigint;
  targetContract?: string;
  expiresAt?: number;
  conditionsHash?: string;
  trustLevel?: number;
}

// Delegation
interface CreateDelegationParams {
  delegator: string;
  delegatee: string;
  scope: string;
  expiresAt?: number;
  depth: number;
  constraints?: bigint;
}

// Provenance
interface CreateProvenanceParams {
  parentIdentityUID: string;
  sourceCodeHash: string;
  modelHash?: string;
  buildHash?: string;
  builderAddress?: string;
  auditReportHash?: string;
  previousVersionUID?: string;
  provenanceType: 1 | 2 | 3 | 4;
}

// Verification
interface VerifyResult {
  valid: boolean;
  reason?: string;
  decoded?: Record<string, unknown>;
  attestation?: {
    uid: string;
    attester: string;
    recipient: string;
    time: bigint;
    revocationTime: bigint;
    expirationTime: bigint;
    refUID: string;
    schema: string;
  };
}

// Off-chain
interface OffchainAttestation {
  uid: string;
  signature: string;
  data: {
    schema: string;
    recipient: string;
    time: number;
    expirationTime: number;
    revocable: boolean;
    refUID: string;
    data: string;
  };
  domain: EIP712Domain;
  types: Record<string, Array<{ name: string; type: string }>>;
  message: Record<string, unknown>;
}
```

---

## Network Configuration

Default contract addresses and schema UIDs by network:

### Base Sepolia (Testnet)

```typescript
{
  chainId: 84532,
  eas: "0x4200000000000000000000000000000000000021",
  schemaRegistry: "0x4200000000000000000000000000000000000020",
  schemas: {
    identity: "0x...",    // Registered schema UID
    capability: "0x...",
    provenance: "0x...",
    delegation: "0x...",
  }
}
```

### Base Mainnet

```typescript
{
  chainId: 8453,
  eas: "0x4200000000000000000000000000000000000021",
  schemaRegistry: "0x4200000000000000000000000000000000000020",
  // Schema UIDs same as testnet (deterministic)
}
```

---

## Advanced Usage

### Direct EAS Access

For advanced operations, access the underlying EAS instance:

```typescript
const kya = new KYA({ network: "base-sepolia", signer });

// Access EAS directly
const eas = kya.eas;

// Batch attestations
const tx = await eas.multiAttest([...]);

// Timestamp off-chain attestation
await eas.timestamp(offchainUID);

// Revoke off-chain attestation
await eas.revokeOffchain(offchainUID);
```

### Custom Resolvers

When deploying your own resolvers:

```typescript
const kya = new KYA({
  network: "base-sepolia",
  signer,
  schemaUIDs: {
    identity: "0xYourCustomIdentitySchemaUID",
    capability: "0xYourCustomCapabilitySchemaUID",
  },
});
```

---

*SDK Reference v1.0 | KYA Protocol*
