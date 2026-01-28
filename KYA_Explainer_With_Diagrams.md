# Know Your Agent (KYA): A Visual Guide
## The Identity Layer for Autonomous AI Agents

---

# The Problem: Agents Can't Show ID

AI agents are transacting at scale. Coinbase's x402 protocol has processed $24 million in agent payments. Olas has executed 3.5 million+ agent transactions. But here's the issue:

```
┌─────────────────────────────────────────────────────────────────┐
│                     HUMAN ENTERS A BANK                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Human ──── shows ────► Passport ────► Bank verifies           │
│              │                              │                   │
│              └── biometrics ──────────────► ✓ Identity confirmed│
│              └── address proof ───────────► ✓ KYC complete      │
│                                                                 │
│   Result: Human can transact                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     AGENT ENTERS A BANK                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Agent ──── shows ────► ???                                    │
│              │                                                  │
│              └── no passport ─────────────► ✗                   │
│              └── no biometrics ───────────► ✗                   │
│              └── no address ──────────────► ✗                   │
│                                                                 │
│   Result: ¯\_(ツ)_/¯                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**KYA solves this by creating a passport system for AI agents.**

---

# The Core Concept: Attestation Chains

KYA uses the Ethereum Attestation Service (EAS) to create verifiable credentials. Think of attestations as notarized statements that anyone can verify cryptographically.

```mermaid
flowchart TD
    subgraph "The Trust Chain"
        H[👤 Human with KYC] -->|"owns"| O[🏢 Organization]
        O -->|"deploys"| A[🤖 Agent]
        A -->|"authorized for"| C[📋 Capabilities]
        A -->|"delegates to"| S[🔑 Session Key]
    end
    
    subgraph "Verification"
        V[Verifier] -->|"checks"| A
        A -->|"traces back to"| H
        V -->|"confirms"| T[✅ Trusted]
    end
```

**Every agent traces back to a human. Always.**

---

# The Four Schemas: KYA's Building Blocks

KYA defines four types of attestations that compose together:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KYA SCHEMA ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐                                                  │
│   │   IDENTITY   │◄─── "Who is this agent?"                         │
│   │              │     • Agent's wallet address                     │
│   │   (Schema 1) │     • Owner's address (THE ACCOUNTABILITY HOOK)  │
│   └──────┬───────┘     • Unique identifier (DID)                    │
│          │                                                          │
│          │ references                                               │
│          ▼                                                          │
│   ┌──────────────┐                                                  │
│   │  CAPABILITY  │◄─── "What can it do?"                            │
│   │              │     • Permission flags (transact, sign, etc.)    │
│   │   (Schema 2) │     • Spending limits                            │
│   └──────┬───────┘     • Expiration time                            │
│          │                                                          │
│          │ references                                               │
│          ▼                                                          │
│   ┌──────────────┐                                                  │
│   │  DELEGATION  │◄─── "Who authorized this?"                       │
│   │              │     • Delegator → Delegatee                      │
│   │   (Schema 4) │     • Scope of delegation                        │
│   └──────────────┘     • Depth limit (max 3 levels)                 │
│                                                                     │
│   ┌──────────────┐                                                  │
│   │  PROVENANCE  │◄─── "Where did it come from?"                    │
│   │              │     • Source code hash                           │
│   │   (Schema 3) │     • Model weights hash                         │
│   └──────────────┘     • Audit reports                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# Schema 1: KYA-Identity

**The agent's passport. Answers: "Who is this and who's responsible?"**

```mermaid
erDiagram
    KYA_IDENTITY {
        bytes32 agentDID "Unique identifier (like passport number)"
        address agentAddress "Agent's wallet address"
        address ownerAddress "Human/org responsible (CRITICAL)"
        bytes32 displayNameHash "Hash of display name"
        bytes32 descriptionHash "Hash of description"
        uint64 createdAt "When registered"
        uint8 version "Schema version"
        bytes32 metadataURI "Link to extended data"
    }
```

**The Key Field: `ownerAddress`**

```
┌────────────────────────────────────────────────────────┐
│                  ACCOUNTABILITY CHAIN                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│   Agent Wallet: 0xABCD...                              │
│        │                                               │
│        │ ownerAddress points to                        │
│        ▼                                               │
│   Owner: 0x1234... (Human or Company)                  │
│        │                                               │
│        │ has verified                                  │
│        ▼                                               │
│   KYC/KYB Credential ✓                                 │
│                                                        │
│   ══════════════════════════════════════════════════   │
│   When agent misbehaves → trace to owner → legal       │
│   accountability exists                                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

# Schema 2: KYA-Capability

**The agent's security clearance. Answers: "What actions are authorized?"**

```mermaid
erDiagram
    KYA_CAPABILITY {
        bytes32 capabilityId "Unique capability identifier"
        uint256 permissions "Bitmask of granted permissions"
        address targetContract "Where this applies (0x0 = global)"
        uint64 grantedAt "When granted"
        uint64 expiresAt "When it expires (0 = never)"
        bytes32 conditionsHash "Hash of detailed conditions"
        uint8 trustLevel "0-255 trust score"
    }
```

**Permission Bitmask Explained:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSION BITMASK                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Bit 0:  TRANSACT      [1 = can execute financial txns]        │
│   Bit 1:  SIGN          [1 = can sign messages]                 │
│   Bit 2:  DEPLOY        [1 = can deploy contracts]              │
│   Bit 3:  ADMIN         [1 = admin operations]                  │
│   Bit 4:  READ_PRIVATE  [1 = can access private data]           │
│   Bit 5:  DELEGATE      [1 = can delegate to sub-agents]        │
│   Bit 6:  CROSS_CHAIN   [1 = can operate across chains]         │
│                                                                 │
│   Example: permissions = 0b00000011 (binary) = 3 (decimal)      │
│            → Agent can TRANSACT + SIGN, nothing else            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Conditions Document (stored off-chain):**

```json
{
  "spendingLimits": {
    "perTransaction": "1000 USDC",
    "dailyAggregate": "10000 USDC"
  },
  "temporalConstraints": {
    "validHours": [9, 17],
    "validDays": [1, 2, 3, 4, 5]
  },
  "geographicConstraints": {
    "excludedCountries": ["KP", "IR"]
  }
}
```

---

# Schema 3: KYA-Provenance

**The agent's DNA test + family tree. Answers: "Where did this code come from?"**

```mermaid
flowchart LR
    subgraph "Provenance Chain"
        V1[Version 1.0<br/>sourceHash: 0xAAA...]
        V2[Version 1.1<br/>sourceHash: 0xBBB...]
        V3[Version 2.0<br/>sourceHash: 0xCCC...]
        AUDIT[Security Audit<br/>auditHash: 0xDDD...]
    end
    
    V1 -->|previousVersionUID| V2
    V2 -->|previousVersionUID| V3
    V3 -.->|auditReportHash| AUDIT
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROVENANCE ATTESTATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   sourceCodeHash ──► "This is the exact code running"           │
│   modelHash ───────► "This is the AI model being used"          │
│   buildHash ───────► "This is the compiled artifact"            │
│   builderAddress ──► "This address built/deployed it"           │
│   auditReportHash ─► "This audit was performed"                 │
│                                                                 │
│   previousVersionUID ──► Links to prior version                 │
│                          (creates auditable history)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why it matters:** When an agent behaves unexpectedly, you can verify exactly what code it was running and trace its entire development history.

---

# Schema 4: KYA-Delegation

**The agent's power of attorney. Answers: "Who granted these permissions?"**

```mermaid
flowchart TD
    H[👤 Human Owner<br/>depth: 0] -->|delegates| A1[🤖 Primary Agent<br/>depth: 1]
    A1 -->|delegates| A2[🤖 Sub-Agent<br/>depth: 2]
    A2 -->|delegates| A3[🤖 Task Agent<br/>depth: 3]
    A3 -.->|❌ blocked| A4[Cannot delegate further<br/>max depth reached]
    
    style H fill:#90EE90
    style A4 fill:#FFB6C1
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    DELEGATION DEPTH LIMITS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Human (depth 0)                                               │
│      │                                                          │
│      └──► Agent A (depth 1) ✓                                   │
│              │                                                  │
│              └──► Agent B (depth 2) ✓                           │
│                      │                                          │
│                      └──► Agent C (depth 3) ✓                   │
│                              │                                  │
│                              └──► Agent D (depth 4) ✗ BLOCKED   │
│                                                                 │
│   Why? Unbounded delegation chains obscure accountability.      │
│   At some point, you've lost track of who's really responsible. │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# How The Schemas Connect: The Attestation Graph

```mermaid
flowchart TD
    subgraph "External KYC Layer"
        KYC[KYC Credential<br/>Coinbase/Circle verified]
    end
    
    subgraph "KYA Layer"
        ID[KYA-Identity<br/>Agent registration]
        CAP1[KYA-Capability<br/>TRANSACT permission]
        CAP2[KYA-Capability<br/>SIGN permission]
        PROV[KYA-Provenance<br/>Code origin]
        DEL[KYA-Delegation<br/>Sub-agent auth]
    end
    
    KYC -->|"owner has"| ID
    ID -->|"refUID"| CAP1
    ID -->|"refUID"| CAP2
    ID -->|"refUID"| PROV
    CAP1 -->|"refUID"| DEL
```

**Every capability references an identity. Every delegation traces back to a human.**

---

# The Verification Flow

When a service receives a request from an agent:

```mermaid
sequenceDiagram
    participant Agent
    participant Service
    participant EAS as EAS Contract
    
    Agent->>Service: Request + Payment
    Service->>EAS: Check KYA-Identity for agent address
    EAS-->>Service: Identity attestation (or none)
    
    alt No Identity Found
        Service-->>Agent: ❌ Reject: No KYA identity
    else Identity Found
        Service->>EAS: Check if revoked?
        EAS-->>Service: revocationTime
        
        alt Revoked
            Service-->>Agent: ❌ Reject: Identity revoked
        else Valid
            Service->>EAS: Check KYA-Capability
            EAS-->>Service: Capabilities list
            
            alt Has Required Capability
                Service->>EAS: Verify capability not expired
                Service->>EAS: Check owner's KYC still valid
                Service-->>Agent: ✅ Accept request
            else Missing Capability
                Service-->>Agent: ❌ Reject: Insufficient permissions
            end
        end
    end
```

---

# On-Chain vs. Off-Chain Attestations

```
┌─────────────────────────────────────────────────────────────────┐
│              ON-CHAIN vs OFF-CHAIN ATTESTATIONS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ON-CHAIN                        OFF-CHAIN                     │
│   ════════                        ═════════                     │
│   • Stored on blockchain          • Stored elsewhere (IPFS, DB) │
│   • Costs gas (~$0.02 on L2)      • Free to create              │
│   • Instant smart contract access • Requires fetch + verify     │
│   • Permanent, immutable          • Flexible, updateable        │
│                                                                 │
│   USE FOR:                        USE FOR:                      │
│   • Core identity                 • Behavioral records          │
│   • Critical capabilities         • Session credentials         │
│   • Anything contracts need       • High-frequency updates      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  HYBRID APPROACH                         │   │
│   │                                                         │   │
│   │   Identity ──────► ON-CHAIN (created once, permanent)   │   │
│   │   Core Capabilities ► ON-CHAIN (contracts check these)  │   │
│   │   Detailed Conditions ► OFF-CHAIN (flexible, detailed)  │   │
│   │   Behavioral Data ──► OFF-CHAIN (high volume, cheap)    │   │
│   │   Revocation ───────► ON-CHAIN (must be global/instant) │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Resolver Contracts: The Gatekeepers

Resolvers enforce rules when attestations are created:

```mermaid
flowchart LR
    subgraph "Attestation Request"
        REQ[Create Attestation]
    end
    
    subgraph "KYAIdentityResolver"
        C1{Authorized attester?}
        C2{Owner address valid?}
        C3{Agent not already registered?}
    end
    
    subgraph "Result"
        OK[✅ Attestation Created]
        FAIL[❌ Rejected]
    end
    
    REQ --> C1
    C1 -->|No| FAIL
    C1 -->|Yes| C2
    C2 -->|No| FAIL
    C2 -->|Yes| C3
    C3 -->|Already exists| FAIL
    C3 -->|New agent| OK
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESOLVER RESPONSIBILITIES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   KYAIdentityResolver:                                          │
│   ├── Only authorized issuers can create identities             │
│   ├── One identity per agent address (no duplicates)            │
│   └── Owner address cannot be empty                             │
│                                                                 │
│   KYACapabilityResolver:                                        │
│   ├── Must reference valid, non-revoked identity                │
│   └── Parent identity must not be expired                       │
│                                                                 │
│   KYADelegationResolver:                                        │
│   ├── Depth cannot exceed maximum (default: 3)                  │
│   └── Delegator must have DELEGATE permission                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Integration: How KYA Plugs Into The Ecosystem

## x402 Protocol (Agent Payments)

```mermaid
sequenceDiagram
    participant Agent
    participant API as Paid API
    participant Facilitator
    participant EAS
    
    Agent->>API: GET /resource
    API-->>Agent: 402 Payment Required<br/>+ KYA requirements
    
    Agent->>Agent: Sign payment
    Agent->>API: GET /resource<br/>X-PAYMENT: [signed tx]<br/>X-KYA-ATTESTATION: [uid]
    
    API->>Facilitator: Verify payment + KYA
    Facilitator->>EAS: Check attestation valid?
    EAS-->>Facilitator: ✅ Valid, not revoked
    Facilitator-->>API: ✅ Approved
    
    API-->>Agent: 200 OK + resource
```

## Kite.ai Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    KITE + KYA INTEGRATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐         ┌─────────────┐                       │
│   │  KitePass   │◄───────►│ KYA-Identity│                       │
│   │  (Kite's    │  links  │ (Portable   │                       │
│   │   native    │   to    │  across     │                       │
│   │   identity) │         │  platforms) │                       │
│   └─────────────┘         └─────────────┘                       │
│                                                                 │
│   Before session key derivation:                                │
│   1. Check KitePass exists                                      │
│   2. Check linked KYA-Identity valid                            │
│   3. Check KYA-Capability includes required permissions         │
│   4. If all pass → derive session key                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# The Design Principles Visualized

```
┌─────────────────────────────────────────────────────────────────┐
│                    KYA DESIGN PRINCIPLES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. COMPOSABILITY OVER MONOLITHISM                             │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                               │
│   │ ID  │+│ CAP │+│PROV │+│ DEL │ = Complete Profile            │
│   └─────┘ └─────┘ └─────┘ └─────┘                               │
│   Small pieces combine. Use only what you need.                 │
│                                                                 │
│   2. PROGRESSIVE TRUST                                          │
│   ○───────○───────○───────●                                     │
│   New    Basic   Verified  Trusted                              │
│   Agent   ID      + Caps   + Audits                             │
│   Start minimal, accumulate credentials over time.              │
│                                                                 │
│   3. HUMAN ACCOUNTABILITY ANCHORING                             │
│   Agent → Agent → Agent → Agent → 👤 HUMAN                      │
│   Every chain terminates at a responsible party.                │
│   NON-NEGOTIABLE.                                               │
│                                                                 │
│   4. REVOCATION AS FIRST-CLASS CITIZEN                          │
│   [VALID] ───revoke()───► [REVOKED]                             │
│   Instant. Global. Permanent. No using revoked credentials.     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                     KYA QUICK REFERENCE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SCHEMA          PURPOSE              KEY QUESTION              │
│  ───────────────────────────────────────────────────────────    │
│  Identity        Agent's passport     "Who is this?"            │
│  Capability      Security clearance   "What can it do?"         │
│  Provenance      DNA + family tree    "Where did it come from?" │
│  Delegation      Power of attorney    "Who authorized it?"      │
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  BUILT ON: Ethereum Attestation Service (EAS)                   │
│  DEPLOYED: Base, Optimism, Arbitrum, Ethereum mainnet           │
│  COST: ~$0.02 per attestation on L2                             │
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│                                                                 │
│  THE ONE RULE: Every chain ends at a human.                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# The Pitch (When Someone Asks "What is KYA?")

> "KYA is a passport system for AI agents. Humans have KYC—Know Your Customer. 
> Agents need KYA—Know Your Agent.
>
> The problem: AI agents are already transacting billions, but they can't prove 
> who they are, what they're authorized to do, or who's responsible when they 
> fail. You can't ask an AI for a passport.
>
> KYA solves this with four composable attestation schemas—Identity, Capability, 
> Provenance, and Delegation—built on infrastructure that already exists and is 
> trusted (Ethereum Attestation Service).
>
> The key insight: every agent identity chain must terminate at a human. 
> That's how you maintain accountability in a world of autonomous systems."

---

# Comparison: KYA vs. Alternatives

```mermaid
graph TD
    subgraph "KYA"
        K1[On-chain ✅]
        K2[Portable ✅]
        K3[Composable ✅]
        K4[Revocable ✅]
        K5[Open standard ✅]
    end
    
    subgraph "Microsoft Entra"
        M1[Cloud-based]
        M2[Microsoft only]
        M3[Enterprise focused]
    end
    
    subgraph "Google A2A"
        G1[Discovery only]
        G2[No credentials]
        G3[No provenance]
    end
    
    subgraph "Wallet Address"
        W1[No identity]
        W2[No capabilities]
        W3[No accountability]
    end
```

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FEATURE COMPARISON MATRIX                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Feature              │ KYA │ Entra │ A2A │ ERC-8004 │ Wallet Only    │
│   ─────────────────────┼─────┼───────┼─────┼──────────┼────────────    │
│   On-chain verify      │  ✅  │   ❌   │  ❌  │    ✅     │     ❌         │
│   Portable creds       │  ✅  │   ❌   │  ⚠️  │    ✅     │     ❌         │
│   Capability attests   │  ✅  │   ✅   │  ⚠️  │    ❌     │     ❌         │
│   Provenance chain     │  ✅  │   ❌   │  ❌  │    ⚠️     │     ❌         │
│   Delegation tracking  │  ✅  │   ✅   │  ❌  │    ❌     │     ❌         │
│   On-chain revocation  │  ✅  │   ❌   │  ❌  │    ⚠️     │     ❌         │
│   Open/permissionless  │  ✅  │   ❌   │  ✅  │    ✅     │     ✅         │
│                                                                        │
│   ✅ = Full support  ⚠️ = Partial  ❌ = Not supported                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

# Why Now? Market Timing

```mermaid
timeline
    title The Convergence Point
    
    2024 : AI agents emerge
         : Experimental transactions
         : No identity standards
    
    2025 : x402 processes $24M
         : Olas hits 3.5M txns
         : Kite, Circle Arc launch
         : Fragmented identity
    
    2026 : EU AI Act enforced
         : FATF compliance required
         : Standards solidify
         : KYA window closes
    
    2027+ : Ecosystem locked in
          : Hard to change standards
          : First mover wins
```

**The window for establishing agent identity standards is 2025-2026. After that, fragmentation becomes permanent.**

---

# Conclusion: The Core Insight

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "Agent identity is fundamentally different from human         │
│    identity. You can't ask an AI for a passport.                │
│                                                                 │
│    But you still need answers to:                               │
│                                                                 │
│    • Who authorized this agent?                                 │
│    • What can it do?                                            │
│    • Who's accountable when it fails?                           │
│                                                                 │
│    KYA provides cryptographically verifiable answers,           │
│    built on infrastructure that already exists and is trusted." │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*KYA is an open specification. Contributions welcome.*
