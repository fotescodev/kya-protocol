# KYA: Know Your Agent
## A Specification for On-Chain Agent Identity Attestations

**Version 0.1.0 | Draft | December 2025**

---

## Abstract

KYA (Know Your Agent) is a proposed specification for creating verifiable, portable identity attestations for autonomous AI agents, built on the Ethereum Attestation Service (EAS). As AI agents increasingly operate autonomously in financial systems, execute transactions, and interact with both humans and other agents, the need for a standardized identity layer has become critical. KYA provides a composable schema architecture enabling agents to carry cryptographically verifiable credentials attesting to their identity, capabilities, provenance, and authorization chains. This specification defines the core schemas, resolver patterns, integration interfaces, and security requirements for implementing trustworthy agent identity across the decentralized AI ecosystem.

---

## 1. Problem statement and market context

The emergence of autonomous AI agents represents a fundamental shift in how digital systems interact with economic infrastructure. Agents now autonomously browse the web, execute code, manage wallets, conduct transactions, and negotiate with other agents—all without continuous human oversight. This capability explosion has created an urgent identity gap that current infrastructure cannot address.

**The core problem is tripartite.** First, agents lack portable, verifiable identity. Unlike humans who carry identity documents or corporations that maintain legal registrations, agents exist as ephemeral processes with no standardized way to prove who they are, who created them, or what they're authorized to do. Second, trust establishment between agents and services requires custom integration for every interaction. A payment processor, API provider, or counterparty agent has no universal mechanism to verify an agent's claims or capabilities before engaging. Third, there is no accountability infrastructure—when an agent misbehaves, causes harm, or fails to meet obligations, tracing responsibility back to developers, operators, or organizations is technically infeasible at scale.

**Market dynamics underscore the urgency.** The agent economy is accelerating rapidly, with autonomous agents now managing significant capital flows. Kite.ai's KitePass system tracks agents handling programmable payment permissions. Circle's programmable wallets enable agent-controlled treasury operations. The x402 protocol facilitates machine-to-machine micropayments. Yet each system has developed proprietary identity solutions, creating fragmentation that limits interoperability and increases integration costs.

Existing approaches reveal the gap. Microsoft Entra Agent ID provides enterprise-grade identity but remains siloed within the Microsoft ecosystem and lacks decentralized verification. Google's A2A Protocol defines Agent Cards for discovery but offers no on-chain attestation or provenance verification. The OpenID Foundation's AIIM working group has identified critical gaps in agent identity standards but has not yet produced finalized specifications. ERC-8004 proposes on-chain agent registries but focuses on discovery rather than verifiable credentials.

**KYA addresses this gap by building on EAS**, an open-source, permissionless attestation infrastructure already deployed across Ethereum mainnet, Base, Optimism, Arbitrum, and other L2s. By inheriting EAS's established legitimacy—its contracts are battle-tested, thoroughly audited by Spearbit with 100% coverage, and already trusted by production systems like Coinbase Verifications and Gitcoin Passport—KYA can achieve ecosystem adoption without requiring new protocol deployment. The specification is designed to be implementable in weeks, not years.

---

## 2. Design principles

KYA's architecture is governed by seven principles derived from analyzing successful identity specifications and the unique requirements of autonomous agents:

**Composability over monolithism.** Rather than defining a single attestation schema that attempts to capture all agent properties, KYA employs a multi-schema architecture where different attestation types can be combined. An agent's complete identity profile emerges from the composition of identity attestations, capability attestations, provenance attestations, and delegation attestations. This mirrors how Gitcoin Passport aggregates multiple "stamps" into a composite score.

**Decentralized verification with centralized discoverability.** Attestations are cryptographically verifiable by anyone without requiring trust in centralized infrastructure. However, discovery and indexing can leverage centralized services (like EAS indexers) without compromising security properties. An attestation's validity depends only on cryptographic proofs, not on the availability of any particular service.

**Progressive trust establishment.** KYA supports tiered trust models ranging from minimal pseudonymous identity to fully verified organizational attestations. A new agent might begin with only a basic identity attestation, progressively accumulating capability attestations, reputation records, and third-party verifications as it operates. This accommodates the practical reality that agents may need to begin operating before comprehensive verification is possible.

**Gas efficiency for L2 deployment.** Primary deployment targets are L2 networks (Base, Optimism, Arbitrum) where gas costs enable practical attestation volumes. Schema designs prioritize fixed-size types (`bytes32`, `uint256`, `address`) over dynamic types (`string`, `bytes[]`) where semantically appropriate, reducing both storage and verification costs.

**Off-chain by default, on-chain when necessary.** Most KYA attestations should be created and verified off-chain using EIP-712 signatures, eliminating gas costs for routine credential issuance. On-chain attestations are reserved for high-value or programmatically-consumed credentials where smart contract access is required. Revocation registries remain on-chain to ensure global consistency.

**Backwards compatibility with existing standards.** KYA schemas are designed to complement, not compete with, existing identity standards. A2A Agent Card data can be embedded or referenced within KYA attestations. W3C DIDs can serve as agent identifiers. ERC-8004 registration files can reference KYA attestation UIDs. The goal is interoperability across the emerging agent identity ecosystem.

**Human accountability anchoring.** Every agent identity chain must ultimately terminate at a human-controlled address or legally-registered organization. This ensures that no matter how many layers of delegation exist, accountability can be traced to responsible parties. This principle is non-negotiable for regulatory compliance and harm prevention.

---

## 3. Technical specification

### 3.1 Schema architecture overview

KYA defines four core schema types that compose to form complete agent identity profiles:

| Schema | Purpose | Typical Attester |
|--------|---------|------------------|
| **KYA-Identity** | Core agent identification and ownership | Agent developer/operator |
| **KYA-Capability** | Declares specific operational permissions | Service providers, platforms |
| **KYA-Provenance** | Attests to agent origin and development chain | Build systems, auditors |
| **KYA-Delegation** | Records authorization chains | Delegating principals |

Each schema is registered on EAS with a designated resolver contract. Attestations reference each other through the `refUID` field, creating verifiable credential chains.

### 3.2 KYA-Identity schema

The core identity schema establishes an agent's fundamental identity claims:

```solidity
// Schema Definition
bytes32 agentDID,           // W3C DID identifier hash (keccak256)
address agentAddress,       // Primary on-chain address
address ownerAddress,       // Human/org controller address
bytes32 displayNameHash,    // keccak256(display name)
bytes32 descriptionHash,    // keccak256(description)
uint64 createdAt,           // Unix timestamp
uint8 version,              // Schema version (1)
bytes32 metadataURI         // IPFS CID or URL hash for extended data
```

**Schema UID generation**: The schema UID is deterministically derived from `keccak256(schema_string, resolver_address, revocable)`. For KYA-Identity on Base:

```
Schema: "bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI"
Resolver: KYAIdentityResolver (to be deployed)
Revocable: true
```

**Field semantics**:
- `agentDID`: Hash of a W3C DID string (e.g., `did:ethr:base:0x1234...`). Using keccak256 enables efficient on-chain storage while maintaining DID compatibility.
- `agentAddress`: The Ethereum address the agent uses for signing and transactions. Must be unique per identity attestation.
- `ownerAddress`: The address of the human or organization ultimately responsible for this agent. For multi-sig ownership, use the Safe address.
- `displayNameHash` / `descriptionHash`: Hashes of human-readable strings. Full strings stored off-chain in metadataURI document.
- `metadataURI`: Hash of an IPFS CID or HTTPS URL containing extended metadata in JSON format, including A2A-compatible agent card data.

**Extended metadata format** (stored at metadataURI):

```json
{
  "kyaVersion": "0.1.0",
  "displayName": "TradingBot Alpha",
  "description": "Autonomous market-making agent",
  "organizationName": "Acme AI Corp",
  "organizationDID": "did:web:acme-ai.com",
  "agentCard": {
    "protocolVersion": "1.0",
    "capabilities": { "streaming": true, "pushNotifications": false },
    "skills": [...],
    "securitySchemes": {...}
  },
  "iconUrl": "https://...",
  "documentationUrl": "https://...",
  "contactEmail": "support@acme-ai.com"
}
```

### 3.3 KYA-Capability schema

Capability attestations declare what an agent is authorized to do:

```solidity
// Schema Definition
bytes32 capabilityId,       // Unique capability identifier
uint256 permissions,        // Bitmask of granted permissions
address targetContract,     // Contract/service this applies to (0x0 for global)
uint64 grantedAt,          // Unix timestamp of grant
uint64 expiresAt,          // Expiration (0 = never)
bytes32 conditionsHash,    // Hash of JSON conditions document
uint8 trustLevel           // 0-255 trust score from attester
```

**Permission bitmask** (recommended allocation):

| Bit | Permission |
|-----|------------|
| 0 | TRANSACT - Execute financial transactions |
| 1 | SIGN - Sign messages on behalf of principal |
| 2 | DEPLOY - Deploy contracts |
| 3 | ADMIN - Administrative operations |
| 4 | READ_PRIVATE - Access private data |
| 5 | DELEGATE - Delegate permissions to sub-agents |
| 6 | CROSS_CHAIN - Operate across chains |
| 7-15 | Reserved for future standard use |
| 16-255 | Application-specific permissions |

**Conditions document** (stored off-chain, hash in conditionsHash):

```json
{
  "spendingLimits": {
    "perTransaction": "1000000000000000000",
    "dailyAggregate": "10000000000000000000",
    "asset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  },
  "temporalConstraints": {
    "validHours": [9, 17],
    "timezone": "UTC",
    "validDays": [1, 2, 3, 4, 5]
  },
  "geographicConstraints": {
    "excludedCountries": ["KP", "IR"]
  }
}
```

**RefUID requirement**: Capability attestations MUST reference a valid KYA-Identity attestation via `refUID`. Capability attestations without valid parent identity attestations MUST be rejected.

### 3.4 KYA-Provenance schema

Provenance attestations establish the development chain and origin of an agent:

```solidity
// Schema Definition
bytes32 sourceCodeHash,     // Git commit or IPFS hash of source
bytes32 modelHash,          // Hash of ML model weights (if applicable)
bytes32 buildHash,          // Reproducible build artifact hash
address builderAddress,     // Address of build system/developer
bytes32 auditReportHash,    // Hash of security audit (0x0 if none)
uint64 buildTimestamp,      // When agent was built
bytes32 previousVersionUID, // Reference to prior version (0x0 if first)
uint8 provenanceType        // 1=source, 2=model, 3=build, 4=audit
```

**Provenance chain**: Provenance attestations form a linked list via `previousVersionUID`, enabling verification of the complete development history. A verifier can traverse from current to genesis provenance to establish chain of custody.

**Provenance types**:
- **Source (1)**: Attests to source code state at a point in time
- **Model (2)**: Attests to ML model weights and training provenance
- **Build (3)**: Attests to reproducible build from source to artifact
- **Audit (4)**: Third-party security or behavioral audit attestation

### 3.5 KYA-Delegation schema

Delegation attestations record authorization chains:

```solidity
// Schema Definition
address delegator,          // Address granting delegation
address delegatee,          // Address receiving delegation
bytes32 scope,              // Scope identifier (capability hash or wildcard)
uint256 constraints,        // Delegation constraints bitmask
uint64 delegatedAt,         // Timestamp of delegation
uint64 expiresAt,           // Expiration (0 = never)
uint8 depth                 // Delegation depth (1 = direct from owner)
```

**Delegation depth enforcement**: The `depth` field tracks how many levels of delegation separate the delegatee from the original human owner. Resolvers SHOULD enforce maximum delegation depths (recommended: 3) to prevent unbounded delegation chains that obscure accountability.

**Scope semantics**:
- `0x0...0`: Wildcard - all capabilities delegated
- Specific `bytes32`: Only the capability with matching `capabilityId` is delegated
- `keccak256("READ_ONLY")`: Standard scope for read-only delegation

---

## 4. Resolver contract patterns

### 4.1 KYAIdentityResolver

The identity resolver enforces core identity invariants:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { SchemaResolver } from "@eas/contracts/resolver/SchemaResolver.sol";
import { IEAS, Attestation } from "@eas/contracts/IEAS.sol";

contract KYAIdentityResolver is SchemaResolver {
    mapping(address => bytes32) public agentToIdentity;
    mapping(address => bool) public authorizedAttesters;
    address public admin;
    
    error UnauthorizedAttester();
    error AgentAlreadyRegistered();
    error InvalidOwnerAddress();
    
    constructor(IEAS eas, address _admin) SchemaResolver(eas) {
        admin = _admin;
    }
    
    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override returns (bool) {
        // Decode attestation data
        (
            bytes32 agentDID,
            address agentAddress,
            address ownerAddress,
            , , , ,
        ) = abi.decode(
            attestation.data,
            (bytes32, address, address, bytes32, bytes32, uint64, uint8, bytes32)
        );
        
        // Enforce authorized attesters (optional, remove for permissionless)
        if (!authorizedAttesters[attestation.attester]) {
            revert UnauthorizedAttester();
        }
        
        // Enforce owner is not zero address
        if (ownerAddress == address(0)) {
            revert InvalidOwnerAddress();
        }
        
        // Enforce one identity per agent address
        if (agentToIdentity[agentAddress] != bytes32(0)) {
            revert AgentAlreadyRegistered();
        }
        
        // Record mapping
        agentToIdentity[agentAddress] = attestation.uid;
        
        return true;
    }
    
    function onRevoke(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override returns (bool) {
        // Decode to get agent address
        (, address agentAddress, , , , , , ) = abi.decode(
            attestation.data,
            (bytes32, address, address, bytes32, bytes32, uint64, uint8, bytes32)
        );
        
        // Clear mapping on revocation
        delete agentToIdentity[agentAddress];
        
        return true;
    }
    
    function addAuthorizedAttester(address attester) external {
        require(msg.sender == admin, "Only admin");
        authorizedAttesters[attester] = true;
    }
}
```

### 4.2 KYACapabilityResolver

The capability resolver validates parent identity references:

```solidity
contract KYACapabilityResolver is SchemaResolver {
    bytes32 public immutable identitySchemaUID;
    
    error InvalidParentIdentity();
    error ParentIdentityRevoked();
    
    constructor(IEAS eas, bytes32 _identitySchemaUID) SchemaResolver(eas) {
        identitySchemaUID = _identitySchemaUID;
    }
    
    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal view override returns (bool) {
        // Require valid refUID pointing to identity attestation
        if (attestation.refUID == bytes32(0)) {
            revert InvalidParentIdentity();
        }
        
        // Fetch parent attestation
        Attestation memory parent = _eas.getAttestation(attestation.refUID);
        
        // Validate parent is correct schema
        if (parent.schema != identitySchemaUID) {
            revert InvalidParentIdentity();
        }
        
        // Validate parent is not revoked
        if (parent.revocationTime != 0) {
            revert ParentIdentityRevoked();
        }
        
        // Validate parent is not expired
        if (parent.expirationTime != 0 && 
            parent.expirationTime < block.timestamp) {
            revert InvalidParentIdentity();
        }
        
        return true;
    }
    
    function onRevoke(
        Attestation calldata,
        uint256
    ) internal pure override returns (bool) {
        return true;
    }
}
```

### 4.3 Gas optimization techniques

Resolver contracts should minimize gas consumption:

- **Use immutable variables** for schema UIDs and configuration that won't change
- **Prefer view functions** where state modification isn't required
- **Batch validations** when checking multiple conditions
- **Short-circuit on failure** with early returns
- **Minimize storage writes** - only store data that cannot be derived from attestation content
- **Use events for indexing** rather than storage when data is only needed off-chain

**Estimated gas costs** (Base L2):
- Schema registration: ~150,000 gas (~$0.01)
- Identity attestation with resolver: ~250,000 gas (~$0.02)
- Capability attestation with resolver: ~200,000 gas (~$0.015)
- Revocation: ~50,000 gas (~$0.004)

---

## 5. Integration patterns

### 5.1 Kite.ai integration

Kite's KitePass architecture provides agent identity and programmable wallet permissions. KYA attestations integrate as external credential references:

```typescript
// Integration: Link KYA attestation to KitePass
async function linkKYAToKitePass(
  kiteClient: KiteClient,
  agentAddress: string,
  kyaIdentityUID: bytes32
) {
  // Store KYA UID in agent's reputation record
  await kiteClient.updateAgentMetadata(agentAddress, {
    externalCredentials: [{
      type: 'KYA-IDENTITY',
      network: 'base',
      uid: kyaIdentityUID,
      schemaUID: KYA_IDENTITY_SCHEMA_UID
    }]
  });
}

// Verification: Check KYA before session key derivation
async function verifyKYABeforeSession(
  eas: EAS,
  agentAddress: string
): Promise<boolean> {
  const attestation = await eas.getAttestation(
    await kiteClient.getAgentMetadata(agentAddress).externalCredentials
      .find(c => c.type === 'KYA-IDENTITY')?.uid
  );
  
  return attestation && 
         attestation.revocationTime === 0n &&
         (attestation.expirationTime === 0n || 
          attestation.expirationTime > BigInt(Date.now() / 1000));
}
```

**Integration hook points**:
- KitePass creation: Require KYA-Identity attestation before agent registration
- Session key derivation: Verify KYA validity before granting ephemeral keys
- Spending rules: Link spending limits to KYA-Capability attestations
- Reputation aggregation: Include KYA trust levels in composite reputation

### 5.2 x402 protocol integration

The x402 payment protocol can require KYA verification before settling payments:

```typescript
// Extended PaymentRequirements with KYA
interface KYAPaymentRequirements extends PaymentRequirements {
  extra: {
    kyaRequired: boolean;
    kyaSchemaUID: string;          // Required schema UID
    minTrustLevel?: number;        // Minimum trust score (0-255)
    requiredCapabilities?: number; // Required permission bitmask
    trustedAttesters?: string[];   // Whitelist of valid attesters
  };
}

// Custom Facilitator with KYA verification
class KYAFacilitator {
  private eas: EAS;
  
  async verify(request: VerifyRequest): Promise<VerifyResponse> {
    const { paymentHeader, paymentRequirements } = request;
    
    // Standard x402 verification
    const baseResult = await this.baseVerify(paymentHeader, paymentRequirements);
    if (!baseResult.isValid) return baseResult;
    
    // KYA verification if required
    if (paymentRequirements.extra?.kyaRequired) {
      const payerAddress = extractPayerAddress(paymentHeader);
      const kyaValid = await this.verifyKYA(
        payerAddress,
        paymentRequirements.extra
      );
      
      if (!kyaValid) {
        return { 
          isValid: false, 
          invalidReason: 'KYA attestation invalid or insufficient' 
        };
      }
    }
    
    return { isValid: true, invalidReason: null };
  }
  
  private async verifyKYA(
    address: string, 
    requirements: KYAPaymentRequirements['extra']
  ): Promise<boolean> {
    // Query attestations for address
    const attestations = await this.queryKYAAttestations(address);
    
    // Find valid attestation meeting requirements
    return attestations.some(att => 
      att.revocationTime === 0n &&
      this.meetsRequirements(att, requirements)
    );
  }
}
```

**Payment flow with KYA**:
1. Client requests resource → Server returns 402 with KYA requirements
2. Client signs payment with X-KYA-ATTESTATION header containing UID
3. Facilitator verifies payment AND KYA attestation validity
4. If both valid, settlement proceeds
5. Resource delivered with X-PAYMENT-RESPONSE

### 5.3 Circle Arc integration

Circle's programmable wallets can incorporate KYA verification into compliance flows:

```typescript
// Pre-transaction KYA verification for Circle wallets
async function circleKYACompliance(
  circleClient: CircleClient,
  eas: EAS,
  transaction: TransactionRequest
): Promise<ComplianceResult> {
  const walletAddress = transaction.walletAddress;
  
  // Fetch KYA attestation
  const kyaUID = await lookupKYAForAddress(walletAddress);
  if (!kyaUID) {
    return { approved: false, reason: 'No KYA attestation found' };
  }
  
  const attestation = await eas.getAttestation(kyaUID);
  
  // Verify attestation validity
  if (attestation.revocationTime !== 0n) {
    return { approved: false, reason: 'KYA attestation revoked' };
  }
  
  // Decode capability attestations
  const capabilities = await fetchCapabilityAttestations(kyaUID);
  
  // Check transaction against capabilities
  const txCapability = deriveRequiredCapability(transaction);
  const hasCapability = capabilities.some(cap => 
    (cap.permissions & txCapability) === txCapability &&
    (cap.expiresAt === 0n || cap.expiresAt > BigInt(Date.now() / 1000))
  );
  
  if (!hasCapability) {
    return { approved: false, reason: 'Insufficient capabilities' };
  }
  
  return { approved: true, attestationUID: kyaUID };
}

// Webhook handler for transaction notifications
async function handleCircleWebhook(notification: CircleNotification) {
  if (notification.type === 'transactions.outbound') {
    const compliance = await circleKYACompliance(
      circleClient,
      eas,
      notification.transaction
    );
    
    if (!compliance.approved) {
      await circleClient.freezeWallet(notification.walletId);
      await alertOperator(compliance.reason);
    }
  }
}
```

### 5.4 EAS SDK usage patterns

Complete SDK patterns for KYA operations:

```typescript
import { 
  EAS, 
  SchemaEncoder, 
  SchemaRegistry,
  NO_EXPIRATION,
  ZERO_BYTES32 
} from '@ethereum-attestation-service/eas-sdk';

// Contract addresses (Base mainnet)
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';
const SCHEMA_REGISTRY = '0x4200000000000000000000000000000000000020';

// Initialize
const eas = new EAS(EAS_ADDRESS);
eas.connect(signer);

// Register KYA-Identity schema
async function registerIdentitySchema(resolverAddress: string): Promise<string> {
  const registry = new SchemaRegistry(SCHEMA_REGISTRY);
  registry.connect(signer);
  
  const tx = await registry.register({
    schema: 'bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI',
    resolverAddress,
    revocable: true
  });
  
  return await tx.wait(); // Returns schema UID
}

// Create identity attestation
async function createIdentityAttestation(
  schemaUID: string,
  agentConfig: AgentConfig
): Promise<string> {
  const encoder = new SchemaEncoder(
    'bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI'
  );
  
  const encodedData = encoder.encodeData([
    { name: 'agentDID', value: keccak256(agentConfig.did), type: 'bytes32' },
    { name: 'agentAddress', value: agentConfig.address, type: 'address' },
    { name: 'ownerAddress', value: agentConfig.owner, type: 'address' },
    { name: 'displayNameHash', value: keccak256(agentConfig.name), type: 'bytes32' },
    { name: 'descriptionHash', value: keccak256(agentConfig.description), type: 'bytes32' },
    { name: 'createdAt', value: BigInt(Math.floor(Date.now() / 1000)), type: 'uint64' },
    { name: 'version', value: 1, type: 'uint8' },
    { name: 'metadataURI', value: keccak256(agentConfig.metadataURI), type: 'bytes32' }
  ]);
  
  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: agentConfig.address,
      expirationTime: NO_EXPIRATION,
      revocable: true,
      refUID: ZERO_BYTES32,
      data: encodedData
    }
  });
  
  return await tx.wait(); // Returns attestation UID
}

// Create off-chain attestation (zero gas)
async function createOffchainIdentityAttestation(
  schemaUID: string,
  agentConfig: AgentConfig
): Promise<OffchainAttestation> {
  const offchain = await eas.getOffchain();
  const encoder = new SchemaEncoder('...');
  const encodedData = encoder.encodeData([...]);
  
  return await offchain.signOffchainAttestation({
    recipient: agentConfig.address,
    expirationTime: NO_EXPIRATION,
    time: BigInt(Math.floor(Date.now() / 1000)),
    revocable: true,
    schema: schemaUID,
    refUID: ZERO_BYTES32,
    data: encodedData
  }, signer);
}

// Verify attestation
async function verifyKYAAttestation(uid: string): Promise<VerificationResult> {
  const attestation = await eas.getAttestation(uid);
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  
  // Check revocation
  if (attestation.revocationTime !== 0n) {
    return { valid: false, reason: 'Attestation revoked' };
  }
  
  // Check expiration
  if (attestation.expirationTime !== 0n && attestation.expirationTime < now) {
    return { valid: false, reason: 'Attestation expired' };
  }
  
  // Decode and return data
  const encoder = new SchemaEncoder('...');
  const decoded = encoder.decodeData(attestation.data);
  
  return { 
    valid: true, 
    attestation,
    decoded 
  };
}
```

---

## 6. Security considerations

### 6.1 Cryptographic foundations

KYA inherits EAS's cryptographic security model based on EIP-712 typed data signing:

**Domain separator** construction prevents cross-chain and cross-contract replay:
```javascript
{
  name: "EAS Attestation",
  version: "1.0.1",
  chainId: 8453,  // Base
  verifyingContract: "0x4200000000000000000000000000000000000021"
}
```

**Signature verification** supports both EOA (ECDSA recovery) and smart contract wallets (EIP-1271):
```solidity
function verifySignature(address signer, bytes32 hash, bytes signature) {
  if (signer.code.length > 0) {
    // Smart contract wallet - call isValidSignature
    return IERC1271(signer).isValidSignature(hash, signature) == 0x1626ba7e;
  } else {
    // EOA - ECDSA recovery
    return ECDSA.recover(hash, signature) == signer;
  }
}
```

### 6.2 Threat model

| Threat | Attack Vector | Mitigation |
|--------|--------------|------------|
| Replay attacks | Reusing valid signatures | Nonces, chainId, verifyingContract in domain |
| Attestation forgery | Fake attestations from unauthorized parties | Resolver whitelisting, attester verification |
| Identity theft | Claiming another agent's identity | One-identity-per-address resolver enforcement |
| Delegation abuse | Unbounded sub-delegation | Maximum delegation depth enforcement |
| Revocation bypass | Using revoked credentials | On-chain revocation registry, real-time checks |
| Front-running | Front-running attestation creation | Commit-reveal for sensitive operations |
| Signature malleability | Modified signatures validating | OpenZeppelin ECDSA with low-S enforcement |

### 6.3 Revocation requirements

Revocation is the primary mechanism for invalidating compromised or obsolete credentials:

**On-chain revocation** (immediate, global visibility):
```typescript
await eas.revoke({
  schema: schemaUID,
  data: { uid: attestationUID }
});
```

**Off-chain attestation revocation** (on-chain registry):
```typescript
await eas.revokeOffchain(attestationUID);
```

**Revocation checking** is MANDATORY before trusting any KYA attestation:
```typescript
const isRevoked = attestation.revocationTime !== 0n;
```

**Cascading revocation**: When a KYA-Identity attestation is revoked, all capability attestations referencing it via refUID SHOULD be treated as invalid. Verifiers MUST check parent attestation status.

### 6.4 Privacy considerations

**Selective disclosure**: For privacy-sensitive deployments, attestation data can be structured as:
```solidity
bytes32 dataHash,     // Hash of actual data
bytes32 merkleRoot    // Root of Merkle tree enabling selective disclosure
```

Verifiers receive only necessary Merkle proofs without accessing complete data.

**Off-chain storage**: Sensitive metadata should be stored off-chain (IPFS with encryption, private databases) with only hashes on-chain.

**Zero-knowledge integration**: Future versions may support ZK proofs enabling verification of attestation properties without revealing underlying data.

---

## 7. Implementation roadmap

### Phase 1: Foundation (Weeks 1-3)

**Deliverables**:
- Deploy KYA-Identity and KYA-Capability schemas on Base Sepolia
- Implement KYAIdentityResolver and KYACapabilityResolver contracts
- Publish TypeScript SDK with attestation creation/verification
- Documentation and integration guide

**Success criteria**:
- Schemas registered and resolvable
- 100% resolver test coverage
- SDK published to npm
- Integration with one testnet application

### Phase 2: Production deployment (Weeks 4-6)

**Deliverables**:
- Mainnet deployment on Base, Optimism, Arbitrum
- KYA-Provenance and KYA-Delegation schemas
- Integration with x402 testnet facilitator
- Security audit (informal review by experienced auditors)

**Success criteria**:
- Mainnet schemas immutable and documented
- At least 100 attestations created
- One production integration live
- No critical vulnerabilities identified

### Phase 3: Ecosystem integration (Weeks 7-12)

**Deliverables**:
- Kite.ai KitePass integration
- Circle Arc compliance module
- Public attestation explorer UI
- Multi-language SDK support (Python, Go)

**Success criteria**:
- Three production integrations
- 1,000+ attestations
- Community contributions to spec
- Formal audit completed

### Phase 4: Governance and evolution (Ongoing)

**Deliverables**:
- KYA Improvement Proposal (KIP) process
- Schema versioning framework
- Governance multisig for resolver upgrades
- Extension mechanism for custom schemas

---

## 8. Governance and evolution

### 8.1 Schema versioning

Schemas are immutable once registered. Evolution follows an append-only pattern:

- **Minor updates**: New optional fields in metadata document
- **Major updates**: New schema UID with migration attestation linking old to new
- **Deprecation**: Announcement period, then resolvers cease accepting new attestations

Version field in schema (`uint8 version`) indicates schema generation for verification logic.

### 8.2 Extension mechanism

Third parties can register extension schemas that reference KYA core schemas:

```solidity
// Example: Platform-specific capability extension
bytes32 platformId,         // Platform identifier
bytes platformSpecificData, // ABI-encoded platform data

// refUID MUST point to KYA-Capability attestation
```

Extensions MUST reference parent attestations via refUID. The core KYA schemas remain unchanged while extensions add domain-specific capabilities.

### 8.3 Improvement proposal process

Inspired by the EIP process, KYA Improvement Proposals (KIPs) follow:

1. **Draft**: Author publishes proposal with rationale
2. **Review**: Community feedback period (minimum 14 days)
3. **Accepted**: Implementation begins
4. **Final**: Deployed and documented

Breaking changes require extended review and migration tooling.

---

## Appendix A: Complete schema definitions

### A.1 KYA-Identity

```
Schema String:
bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI

Revocable: true
Resolver: KYAIdentityResolver

Field Encodings:
- agentDID: keccak256(did_string)
- displayNameHash: keccak256(utf8_bytes(display_name))
- descriptionHash: keccak256(utf8_bytes(description))
- metadataURI: keccak256(ipfs_cid) or keccak256(https_url)
```

### A.2 KYA-Capability

```
Schema String:
bytes32 capabilityId,uint256 permissions,address targetContract,uint64 grantedAt,uint64 expiresAt,bytes32 conditionsHash,uint8 trustLevel

Revocable: true
Resolver: KYACapabilityResolver
RefUID Required: Must reference KYA-Identity attestation
```

### A.3 KYA-Provenance

```
Schema String:
bytes32 sourceCodeHash,bytes32 modelHash,bytes32 buildHash,address builderAddress,bytes32 auditReportHash,uint64 buildTimestamp,bytes32 previousVersionUID,uint8 provenanceType

Revocable: true
Resolver: KYAProvenanceResolver
RefUID Required: Must reference KYA-Identity attestation
```

### A.4 KYA-Delegation

```
Schema String:
address delegator,address delegatee,bytes32 scope,uint256 constraints,uint64 delegatedAt,uint64 expiresAt,uint8 depth

Revocable: true
Resolver: KYADelegationResolver
RefUID Required: Must reference parent delegation or KYA-Identity attestation
```

---

## Appendix B: Contract addresses

### B.1 EAS infrastructure

| Network | EAS Contract | Schema Registry |
|---------|--------------|-----------------|
| Ethereum Mainnet | `0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587` | `0xA7b39296258348C78294F95B872b282326A97BDF` |
| Base | `0x4200000000000000000000000000000000000021` | `0x4200000000000000000000000000000000000020` |
| Optimism | `0x4200000000000000000000000000000000000021` | `0x4200000000000000000000000000000000000020` |
| Arbitrum One | `0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458` | `0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB` |
| Base Sepolia | `0x4200000000000000000000000000000000000021` | `0x4200000000000000000000000000000000000020` |

### B.2 KYA contracts (to be deployed)

| Network | Identity Resolver | Capability Resolver | Schema UIDs |
|---------|-------------------|---------------------|-------------|
| Base Sepolia | TBD | TBD | TBD |
| Base Mainnet | TBD | TBD | TBD |

---

## Appendix C: Reference implementation

Complete TypeScript SDK available at: `github.com/[tbd]/kya-sdk`

```typescript
// Installation
npm install @kya/sdk

// Usage
import { KYA, createIdentityAttestation, verifyAttestation } from '@kya/sdk';

const kya = new KYA({ network: 'base', signer });

// Create identity
const uid = await kya.createIdentity({
  agentAddress: '0x...',
  ownerAddress: '0x...',
  displayName: 'TradingBot Alpha',
  description: 'Autonomous market-making agent',
  metadataURI: 'ipfs://Qm...'
});

// Verify identity
const result = await kya.verify(uid);
console.log(result.valid, result.attestation);

// Add capability
const capabilityUID = await kya.addCapability({
  parentIdentity: uid,
  permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
  expiresAt: Math.floor(Date.now() / 1000) + 86400 * 365
});
```

---

## Appendix D: Comparison with existing approaches

| Feature | KYA | A2A Agent Cards | Microsoft Entra | ERC-8004 |
|---------|-----|-----------------|-----------------|----------|
| On-chain verification | ✅ EAS-native | ❌ Off-chain only | ❌ Cloud-based | ✅ Registry |
| Portable credentials | ✅ Cross-platform | ⚠️ Per-host | ❌ Tenant-scoped | ✅ NFT-based |
| Provenance attestation | ✅ Full chain | ❌ None | ❌ None | ⚠️ Limited |
| Capability attestation | ✅ Composable | ✅ Skills list | ✅ OAuth scopes | ❌ None |
| Delegation chains | ✅ With depth limits | ❌ None | ✅ On-behalf-of | ❌ None |
| Revocation | ✅ On-chain registry | ❌ Manual | ✅ Centralized | ⚠️ NFT burn |
| Gas efficiency | ✅ L2 optimized | N/A | N/A | ⚠️ Mainnet |
| Ecosystem integration | ✅ EAS ecosystem | ⚠️ A2A only | ⚠️ Microsoft only | ✅ Ethereum |

---

## Acknowledgments

This specification builds upon the work of the Ethereum Attestation Service team, the A2A Protocol authors at Google, the OpenID Foundation AIIM community group, and the broader agent identity research community. Special recognition to Coinbase Verifications and Gitcoin Passport for demonstrating production EAS patterns.

---

## License

This specification is released under CC0 1.0 Universal (Public Domain Dedication). Implementations may use any license.

---

*KYA is a proposed specification inviting collaboration from the agent ecosystem. For questions, contributions, or integration partnerships, open an issue or submit a pull request to the specification repository.*