# KYA: Know Your Agent — Personal Explainer
## A Plain-Language Breakdown So You Can Own This Material

---

# PART 1: THE BIG PICTURE

## What Problem Does KYA Solve?

**The One-Sentence Version:**
KYA is a system for giving AI agents verifiable IDs so they can prove who they are, what they're allowed to do, and who's responsible if they screw up.

**The Analogy:**
Think about how you interact with a bank. Before they let you open an account or make transactions, they need to verify your identity (KYC = Know Your Customer). They check your passport, your address, maybe your credit history. Once verified, you get credentials (a bank card, login) that let you transact.

AI agents can't do this. They don't have passports. They can't submit to biometric scans. But they're increasingly doing real economic activity—paying for API calls, executing trades, moving money. The current situation is like letting anonymous strangers walk into banks and move money around with no ID check.

**KYA creates the equivalent of a passport system for AI agents.**

---

## Why Does This Matter Now?

Three things are happening simultaneously:

1. **Agents are transacting at scale.** Coinbase's x402 protocol has processed $24M in agent payments. Olas has 3.5M+ agent transactions. This isn't theoretical—it's happening.

2. **Every platform is building their own identity solution.** Kite has KitePass. Stripe has Shared Payment Tokens. Circle has programmable wallets. But none of these talk to each other. It's like if every country had its own passport format and no one recognized anyone else's.

3. **Regulators are coming.** The EU AI Act takes effect in 2026. FATF Travel Rule requires transaction participant identification. When regulators ask "who was responsible for this agent's actions?"—there needs to be an answer.

**The window to establish a standard is now, before fragmentation becomes permanent.**

---

## Why Build on EAS (Ethereum Attestation Service)?

EAS is like a public notary system for the blockchain. Anyone can make a statement ("attestation") about anything, and it gets cryptographically signed and recorded. The key properties:

- **Already deployed and trusted.** Coinbase uses it for verified accounts (77,000+ users). Gitcoin Passport uses it. It's audited and battle-tested.
- **Permissionless.** Anyone can create attestations without asking permission. No gatekeeper.
- **Composable.** Attestations can reference other attestations, creating chains of trust.
- **Cheap on L2s.** On Base or Optimism, creating an attestation costs ~$0.01-0.02.

**By building on EAS, KYA inherits credibility and infrastructure instead of starting from scratch.**

---

# PART 2: THE FOUR SCHEMAS (THE CORE OF KYA)

KYA defines four types of attestations that work together. Think of them as four different documents an agent might carry:

## Schema 1: KYA-Identity — "Who Is This Agent?"

**Plain English:** This is the agent's birth certificate + passport. It says: "This agent exists, it operates from this wallet address, and this human/company is responsible for it."

**What It Contains:**
- `agentDID` — A unique identifier for the agent (like a passport number)
- `agentAddress` — The Ethereum wallet address the agent uses
- `ownerAddress` — The human or company who owns/controls this agent (THE ACCOUNTABILITY ANCHOR)
- `displayName` / `description` — Human-readable info about what this agent is
- `metadataURI` — Link to more detailed information stored off-chain

**Why It Matters:**
Every other attestation in KYA references back to an Identity attestation. If someone asks "who's responsible for this agent?"—the answer is in the `ownerAddress` field. This is non-negotiable for compliance.

**Real-World Analogy:** 
When a company deploys a fleet of delivery drones, each drone needs to be registered and traceable back to the company. KYA-Identity is that registration.

---

## Schema 2: KYA-Capability — "What Can This Agent Do?"

**Plain English:** This is like an agent's job description + security clearance. It specifies exactly what actions this agent is authorized to perform.

**What It Contains:**
- `permissions` — A bitmask (list of yes/no flags) for different abilities:
  - Can it execute financial transactions? (bit 0)
  - Can it sign messages? (bit 1)
  - Can it deploy contracts? (bit 2)
  - Can it access private data? (bit 4)
  - Etc.
- `targetContract` — Which specific contract/service this applies to (or "anywhere")
- `expiresAt` — When this permission expires
- `conditionsHash` — Reference to detailed conditions (spending limits, time restrictions, etc.)
- `trustLevel` — A 0-255 score indicating how much trust to place in this agent

**Why It Matters:**
This is how you implement "least privilege" for agents. An agent that only needs to read data shouldn't have permission to move money. If an agent is compromised, the capability attestation limits the damage it can do.

**Real-World Analogy:**
An employee badge that grants access to certain floors/rooms but not others. A corporate credit card with a $5,000 monthly limit. KYA-Capability is the equivalent for agents.

**The Conditions Document (stored off-chain, referenced by hash):**
```json
{
  "spendingLimits": {
    "perTransaction": "1000 USDC",
    "dailyAggregate": "10000 USDC"
  },
  "temporalConstraints": {
    "validHours": [9, 17],  // Only operates 9am-5pm
    "validDays": [1, 2, 3, 4, 5]  // Weekdays only
  },
  "geographicConstraints": {
    "excludedCountries": ["KP", "IR"]  // No North Korea or Iran
  }
}
```

---

## Schema 3: KYA-Provenance — "Where Did This Agent Come From?"

**Plain English:** This is the agent's birth certificate + family tree + medical records. It traces where the agent's code came from, what AI model it uses, and whether it's been audited.

**What It Contains:**
- `sourceCodeHash` — Hash of the agent's source code (proves what code it's running)
- `modelHash` — Hash of the AI model weights (proves which AI model)
- `buildHash` — Hash of the compiled/built artifact
- `builderAddress` — Who built/deployed this agent
- `auditReportHash` — Reference to any security audits
- `previousVersionUID` — Link to the previous version (creating a chain)

**Why It Matters:**
When an agent does something unexpected, you need to answer: "What code was it actually running? Has this code been reviewed? Is this the same agent from yesterday or a modified version?"

Provenance attestations create an auditable trail. You can trace back from the current agent to its original deployment, seeing every update along the way.

**Real-World Analogy:**
Software supply chain security. Like how companies need to know where their code dependencies come from (see: SolarWinds hack). KYA-Provenance is supply chain transparency for agents.

---

## Schema 4: KYA-Delegation — "Who Gave This Agent Permission?"

**Plain English:** This tracks chains of "I authorize you to authorize someone else." It's how permissions flow from humans to agents to sub-agents.

**What It Contains:**
- `delegator` — Who is granting the permission
- `delegatee` — Who is receiving it
- `scope` — What specifically is being delegated (all permissions? just one capability?)
- `expiresAt` — When this delegation expires
- `depth` — How many levels removed from the original human owner

**Why It Matters:**
In complex systems, you might have: Human → Company → Main Agent → Sub-Agent → Session Key. KYA-Delegation tracks this chain so you can always trace back to who originally authorized something.

**The Depth Limit:**
The spec recommends max depth of 3 to prevent chains from getting so long that accountability becomes meaningless. If Agent A delegates to Agent B delegates to Agent C delegates to Agent D... at some point, you've lost the plot.

**Real-World Analogy:**
Power of attorney chains. A CEO can authorize a VP to act on their behalf. The VP can authorize a manager. But there are limits—you can't have infinite delegation chains where no one knows who's actually responsible.

---

# PART 3: HOW THE SCHEMAS WORK TOGETHER

## The Attestation Graph

These four schemas aren't independent—they reference each other to create a trust graph:

```
[Human/Org KYC Credential]
         ↓
[KYA-Identity] ← "This agent belongs to this verified human/org"
         ↓
[KYA-Capability] ← "This agent can do X, Y, Z" (references Identity)
         ↓
[KYA-Delegation] ← "This agent authorized sub-agent" (references Identity or Capability)
         ↓
[KYA-Provenance] ← "This agent's code comes from..." (references Identity)
```

**Every capability MUST reference an identity. Every delegation MUST trace back to a human.**

## The Verification Flow (What Actually Happens)

Imagine an agent tries to pay for an API using x402:

1. **Agent sends payment request** with its wallet address
2. **Service checks KYA-Identity:** Does this wallet have a valid identity attestation? Is it revoked? Who's the owner?
3. **Service checks KYA-Capability:** Does this agent have TRANSACT permission? Is it within spending limits? Is the capability expired?
4. **Service checks parent chain:** Is the identity attestation still valid? Is the owner's KYC still valid?
5. **If all checks pass:** Accept payment, deliver service
6. **If any check fails:** Reject with specific reason

**All of this can be done programmatically—it's not humans checking documents, it's smart contracts verifying attestation chains.**

---

# PART 4: THE TECHNICAL BITS (SIMPLIFIED)

## Resolvers — The Gatekeepers

When someone tries to create a KYA attestation, a "resolver" contract can enforce rules:

**KYAIdentityResolver enforces:**
- Only authorized issuers can create identity attestations (or make it permissionless)
- One identity per wallet address (prevents duplicates)
- Owner address can't be empty (someone must be accountable)

**KYACapabilityResolver enforces:**
- Must reference a valid, non-revoked identity attestation
- Can't create capability for non-existent agent

**Think of resolvers as the bouncers at the door—they check your credentials before letting you in.**

## On-Chain vs. Off-Chain

**On-chain attestations:**
- Stored directly on the blockchain
- Cost gas (~$0.02 on L2s)
- Immediately verifiable by smart contracts
- Use for: Core identity, critical capabilities

**Off-chain attestations:**
- Signed but stored elsewhere (IPFS, databases)
- Cost nothing to create
- Need extra step to verify (fetch + check signature)
- Use for: Behavioral records, session credentials, high-frequency updates

**The hybrid approach:** Core identity on-chain (pay once, permanent). Detailed conditions and behavioral data off-chain (flexible, cheap).

## The refUID Pattern

Every attestation can include a `refUID` field pointing to another attestation. This creates links:

```
Capability Attestation
  refUID → Identity Attestation
             refUID → (none, this is the root)
```

**Verifiers traverse these links to build the complete picture.** If any link in the chain is revoked or expired, the whole chain is invalid.

---

# PART 5: WHY THIS DESIGN?

## Design Principle 1: Composability Over Monolithism

**What it means:** Instead of one giant "agent profile" schema that tries to capture everything, KYA uses small, focused schemas that combine.

**Why:** Different use cases need different things. A simple API-calling agent needs Identity + basic Capability. A sophisticated trading agent needs Identity + Capability + Provenance + multiple Delegations. By composing small pieces, you build exactly what you need.

**Analogy:** Lego blocks vs. pre-built toys. Lego is more flexible.

## Design Principle 2: Progressive Trust

**What it means:** Agents can start with minimal credentials and accumulate more over time.

**Why:** In practice, you might need to deploy an agent before full verification is complete. An agent can begin with just Identity, then add Capability attestations as it proves itself, then get third-party audit attestations, building a reputation over time.

**Analogy:** A new employee might start with limited system access, then get more permissions as they prove trustworthy.

## Design Principle 3: Human Accountability Anchoring

**What it means:** Every chain of attestations must terminate at a human or legally-registered organization.

**Why:** This is non-negotiable for legal/regulatory reasons. When something goes wrong, there must be a responsible party who can be held accountable. No infinite chains of agents authorizing agents with no human at the root.

**Analogy:** Corporate structure. You can have subsidiaries and holding companies, but somewhere there are human directors who bear legal responsibility.

## Design Principle 4: Revocation as First-Class Citizen

**What it means:** Any attestation can be revoked, and revocation is globally visible and immediate.

**Why:** Credentials get compromised. Agents go rogue. Relationships end. The system needs a kill switch. Revocation is on-chain so everyone sees it instantly—you can't use a revoked credential because the revocation is public record.

**Analogy:** Credit card cancellation. Once cancelled, it's cancelled everywhere, immediately.

---

# PART 6: HOW KYA CONNECTS TO THE ECOSYSTEM

## x402 Protocol (Coinbase's Agent Payment System)

**What x402 does:** Enables agents to pay for web resources using HTTP 402 "Payment Required" responses.

**How KYA integrates:** Before settling a payment, the x402 Facilitator can check: Does this agent have a valid KYA attestation? Does it have the TRANSACT capability? Is the trust level high enough?

**The value add:** x402 today is identity-minimal—any wallet can pay. KYA adds a trust layer so services can require verified agents.

## Kite.ai (Agent-First Blockchain)

**What Kite does:** Purpose-built blockchain for agent operations with KitePass identity and programmable wallets.

**How KYA integrates:** KitePass can store a reference to the agent's KYA attestation. Before deriving session keys or executing transactions, Kite verifies KYA validity.

**The value add:** KitePass is Kite-specific. KYA attestations are portable across platforms.

## Circle Arc (USDC Infrastructure)

**What Circle does:** Stablecoin infrastructure with programmable wallets for agent-controlled treasury.

**How KYA integrates:** Before approving transactions from agent wallets, check KYA capability attestations. Spending limits and permissions are verified against attestation conditions.

**The value add:** Circle's compliance infrastructure can issue KYA attestations, extending their KYB verification to the agents those businesses deploy.

---

# PART 7: QUESTIONS YOU MIGHT GET ASKED (AND HOW TO ANSWER)

## "How is this different from just using wallet addresses?"

Wallet addresses tell you nothing about who controls them or what they're authorized to do. An address is like a P.O. box number—it's where mail goes, but it doesn't tell you who owns the box, whether they're allowed to receive packages over a certain value, or who to contact if something goes wrong.

KYA adds the identity layer: this address belongs to this agent, this agent is authorized for these actions, and this human/org is accountable.

## "Why not just use Microsoft Entra or Google A2A?"

Both are excellent for their domains, but:
- Entra is enterprise-only and Microsoft-ecosystem-specific. No on-chain verification.
- A2A defines discovery (Agent Cards) but not verifiable credentials or provenance.
- Neither has on-chain revocation or delegation chains.

KYA is designed for the crypto/DeFi ecosystem where on-chain verification matters. It complements these systems—you could store A2A Agent Card data in KYA's metadata field.

## "What stops someone from creating fake attestations?"

Two mechanisms:
1. **Resolver whitelisting:** The Identity resolver can require that attestations come from authorized issuers (like Coinbase, Kite, or protocol DAOs).
2. **Trust scoring:** Even if anyone can create attestations, consumers can choose to only trust attestations from specific attesters with established reputations.

The permissionless option is also valid—but consumers decide what they trust.

## "Isn't gas cost a problem?"

On L2s like Base, an attestation costs ~$0.02. For core identity (created once), this is negligible. For high-frequency operations, off-chain attestations cost nothing to create and can be verified without gas.

## "What about privacy? Everything on-chain is public."

KYA stores hashes on-chain, not raw data. The actual capability conditions, metadata, and detailed information live off-chain (IPFS, encrypted databases). Verifiers get Merkle proofs to check specific claims without seeing everything.

Future versions could add zero-knowledge proofs—prove you have a capability without revealing which one.

---

# PART 8: THE KEY INSIGHTS TO INTERNALIZE

1. **The problem is trust, not intelligence.** AI agents are smart enough. The bottleneck is: can we trust them? KYA provides verifiable answers.

2. **KYC doesn't translate.** You can't ask an agent for a passport. Agent identity is fundamentally different—it's about authorization chains and accountability, not biometrics.

3. **Composability wins.** Small, focused schemas that combine beat monolithic solutions. The Gitcoin Passport model (multiple "stamps" → composite score) is the template.

4. **Human anchoring is non-negotiable.** Every chain ends at a human. This isn't optional—it's how you stay on the right side of regulators.

5. **Revocation is as important as issuance.** Credentials go bad. The system needs a kill switch that works instantly and globally.

6. **Build on infrastructure, not from scratch.** EAS exists, is trusted, and is deployed. Use it instead of reinventing attestation infrastructure.

---

# QUICK REFERENCE: THE FOUR SCHEMAS

| Schema | Purpose | Key Fields | Analogy |
|--------|---------|------------|---------|
| **Identity** | Who is this agent? | agentAddress, ownerAddress, DID | Passport + Birth Certificate |
| **Capability** | What can it do? | permissions, limits, expiration | Security Clearance + Job Description |
| **Provenance** | Where did it come from? | codeHash, modelHash, audits | Medical Records + Family Tree |
| **Delegation** | Who authorized it? | delegator → delegatee, depth | Power of Attorney Chain |

---

# WHEN TALKING ABOUT KYA, LEAD WITH:

"The fundamental insight is that agent identity is different from human identity. You can't ask an AI for a passport. But you still need to answer: Who authorized this agent? What can it do? Who's accountable when it fails? KYA provides cryptographically verifiable answers to those questions, built on infrastructure that already exists and is trusted."

Then go deeper based on what they ask about.
