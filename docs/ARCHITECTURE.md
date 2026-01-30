# KYA Protocol Architecture

> Technical deep dive into the system design, component interactions, and data flows that power the Know Your Agent identity standard.

---

## System Overview

```
                           ┌─────────────────────────────────────────────────────────────────┐
                           │                     KYA PROTOCOL STACK                          │
                           ├─────────────────────────────────────────────────────────────────┤
                           │                                                                 │
                           │   ┌─────────────────────────────────────────────────────────┐   │
                           │   │                    APPLICATION LAYER                    │   │
                           │   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
                           │   │  │  x402   │ │ Kite.ai │ │  DeFi   │ │  Your   │       │   │
                           │   │  │ Payments│ │ Agents  │ │Protocols│ │   App   │       │   │
                           │   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
                           │   └───────┼──────────┼──────────┼──────────┼─────────────┘   │
                           │           └──────────┴──────────┴──────────┘                 │
                           │                            │                                  │
                           │   ┌────────────────────────▼────────────────────────────┐    │
                           │   │                     SDK LAYER                        │    │
                           │   │            @kya/sdk (TypeScript/JavaScript)          │    │
                           │   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │    │
                           │   │  │ Identity │ │Capability│ │Delegation│ │Provenance│ │    │
                           │   │  │  Module  │ │  Module  │ │  Module  │ │ Module  │  │    │
                           │   │  └──────────┘ └──────────┘ └──────────┘ └─────────┘  │    │
                           │   └────────────────────────┬────────────────────────────┘    │
                           │                            │                                  │
                           │   ┌────────────────────────▼────────────────────────────┐    │
                           │   │                   RESOLVER LAYER                     │    │
                           │   │  ┌───────────────────┐  ┌───────────────────────┐   │    │
                           │   │  │KYAIdentityResolver│  │KYACapabilityResolver  │   │    │
                           │   │  │  • Whitelist      │  │  • Parent validation  │   │    │
                           │   │  │  • One-per-agent  │  │  • Expiry checking    │   │    │
                           │   │  │  • 2-step admin   │  │  • View-only          │   │    │
                           │   │  └───────────────────┘  └───────────────────────┘   │    │
                           │   └────────────────────────┬────────────────────────────┘    │
                           │                            │                                  │
                           │   ┌────────────────────────▼────────────────────────────┐    │
                           │   │              ETHEREUM ATTESTATION SERVICE            │    │
                           │   │           (EAS - Base, Optimism, Arbitrum)           │    │
                           │   │  ┌──────────────────┐  ┌──────────────────────────┐  │    │
                           │   │  │  SchemaRegistry  │  │        EAS Core          │  │    │
                           │   │  │  0x4200...0020   │  │      0x4200...0021       │  │    │
                           │   │  └──────────────────┘  └──────────────────────────┘  │    │
                           │   └─────────────────────────────────────────────────────┘    │
                           │                                                                 │
                           └─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Attestation Schemas

KYA defines four composable schemas that form a complete agent identity:

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                  SCHEMA RELATIONSHIPS                    │
                    └─────────────────────────────────────────────────────────┘

        ┌───────────────────────────────────────────────────────────────────────────┐
        │                                                                           │
        │                        ┌──────────────────┐                               │
        │                        │   KYA-IDENTITY   │                               │
        │                        │   (Foundation)   │                               │
        │                        └────────┬─────────┘                               │
        │                                 │                                         │
        │              ┌──────────────────┼──────────────────┐                      │
        │              │                  │                  │                      │
        │              ▼                  ▼                  ▼                      │
        │   ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐           │
        │   │  KYA-CAPABILITY  │  │KYA-PROVENANCE│  │  KYA-DELEGATION  │           │
        │   │  (Permissions)   │  │ (Code Origin)│  │   (Authority)    │           │
        │   └──────────────────┘  └──────────────┘  └────────┬─────────┘           │
        │                                                    │                      │
        │                                                    ▼                      │
        │                                           ┌──────────────────┐            │
        │                                           │  Sub-Delegation  │            │
        │                                           │  (Depth ≤ 3)     │            │
        │                                           └──────────────────┘            │
        │                                                                           │
        └───────────────────────────────────────────────────────────────────────────┘
```

#### Schema 1: KYA-Identity

```solidity
// The agent's passport - answers "Who is this?"
struct KYAIdentity {
    bytes32 agentDID;           // W3C DID identifier (hashed)
    address agentAddress;       // Agent's wallet address
    address ownerAddress;       // Human/org controller ← ACCOUNTABILITY ANCHOR
    bytes32 displayNameHash;    // keccak256(display name)
    bytes32 descriptionHash;    // keccak256(description)
    uint64  createdAt;          // Registration timestamp
    uint8   version;            // Schema version
    bytes32 metadataURI;        // IPFS/HTTPS metadata hash
}
```

**Key Invariants:**
- One identity per agent address (enforced by resolver)
- Owner address cannot be zero (enforced by resolver)
- Non-revocable foundation layer

#### Schema 2: KYA-Capability

```solidity
// Security clearance - answers "What can it do?"
struct KYACapability {
    bytes32 capabilityId;       // Unique capability ID
    uint256 permissions;        // Bitmask of granted permissions
    address targetContract;     // Where this applies (0x0 = global)
    uint64  grantedAt;          // When granted
    uint64  expiresAt;          // Expiration (0 = never)
    bytes32 conditionsHash;     // Hash of detailed conditions
    uint8   trustLevel;         // 0-255 trust score
}
```

**Permission Bitmask:**

```
┌───────────────────────────────────────────────────────────────────┐
│                     PERMISSION FLAGS                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Bit 0:  TRANSACT      (1)   Execute financial transactions      │
│   Bit 1:  SIGN          (2)   Sign messages on behalf             │
│   Bit 2:  DEPLOY        (4)   Deploy contracts                    │
│   Bit 3:  ADMIN         (8)   Administrative operations           │
│   Bit 4:  READ_PRIVATE  (16)  Access private data                 │
│   Bit 5:  DELEGATE      (32)  Delegate to sub-agents              │
│   Bit 6:  CROSS_CHAIN   (64)  Cross-chain operations              │
│                                                                   │
│   ════════════════════════════════════════════════════════════    │
│                                                                   │
│   Example: permissions = 35 = 0b00100011                          │
│                                                                   │
│   Binary:  0  0  1  0  0  0  1  1                                 │
│            │  │  │  │  │  │  │  └── TRANSACT ✓                    │
│            │  │  │  │  │  │  └───── SIGN ✓                        │
│            │  │  │  │  │  └──────── DEPLOY ✗                      │
│            │  │  │  │  └─────────── ADMIN ✗                       │
│            │  │  │  └────────────── READ_PRIVATE ✗                │
│            │  │  └───────────────── DELEGATE ✓                    │
│            │  └──────────────────── CROSS_CHAIN ✗                 │
│            └─────────────────────── (reserved)                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

#### Schema 3: KYA-Provenance

```solidity
// Code lineage - answers "Where did it come from?"
struct KYAProvenance {
    bytes32 sourceCodeHash;     // Git commit or IPFS hash
    bytes32 modelHash;          // ML model weights hash
    bytes32 buildHash;          // Reproducible build artifact
    address builderAddress;     // Build system/developer
    bytes32 auditReportHash;    // Security audit hash
    uint64  buildTimestamp;     // Build timestamp
    bytes32 previousVersionUID; // Prior version reference
    uint8   provenanceType;     // 1=source, 2=model, 3=build, 4=audit
}
```

#### Schema 4: KYA-Delegation

```solidity
// Power of attorney - answers "Who authorized this?"
struct KYADelegation {
    address delegator;          // Address granting delegation
    address delegatee;          // Address receiving delegation
    bytes32 scope;              // Scope identifier (capability hash)
    uint256 constraints;        // Delegation constraints bitmask
    uint64  delegatedAt;        // Delegation timestamp
    uint64  expiresAt;          // Expiration (0 = never)
    uint8   depth;              // Delegation depth (max 3)
}
```

---

### 2. Resolver Contracts

Resolvers enforce business rules when attestations are created or revoked:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RESOLVER VALIDATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌────────────────────────────────────────────────┐
    │   Attester  │────────►│              CREATE ATTESTATION                 │
    └─────────────┘         └────────────────────────┬───────────────────────┘
                                                     │
                                                     ▼
                            ┌────────────────────────────────────────────────┐
                            │                EAS CONTRACT                     │
                            │  ┌──────────────────────────────────────────┐  │
                            │  │  1. Decode attestation data              │  │
                            │  │  2. Check schema exists                  │  │
                            │  │  3. Call resolver.onAttest()             │  │
                            │  └──────────────────────────────────────────┘  │
                            └────────────────────────┬───────────────────────┘
                                                     │
                                    ┌────────────────┴────────────────┐
                                    │                                 │
                                    ▼                                 ▼
                ┌───────────────────────────────────┐   ┌───────────────────────────┐
                │      KYAIdentityResolver          │   │  KYACapabilityResolver    │
                │                                   │   │                           │
                │  ┌─────────────────────────────┐  │   │  ┌─────────────────────┐  │
                │  │ 1. Check whitelist (if on)  │  │   │  │ 1. Get parent UID   │  │
                │  │ 2. Validate agent != 0x0    │  │   │  │ 2. Fetch parent     │  │
                │  │ 3. Validate owner != 0x0    │  │   │  │ 3. Check not revoked│  │
                │  │ 4. Check no existing ID     │  │   │  │ 4. Check not expired│  │
                │  │ 5. Record agent → UID map   │  │   │  │ 5. Return valid     │  │
                │  └─────────────────────────────┘  │   │  └─────────────────────┘  │
                │                                   │   │                           │
                │       return true/false           │   │     return true/false     │
                └────────────────┬──────────────────┘   └─────────────┬─────────────┘
                                 │                                    │
                                 └────────────────┬───────────────────┘
                                                  │
                                                  ▼
                            ┌────────────────────────────────────────────────┐
                            │         Resolver returned TRUE?                 │
                            └────────────────────────┬───────────────────────┘
                                                     │
                                 ┌───────────────────┴───────────────────┐
                                 │                                       │
                                 ▼                                       ▼
                    ┌────────────────────────┐              ┌────────────────────────┐
                    │    ✓ ATTESTATION       │              │    ✗ TRANSACTION       │
                    │      CREATED           │              │      REVERTED          │
                    └────────────────────────┘              └────────────────────────┘
```

#### KYAIdentityResolver

```solidity
contract KYAIdentityResolver is SchemaResolver {
    // State
    mapping(address => bytes32) public agentToIdentity;  // One ID per agent
    mapping(address => bool) public authorizedAttesters;
    bool public whitelistEnabled;

    // 2-step admin transfer
    address public admin;
    address public pendingAdmin;

    // Events
    event IdentityRegistered(bytes32 indexed uid, address indexed agent);
    event IdentityRevoked(bytes32 indexed uid, address indexed agent);
    event AttesterAdded(address indexed attester);
    event AttesterRemoved(address indexed attester);

    function onAttest(Attestation calldata attestation, uint256)
        internal override returns (bool)
    {
        // 1. Whitelist check
        if (whitelistEnabled && !authorizedAttesters[attestation.attester]) {
            return false;
        }

        // 2. Decode and validate
        (, address agentAddress, address ownerAddress, , , , , ) =
            abi.decode(attestation.data, (...));

        if (agentAddress == address(0)) return false;
        if (ownerAddress == address(0)) return false;
        if (agentToIdentity[agentAddress] != bytes32(0)) return false;

        // 3. Record mapping
        agentToIdentity[agentAddress] = attestation.uid;
        emit IdentityRegistered(attestation.uid, agentAddress);

        return true;
    }
}
```

---

### 3. SDK Architecture

The TypeScript SDK provides a clean interface for all KYA operations:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              @kya/sdk ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                              KYA (Main Class)                                │
    │                                                                             │
    │   ┌─────────────────────────────────────────────────────────────────────┐   │
    │   │                         Public Interface                             │   │
    │   │                                                                     │   │
    │   │   // Identity                           // Capability                │   │
    │   │   createIdentity(params)                createCapability(params)     │   │
    │   │   createIdentityOffchain(params)        createCapabilityOffchain()   │   │
    │   │   revokeIdentity(uid)                   revokeCapability(uid)        │   │
    │   │                                                                     │   │
    │   │   // Provenance                         // Delegation                │   │
    │   │   createProvenance(params)              createDelegation(params)     │   │
    │   │                                                                     │   │
    │   │   // Verification                       // Utilities                 │   │
    │   │   verify(uid)                           KYA.Permissions              │   │
    │   │                                         KYA.hashString(str)          │   │
    │   └─────────────────────────────────────────────────────────────────────┘   │
    │                                                                             │
    │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
    │   │   identity   │  │  capability  │  │  delegation  │  │  provenance  │   │
    │   │    .ts       │  │     .ts      │  │     .ts      │  │     .ts      │   │
    │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
    │          │                 │                 │                 │           │
    │          └─────────────────┴─────────────────┴─────────────────┘           │
    │                                    │                                        │
    │   ┌────────────────────────────────▼────────────────────────────────────┐   │
    │   │                          schemas.ts                                  │   │
    │   │   encodeIdentity()  encodeCapability()  encodeDelegation()  ...     │   │
    │   └────────────────────────────────┬────────────────────────────────────┘   │
    │                                    │                                        │
    │   ┌────────────────────────────────▼────────────────────────────────────┐   │
    │   │                          constants.ts                                │   │
    │   │   SCHEMA_UIDS, CONTRACT_ADDRESSES, CHAIN_IDS, PERMISSIONS           │   │
    │   └────────────────────────────────┬────────────────────────────────────┘   │
    │                                    │                                        │
    └────────────────────────────────────┼────────────────────────────────────────┘
                                         │
                                         ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                        @ethereum-attestation-service/eas-sdk               │
    │                                   (EAS)                                     │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Creating an Agent Identity

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CREATE IDENTITY DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

    Developer                    KYA SDK                     EAS                Blockchain
        │                           │                         │                      │
        │  createIdentity({        │                         │                      │
        │    agentAddress,         │                         │                      │
        │    ownerAddress,         │                         │                      │
        │    displayName           │                         │                      │
        │  })                      │                         │                      │
        ├─────────────────────────►│                         │                      │
        │                          │                         │                      │
        │                          │ 1. Validate inputs      │                      │
        │                          │ 2. Hash strings         │                      │
        │                          │ 3. Encode data          │                      │
        │                          │    ┌─────────────────┐  │                      │
        │                          │    │ agentDID        │  │                      │
        │                          │    │ agentAddress    │  │                      │
        │                          │    │ ownerAddress    │  │                      │
        │                          │    │ displayNameHash │  │                      │
        │                          │    │ descriptionHash │  │                      │
        │                          │    │ createdAt       │  │                      │
        │                          │    │ version         │  │                      │
        │                          │    │ metadataURI     │  │                      │
        │                          │    └─────────────────┘  │                      │
        │                          │                         │                      │
        │                          │ eas.attest({           │                      │
        │                          │   schema: IDENTITY_UID,│                      │
        │                          │   data: encoded,       │                      │
        │                          │   recipient: agent     │                      │
        │                          │ })                      │                      │
        │                          ├────────────────────────►│                      │
        │                          │                         │                      │
        │                          │                         │ 1. Validate schema   │
        │                          │                         │ 2. Call resolver     │
        │                          │                         │    onAttest()        │
        │                          │                         │ 3. Generate UID      │
        │                          │                         │                      │
        │                          │                         │ Submit transaction   │
        │                          │                         ├─────────────────────►│
        │                          │                         │                      │
        │                          │                         │                      │ Mine block
        │                          │                         │                      │ Store state
        │                          │                         │◄─────────────────────┤
        │                          │                         │                      │
        │                          │◄────────────────────────┤                      │
        │                          │    Transaction receipt  │                      │
        │                          │    + Attestation UID    │                      │
        │                          │                         │                      │
        │◄─────────────────────────┤                         │                      │
        │    Returns: UID (0x...)  │                         │                      │
        │                          │                         │                      │
```

### Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VERIFICATION DATA FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

    Verifier                     KYA SDK                      EAS
        │                           │                          │
        │  verify(uid)              │                          │
        ├──────────────────────────►│                          │
        │                           │                          │
        │                           │  eas.getAttestation(uid) │
        │                           ├─────────────────────────►│
        │                           │                          │
        │                           │◄─────────────────────────┤
        │                           │  Attestation {           │
        │                           │    uid,                  │
        │                           │    schema,               │
        │                           │    attester,             │
        │                           │    time,                 │
        │                           │    revocationTime,       │
        │                           │    expirationTime,       │
        │                           │    data                  │
        │                           │  }                       │
        │                           │                          │
        │                           │  ┌─────────────────────┐ │
        │                           │  │ VALIDATION CHECKS:  │ │
        │                           │  │                     │ │
        │                           │  │ 1. UID exists       │ │
        │                           │  │    (uid != 0x0)     │ │
        │                           │  │                     │ │
        │                           │  │ 2. Not revoked      │ │
        │                           │  │    (revTime == 0)   │ │
        │                           │  │                     │ │
        │                           │  │ 3. Not expired      │ │
        │                           │  │    (expTime > now   │ │
        │                           │  │     OR expTime == 0)│ │
        │                           │  │                     │ │
        │                           │  │ 4. Decode data      │ │
        │                           │  │    against schema   │ │
        │                           │  └─────────────────────┘ │
        │                           │                          │
        │◄──────────────────────────┤                          │
        │  VerifyResult {           │                          │
        │    valid: boolean,        │                          │
        │    reason?: string,       │                          │
        │    decoded?: {...},       │                          │
        │    attestation?: {...}    │                          │
        │  }                        │                          │
        │                           │                          │
```

---

## Trust Chain Architecture

The KYA trust model ensures every agent traces back to a human:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRUST CHAIN MODEL                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    NON-NEGOTIABLE RULE
                    ┌───────────────────────────────────────────────┐
                    │  Every chain MUST terminate at a human.       │
                    │  No exceptions. This is the liability anchor. │
                    └───────────────────────────────────────────────┘

    Level 0                Level 1                Level 2               Level 3
    ┌──────────┐          ┌──────────┐           ┌──────────┐          ┌──────────┐
    │   👤     │          │   🏢     │           │   🤖     │          │   🔑     │
    │  HUMAN   │─────────►│   ORG    │──────────►│  AGENT   │─────────►│ SESSION  │
    │          │  owns    │          │  deploys  │          │  spawns  │          │
    └──────────┘          └──────────┘           └──────────┘          └──────────┘
         │                     │                      │                      │
         │                     │                      │                      │
         ▼                     ▼                      ▼                      ▼
    ┌──────────┐          ┌──────────┐           ┌──────────┐          ┌──────────┐
    │ External │          │ External │           │   KYA    │          │   KYA    │
    │   KYC    │          │   KYB    │           │ Identity │          │Capability│
    │Credential│          │Credential│           │Attestation          │(Session) │
    └──────────┘          └──────────┘           └──────────┘          └──────────┘

    ════════════════════════════════════════════════════════════════════════════════

                          ATTESTATION GRAPH STRUCTURE

                      ┌─────────────────────────────────┐
                      │        External KYC/KYB         │
                      │    (Coinbase, Circle, etc.)     │
                      └─────────────────┬───────────────┘
                                        │
                                        │ referenced in ownerAddress
                                        ▼
                      ┌─────────────────────────────────┐
                      │         KYA-Identity            │
                      │    UID: 0xabc123...             │
                      │    agentAddress: 0x742d...      │
                      │    ownerAddress: 0x8ba1...      │
                      └─────────────────┬───────────────┘
                                        │
                      ┌─────────────────┼─────────────────┐
                      │                 │                 │
                      ▼                 ▼                 ▼
         ┌────────────────────┐ ┌──────────────┐ ┌────────────────────┐
         │   KYA-Capability   │ │KYA-Provenance│ │   KYA-Delegation   │
         │  refUID: 0xabc123  │ │refUID: 0xabc │ │  refUID: 0xabc123  │
         │  permissions: 35   │ │sourceHash:...│ │  delegator: owner  │
         │  expiresAt: ...    │ │modelHash:... │ │  delegatee: agent  │
         └────────────────────┘ └──────────────┘ └─────────┬──────────┘
                                                          │
                                                          │ depth < 3
                                                          ▼
                                                ┌────────────────────┐
                                                │  Sub-Delegation    │
                                                │  depth: 1          │
                                                │  delegatee: sub    │
                                                └────────────────────┘
```

---

## Delegation Depth Enforcement

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DELEGATION DEPTH LIMITS                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

    Why limit delegation depth?
    ══════════════════════════════════════════════════════════════════════════════
    Unbounded delegation chains obscure accountability. At some point, you've lost
    track of who's really responsible. Maximum depth = 3 (configurable).

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                                                                             │
    │    👤 Human (depth 0)                                                       │
    │     │                                                                       │
    │     │  delegates                                                            │
    │     ▼                                                                       │
    │    🤖 Agent A (depth 1)  ✓                                                  │
    │     │                                                                       │
    │     │  delegates                                                            │
    │     ▼                                                                       │
    │    🤖 Agent B (depth 2)  ✓                                                  │
    │     │                                                                       │
    │     │  delegates                                                            │
    │     ▼                                                                       │
    │    🤖 Agent C (depth 3)  ✓                                                  │
    │     │                                                                       │
    │     │  attempts to delegate                                                 │
    │     ▼                                                                       │
    │    🤖 Agent D (depth 4)  ✗ REJECTED                                         │
    │                                                                             │
    │    ┌─────────────────────────────────────────────────────────────────────┐  │
    │    │ ERROR: Delegation depth 4 exceeds maximum (3)                       │  │
    │    │ Transaction will revert if depth enforcement is enabled.            │  │
    │    └─────────────────────────────────────────────────────────────────────┘  │
    │                                                                             │
    └─────────────────────────────────────────────────────────────────────────────┘

    SCOPE SEMANTICS
    ══════════════════════════════════════════════════════════════════════════════

    ┌─────────────────────────────┬────────────────────────────────────────────┐
    │ Scope Value                 │ Meaning                                    │
    ├─────────────────────────────┼────────────────────────────────────────────┤
    │ 0x0...0 (zero)              │ Wildcard - all capabilities delegated      │
    │ keccak256("READ_ONLY")      │ Standard read-only scope                   │
    │ keccak256("trading:execute")│ Specific capability scope                  │
    │ <capability UID>            │ Delegate only matching capability          │
    └─────────────────────────────┴────────────────────────────────────────────┘
```

---

## On-Chain vs Off-Chain Attestations

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     ATTESTATION STORAGE STRATEGY                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────────────────────┬───────────────────────────────────────┐
    │           ON-CHAIN                │           OFF-CHAIN                   │
    ├───────────────────────────────────┼───────────────────────────────────────┤
    │                                   │                                       │
    │  ┌─────────────────────────────┐  │  ┌─────────────────────────────────┐  │
    │  │ Storage: EAS contract state │  │  │ Storage: IPFS, database, client │  │
    │  └─────────────────────────────┘  │  └─────────────────────────────────┘  │
    │                                   │                                       │
    │  Cost: ~70-150K gas               │  Cost: FREE (EIP-712 signature)       │
    │        (~$0.01-0.10 on L2)        │                                       │
    │                                   │                                       │
    │  ┌─────────────────────────────┐  │  ┌─────────────────────────────────┐  │
    │  │ ✓ Instant contract access   │  │  │ ✗ Requires fetch + verify       │  │
    │  │ ✓ Permanent, immutable      │  │  │ ✓ Flexible, updateable          │  │
    │  │ ✓ On-chain revocation       │  │  │ ✓ Can revoke on-chain           │  │
    │  └─────────────────────────────┘  │  └─────────────────────────────────┘  │
    │                                   │                                       │
    │  USE FOR:                         │  USE FOR:                             │
    │  • Core identity                  │  • Behavioral records                 │
    │  • Critical capabilities          │  • Session credentials                │
    │  • Contract-enforced rules        │  • High-frequency updates             │
    │                                   │                                       │
    └───────────────────────────────────┴───────────────────────────────────────┘

    ════════════════════════════════════════════════════════════════════════════════

                              RECOMMENDED HYBRID APPROACH

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                                                                             │
    │   Identity Attestation ────────────────────────────────────► ON-CHAIN      │
    │   (created once, permanent, critical)                                       │
    │                                                                             │
    │   Core Capabilities ───────────────────────────────────────► ON-CHAIN      │
    │   (contracts check these, must be queryable)                                │
    │                                                                             │
    │   Detailed Conditions ─────────────────────────────────────► OFF-CHAIN     │
    │   (spending limits, time constraints, flexible)                             │
    │                                                                             │
    │   Behavioral Data ─────────────────────────────────────────► OFF-CHAIN     │
    │   (high volume, cheap, transient)                                           │
    │                                                                             │
    │   Revocation Status ───────────────────────────────────────► ON-CHAIN      │
    │   (must be global and instant)                                              │
    │                                                                             │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

## Network Deployment

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT ARCHITECTURE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                           BASE SEPOLIA (Testnet)                             │
    │                           Chain ID: 84532                                    │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │                                                                             │
    │   ┌─────────────────────────────────────────────────────────────────────┐   │
    │   │                    EAS Predeploy Addresses                           │   │
    │   │                                                                     │   │
    │   │   SchemaRegistry: 0x4200000000000000000000000000000000000020         │   │
    │   │   EAS:            0x4200000000000000000000000000000000000021         │   │
    │   │                                                                     │   │
    │   └─────────────────────────────────────────────────────────────────────┘   │
    │                                                                             │
    │   ┌─────────────────────────────────────────────────────────────────────┐   │
    │   │                    KYA Custom Contracts                              │   │
    │   │                                                                     │   │
    │   │   KYAIdentityResolver:   [Deployed Address]                         │   │
    │   │   KYACapabilityResolver: [Deployed Address]                         │   │
    │   │                                                                     │   │
    │   └─────────────────────────────────────────────────────────────────────┘   │
    │                                                                             │
    │   ┌─────────────────────────────────────────────────────────────────────┐   │
    │   │                    Registered Schemas                                │   │
    │   │                                                                     │   │
    │   │   KYA-Identity:   0x[schema-uid-identity]                           │   │
    │   │   KYA-Capability: 0x[schema-uid-capability]                         │   │
    │   │   KYA-Provenance: 0x[schema-uid-provenance]                         │   │
    │   │   KYA-Delegation: 0x[schema-uid-delegation]                         │   │
    │   │                                                                     │   │
    │   └─────────────────────────────────────────────────────────────────────┘   │
    │                                                                             │
    └─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                        FUTURE: Mainnet Deployment                            │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │                                                                             │
    │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
    │   │     BASE      │  │   OPTIMISM    │  │   ARBITRUM    │                   │
    │   │   Chain: 8453 │  │  Chain: 10    │  │ Chain: 42161  │                   │
    │   │               │  │               │  │               │                   │
    │   │   EAS: 0x4200 │  │   EAS: 0x4200 │  │   EAS: 0x4200 │                   │
    │   │   ...0021     │  │   ...0021     │  │   ...0021     │                   │
    │   └───────────────┘  └───────────────┘  └───────────────┘                   │
    │                                                                             │
    │   Same schema UIDs across all chains (deterministic from schema string)     │
    │                                                                             │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                          THREAT MITIGATIONS                                  │
    ├─────────────────┬──────────────────────────┬────────────────────────────────┤
    │ Threat          │ Attack Vector            │ Mitigation                     │
    ├─────────────────┼──────────────────────────┼────────────────────────────────┤
    │ Replay Attack   │ Reusing valid signatures │ EIP-712 domain separator       │
    │                 │                          │ (chainId, verifyingContract)   │
    ├─────────────────┼──────────────────────────┼────────────────────────────────┤
    │ Attestation     │ Unauthorized issuers     │ Resolver whitelist +           │
    │ Forgery         │ creating attestations    │ attester verification          │
    ├─────────────────┼──────────────────────────┼────────────────────────────────┤
    │ Identity Theft  │ Claiming another agent's │ One-identity-per-address       │
    │                 │ address                  │ resolver enforcement           │
    ├─────────────────┼──────────────────────────┼────────────────────────────────┤
    │ Delegation      │ Unbounded sub-delegation │ Max depth enforcement          │
    │ Abuse           │ chains                   │ (default: 3 levels)            │
    ├─────────────────┼──────────────────────────┼────────────────────────────────┤
    │ Revocation      │ Using credentials after  │ On-chain revocation registry   │
    │ Bypass          │ revocation               │ + real-time checks             │
    ├─────────────────┼──────────────────────────┼────────────────────────────────┤
    │ Front-running   │ Front-running attestation│ Commit-reveal for sensitive    │
    │                 │ creation                 │ operations                     │
    ├─────────────────┼──────────────────────────┼────────────────────────────────┤
    │ Signature       │ Modified valid signatures│ OpenZeppelin ECDSA with        │
    │ Malleability    │                          │ low-S enforcement              │
    └─────────────────┴──────────────────────────┴────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                     ADMIN SECURITY (2-Step Transfer)                         │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │                                                                             │
    │   Why 2-step?                                                               │
    │   • Prevents accidental transfer to wrong address                           │
    │   • Prevents lockout if transferring to contract that can't accept          │
    │   • Allows recovery window if admin key is compromised                      │
    │                                                                             │
    │   ┌─────────────────────────────────────────────────────────────────────┐   │
    │   │                                                                     │   │
    │   │   Current Admin                     Pending Admin                   │   │
    │   │        │                                  │                         │   │
    │   │        │ transferAdmin(newAdmin)          │                         │   │
    │   │        ├─────────────────────────────────►│                         │   │
    │   │        │                                  │                         │   │
    │   │        │            [waiting period]      │                         │   │
    │   │        │                                  │                         │   │
    │   │        │                                  │ acceptAdmin()           │   │
    │   │        │◄─────────────────────────────────┤                         │   │
    │   │        │                                  │                         │   │
    │   │   [No longer admin]                  [Now admin]                    │   │
    │   │                                                                     │   │
    │   └─────────────────────────────────────────────────────────────────────┘   │
    │                                                                             │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

- **[Quick Start Tutorial](./tutorials/QUICKSTART.md)** - Create your first agent identity
- **[SDK Reference](./tutorials/SDK_REFERENCE.md)** - Complete API documentation
- **[Integration Guide](./tutorials/INTEGRATION.md)** - Connect KYA with x402, Kite, and more
- **[Security Best Practices](./tutorials/SECURITY.md)** - Production deployment checklist

---

*KYA Protocol Architecture v1.0 | Built on Ethereum Attestation Service*
