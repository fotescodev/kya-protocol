# Know Your Agent: An On-Chain Identity Standard for Autonomous AI Agents

The bottleneck for AI agents transacting autonomously has shifted from intelligence to **identity**. While large language models can now reason, plan, and execute complex tasks, they remain "unbanked ghosts"—unable to establish trust, prove authorization, or transact across systems without cryptographic credentials linking them to principals, operational constraints, and liability frameworks. This white paper proposes the Know Your Agent (KYA) Protocol, an on-chain attestation standard built on the Ethereum Attestation Service (EAS) that provides verifiable identity for autonomous agents operating in crypto and DeFi ecosystems. With **$24 million** already transacted through the x402 protocol, **3.5 million** agent transactions processed by Olas, and the AI agent crypto market exceeding **$3 billion**, the infrastructure gap is urgent. KYA provides the missing trust layer that enables agents to move from experimental demos to production financial activity.

## The identity crisis in agentic finance

AI agents are already transacting on-chain at significant scale. Olas Protocol alone has processed over 3.5 million transactions across nine blockchains, with its agents accounting for **75% of all Safe transactions on Gnosis Chain**. The x402 payment protocol, launched by Coinbase in May 2025, has processed 75-100 million transactions totaling $24 million in just seven months. Venture capital firm a16z observes that non-human agents now outnumber human employees in financial services at ratios approaching 100:1—yet these agents operate without standardized identity, creating systemic risks in compliance, accountability, and trust.

The fundamental problem is asymmetric: humans interacting with financial systems undergo Know Your Customer (KYC) verification—government IDs, biometric checks, address verification. But AI agents possess no equivalent. They cannot present passports or submit to iris scans. Current systems either treat agents as extensions of their operators (inheriting human credentials) or ignore identity entirely (wallet addresses as pseudonymous actors). Neither approach scales. As agents become more autonomous—making independent decisions, transacting with other agents, operating across jurisdictions—the absence of agent-native identity infrastructure creates cascading failures: compliance gaps, attribution ambiguity, and blocked interoperability between platforms.

The market recognizes this gap. Circle and Stripe have both launched dedicated Layer-1 blockchains (Arc and Tempo respectively) in 2025 with explicit support for "agentic commerce." Google's A2A Protocol under the Linux Foundation now has 150+ partners building agent communication standards. Microsoft's Entra Agent ID is in preview for enterprise deployments. Yet no standard exists for **on-chain agent attestation**—the cryptographic proof that an agent is authorized to act, who authorized it, what constraints govern its behavior, and how liability chains resolve. KYA fills this gap.

## Technical foundation: how EAS enables programmable trust

The Ethereum Attestation Service provides the cryptographic substrate for agent identity. EAS is a permissionless, tokenless public good deployed across Ethereum mainnet, Base, Optimism, Arbitrum, and all OP Stack chains as a predeploy at address `0x4200000000000000000000000000000000000021`. Its elegance lies in simplicity: two core smart contracts—SchemaRegistry and EAS—handle all attestation use cases through composable primitives.

### Cryptographic architecture and data structures

EAS attestations use **EIP-712 typed data signing**, the same standard that enables human-readable transaction signing in wallets like MetaMask. When an attester creates an attestation, they sign a structured data object containing the recipient address, schema identifier, expiration time, revocability flag, reference to related attestations, and the attestation data itself. The signature uses standard ECDSA with v, r, s components, while the EAS contract implements EIP-1271 verification for smart contract wallet compatibility.

Each attestation receives a unique identifier (UID) computed via keccak256 hash of its contents:

```solidity
uid = keccak256(schema, recipient, attester, time, expirationTime, 
                revocable, refUID, data, bump)
```

The `bump` parameter handles rare hash collisions. This deterministic computation means anyone can verify an attestation's integrity by recomputing its UID from its contents.

The core Attestation struct stores:
- **schema**: The schema UID defining the attestation's data format
- **time/expirationTime**: Unix timestamps for creation and optional expiry
- **revocationTime**: Non-zero if the attestation has been revoked
- **refUID**: Reference to a parent attestation (enabling attestation graphs)
- **recipient/attester**: The parties involved
- **revocable**: Whether the attester can later revoke
- **data**: ABI-encoded payload following the schema definition

### Schema registration and the trust vocabulary

Schemas define the vocabulary of trust. The SchemaRegistry contract stores schema definitions as Solidity ABI-type strings—for example, `"address owner, string agentType, bytes32[] capabilities, uint256 trustScore"`. Schema UIDs are computed from the schema string, resolver address, and revocability flag, making them deterministic and globally unique.

Critically, schema registration is **free** (beyond gas costs) and **permissionless**. Anyone can register schemas, and schemas cannot be modified once registered. This creates an open marketplace of attestation types. Coinbase has registered schemas for verified accounts (`0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9`) with **77,000+ verified users** on Base. Gitcoin Passport uses EAS schemas on Optimism for on-chain humanity verification stamps.

### On-chain versus off-chain attestations

EAS supports both modalities with distinct tradeoffs:

**On-chain attestations** are stored directly in contract state, costing approximately 70,000-150,000 gas depending on data size. On L2s like Base, this translates to $0.01-0.10 per attestation. They are immediately queryable by smart contracts, enabling conditional logic: "Execute this DeFi trade only if the agent has a valid capability attestation."

**Off-chain attestations** are EIP-712 signed objects stored externally (IPFS, databases, or directly by the holder). They cost nothing to create but require additional verification steps. Off-chain attestations can be timestamped on-chain (`eas.timestamp(offchainUID)`) to prove they existed at a specific moment, and revoked on-chain (`eas.revokeOffchain(uid)`) to create a public revocation record.

For agent identity, the hybrid approach is optimal: **core identity attestations on-chain** (owner binding, primary capabilities) with **behavioral attestations off-chain** (individual transaction authorizations, session credentials) to manage costs while preserving auditability.

### Resolver contracts enable programmable verification

Resolvers are optional smart contracts that execute custom logic when attestations are created or revoked. They implement the ISchemaResolver interface with `attest()` and `revoke()` hooks that return boolean success/failure.

Example resolver patterns critical for KYA:

**AttesterResolver**: Restricts who can create attestations for a schema. For agent identity, this ensures only authorized registrars (Coinbase, Kite.ai, protocol DAOs) can issue agent credentials.

**PayingResolver**: Accepts ETH with attestation requests, enabling economic incentives—staking requirements for agent registration, bonds that can be slashed for misbehavior.

**DataResolver**: Validates attestation data against business rules. An agent capability attestation could require the attester to also hold a valid operator credential.

**CompositionResolver**: Verifies that referenced attestations (via refUID) meet certain criteria, enabling hierarchical trust chains where agent credentials require valid organizational credentials which require valid human KYC credentials.

## Protocol landscape: where agents transact today

### Kite.ai and the agent-first blockchain

Kite (formerly ZettaBlock) raised $33 million including $18 million in a September 2025 Series A led by PayPal Ventures and General Catalyst. Their thesis: the internet was designed for humans, not AI agents. Kite's Layer-1 blockchain is purpose-built for agentic commerce with three architectural innovations relevant to KYA.

**KitePass** provides DID-based agent identity using BIP-32 hierarchical deterministic wallet derivation. Each agent receives a deterministic address derived from its owner's wallet, creating cryptographic binding without exposing the owner's private keys. Session keys provide ephemeral authorization that expires after use. The three-layer architecture (User Layer → Agent Layer → Session Layer) maps directly to KYA's principal hierarchy model.

**Programmable constraints** enable spending rules encoded into agent credentials: "Agent X can spend maximum $10,000/month" or "Agent Y can only interact with whitelisted contracts." These constraints are cryptographically enforced, not merely policy suggestions.

**Micropayment channels** achieve $1 per million requests pricing through state channel architecture—two on-chain transactions (open/close) enabling thousands of off-chain signed updates. This economics makes per-request agent billing viable.

Kite's identity gaps that KYA addresses: no third-party verification layer (attestations are self-issued), limited cross-platform reputation portability, and no standardized schema for external systems to verify Kite credentials.

### x402: HTTP payments for the agentic web

Coinbase's x402 protocol activates HTTP's reserved 402 "Payment Required" status code for AI agent micropayments. When an agent requests a paid resource, the server responds with 402 plus payment requirements (amount, currency, recipient address). The agent signs a transaction, includes it in the X-PAYMENT header, and retries. The server verifies payment through a Facilitator service, settles on-chain, and returns the resource.

The protocol has achieved remarkable adoption: **75-100 million transactions**, **$24 million in volume**, with daily volumes reaching $380,000 by late 2025. The x402 Foundation, established with Cloudflare in December 2025, coordinates ecosystem development.

x402's critical identity gap: **no agent verification**. Any wallet can pay. The protocol is deliberately identity-minimal—no KYC, no credentials, wallet address as sole identifier. Version 2 (December 2025) added optional wallet-based identity via Sign-In-With-X (CAIP-122) and a roadmap item for "optional attestations for sellers to enforce KYC or geographic restrictions."

This is precisely where KYA integrates. An extended PaymentRequirements schema could specify:
```javascript
attestationRequirements: {
  requiredSchemas: ["0x...agentIdentity", "0x...capability"],
  minimumTrustScore: 100,
  maxAttestationAge: 86400 // 24 hours
}
```

Facilitators would verify both payment validity and attestation requirements before settlement.

### Stripe Tempo: enterprise infrastructure meets agent commerce

Stripe's Tempo is a Layer-1 blockchain announced September 2025, backed by $500 million at a $5 billion valuation. Tempo targets 100,000+ TPS with sub-second deterministic finality and fixed fees around $0.001 per transaction. Unlike crypto-native chains, Tempo uses stablecoins (USDC, USDT, Stripe's USDB) as native gas tokens—no volatile native token required.

Stripe's agent commerce infrastructure includes:
- **Stripe Agent Toolkit**: SDKs for OpenAI Agents SDK, LangChain, CrewAI
- **Agentic Commerce Protocol (ACP)**: Open standard co-developed with OpenAI for programmatic checkout
- **Shared Payment Tokens (SPT)**: Programmable payment credentials scoped to specific businesses, time-limited, amount-limited, and revocable

SPTs represent a significant primitive for agent identity: a human grants an agent an SPT that authorizes specific transaction types. This is delegation with constraints—but SPTs are Stripe-specific, not portable, and lack on-chain verifiability.

KYA integration opportunity: SPTs could reference EAS attestations proving the agent's broader identity and capabilities. Stripe's compliance infrastructure (KYC/KYB for Connected Accounts) could serve as an attestation issuer in the KYA ecosystem.

### Circle Arc: USDC-native infrastructure

Circle Arc launched public testnet October 2025 with 100+ partners. Arc is an EVM-compatible Layer-1 with USDC as native gas, sub-second finality via Malachite consensus (acquired from Informal Systems), and built-in FX for institutional stablecoin trading.

Circle explicitly lists "agentic commerce and programmatic payments" as a core use case. Their existing infrastructure provides building blocks:
- **Programmable Wallets**: MPC-secured, developer-controlled wallets ideal for agent key management
- **x402 integration**: Native compatibility with Coinbase's payment protocol
- **CCTP**: Cross-Chain Transfer Protocol for native USDC movement between blockchains
- **Circle Payments Network**: Real-time settlement layer

Arc's compliance framework requires comprehensive KYB for institutional features (StableFX, Mint). This creates a natural attestation issuer pathway: businesses verified through Circle's KYB could issue agent credentials that inherit organizational compliance status.

## Existing standards and their convergence

### W3C Decentralized Identifiers as the addressing layer

The W3C DID Core 1.1 specification provides the identifier format for agent identity. DIDs are URIs following the pattern `did:method:method-specific-identifier`—for example, `did:ethr:0x1234...` for Ethereum-based identifiers or `did:key:z6Mk...` for self-certifying key-based identifiers.

Critical to KYA: the DID specification explicitly includes **"autonomous software"** as a valid controller type. An agent's DID document contains:
- Verification methods (public keys for authentication)
- Service endpoints (API URLs for agent interaction)
- Controller references (linking to owner DIDs)

For on-chain agents, `did:ethr` using the ERC-1056 registry is optimal—native Ethereum integration with support for key rotation and delegation. For ephemeral agents or lightweight deployments, `did:key` provides self-certifying identifiers requiring no blockchain state.

### Verifiable Credentials as the claims layer

The W3C VC Data Model 2.0 (May 2025) defines how attestations about subjects are structured, signed, and verified. A Verifiable Credential contains:
- Issuer (who makes the claim)
- Subject (who the claim is about)
- Claims (the actual assertions)
- Proof (cryptographic signature)

For agent identity, VCs enable statements like: "Agent X (subject) is authorized by Company Y (issuer) to execute trades up to $100,000 (claim)."

The format choice matters. **VC-JWT** (JSON Web Token envelope) provides compatibility with existing OAuth/OIDC infrastructure—critical for enterprise adoption. **SD-JWT** (Selective Disclosure JWT) enables privacy-preserving disclosure where agents reveal only necessary credential fields. **BBS+ signatures** (used in VC-LD proofs) enable zero-knowledge selective disclosure without trusted setup.

### A2A Protocol: agent discovery and communication

Google's A2A Protocol (April 2025), now under Linux Foundation governance with 150+ partners, standardizes agent-to-agent communication. The **Agent Card** discovery mechanism is directly relevant:

```json
{
  "name": "Trading Agent Alpha",
  "description": "Automated DeFi trading agent",
  "url": "https://agent.example.com",
  "skills": [{"id": "defi-trade", "name": "Execute DeFi Trades"}],
  "authentication": {"schemes": ["oauth2"]},
  "supportedModalities": ["text", "structured-data"]
}
```

Agent Cards are hosted at `/.well-known/agent.json`. KYA extends this pattern: Agent Cards should include attestation references enabling verifiers to retrieve and validate agent credentials before initiating communication.

### Microsoft Entra Agent ID: enterprise patterns

Microsoft's Entra Agent ID (preview as of late 2025) provides enterprise-grade agent identity management. Key architectural patterns:

**Agent Identity Blueprints**: Reusable templates defining agent types with inherited permissions
**Sponsors**: Human users accountable for agent lifecycle—a governance requirement likely to become regulatory mandate
**Conditional Access**: Zero Trust policies applied to agent authentication
**Access Packages**: Time-bound, auditable resource assignments

The sponsor concept is critical for KYA: every agent attestation should trace to a human or organizational principal who bears ultimate accountability.

### LOKA Protocol: academic framework for ethical agents

The LOKA Protocol (arxiv:2504.10915, April 2025) from Carnegie Mellon-affiliated researchers proposes a four-layer architecture:
1. **Identity Layer (UAIL)**: DIDs and VCs with post-quantum cryptography
2. **Governance Layer**: Policy enforcement and jurisdictional compliance
3. **Security Layer**: Cryptographic binding and secure communication
4. **Consensus Layer (DECP)**: Decentralized ethical decision-making

While LOKA remains academic, its Universal Agent Identity Layer aligns with KYA's technical approach. LOKA's emphasis on post-quantum cryptography is forward-looking—agent credentials may need 10+ year validity, well into the post-quantum era.

## Trust frameworks: from KYC to KYA

### The principal hierarchy model

Agent identity requires a clear chain of accountability:

**Level 1 - Human Principal**: The ultimate owner, verified through traditional KYC (government ID, biometrics, address verification). This is the liability backstop—when an agent causes harm, the human principal is legally accountable.

**Level 2 - Organizational Principal**: Companies, DAOs, or other legal entities that deploy agents. Verified through KYB (legal registration, beneficial ownership, director information). Organizations can issue credentials to multiple agents while maintaining unified compliance status.

**Level 3 - Agent**: The autonomous system itself, identified by DID, authorized through VCs issued by Level 1 or Level 2 principals. Agent credentials specify capabilities, constraints, and operational boundaries.

**Level 4 - Session**: Ephemeral authorization for specific tasks. Session keys are derived from agent credentials, time-limited, scope-limited, and automatically expired.

### What makes KYA different from KYC

| Dimension | KYC (Humans) | KYA (Agents) |
|-----------|--------------|--------------|
| **Identity Basis** | Biometrics, government ID | Cryptographic keys, DIDs |
| **Verification Timing** | Point-in-time onboarding | Continuous attestation |
| **Credential Duration** | Static documents, years valid | Dynamic credentials, hours to days |
| **Control Model** | Self-attestation | Delegated authority from principal |
| **Liability** | Individual/entity | Traced to human/org principal |
| **Risk Assessment** | Historical, periodic review | Real-time behavioral monitoring |

The continuous nature is essential. Human identity changes slowly—a KYC check valid for years. Agent identity is dynamic: capabilities can be granted or revoked per-task, behavioral patterns shift with model updates, and compromise risks require rapid credential rotation.

### Sybil resistance without biometrics

Agent identity cannot rely on biometrics or proof-of-personhood. The Sybil resistance mechanisms must be economic and cryptographic:

**Staking requirements**: Agents must bond value (via PayingResolver) that can be slashed for misbehavior. Higher-trust agents stake more, creating economic Sybil cost.

**Reputation accumulation**: Trust scores increase with successful, non-malicious transactions. New agents start with limited capabilities; proven agents unlock higher transaction limits.

**Hardware attestation**: Agents running in Trusted Execution Environments (TEEs) can prove code integrity. TEE attestations complement identity attestations.

**Behavioral fingerprinting**: Statistical analysis of agent transaction patterns detects anomalies suggesting credential theft or impersonation.

Gitcoin Passport (now Human Passport) demonstrates viable Sybil resistance: 2 million+ users, 34 million+ credentials, using a "Cost of Forgery" model where accumulating sufficient stamps is more expensive than the value of fraudulent participation. KYA adapts this for agents: accumulating sufficient attestations from independent issuers creates robust identity.

## KYA Protocol architecture

### Schema hierarchy for agent attestation

KYA defines a hierarchy of EAS schemas that compose to create comprehensive agent identity:

**Schema 1: Agent Registration** (on-chain, non-revocable)
```
address agentAddress, 
bytes32 agentDID,
address ownerAddress,
uint64 registrationTime,
string agentType
```
The foundational attestation linking an agent address to its DID and owner. Non-revocable because historical registration should remain provable even if later credentials are revoked.

**Schema 2: Principal Binding** (on-chain, revocable)
```
bytes32 refUID,  // References Agent Registration
address principal,
uint8 principalType,  // 1=human, 2=org, 3=agent
bytes32 principalCredential,  // External VC reference
uint64 expirationTime
```
Links the agent to its accountable principal. The resolver validates that `principal` holds a valid KYC/KYB credential before allowing attestation.

**Schema 3: Capability Grant** (off-chain, revocable)
```
bytes32 refUID,  // References Principal Binding
string[] capabilities,
uint256 spendingLimit,
address[] allowedContracts,
uint64 validFrom,
uint64 validUntil
```
Specifies what the agent can do. Off-chain for cost efficiency given frequent updates. Timestamped on-chain for non-repudiation.

**Schema 4: Behavioral Attestation** (off-chain, revocable)
```
bytes32 refUID,  // References Agent Registration
address attester,  // Must be approved behavioral monitor
uint256 transactionCount,
uint256 successRate,
uint256 trustScore,
uint64 periodStart,
uint64 periodEnd
```
Accumulates reputation data. Multiple independent behavioral monitors can issue attestations, creating resilient trust signals.

### Resolver contract architecture

**KYARegistryResolver**: The core resolver for Agent Registration attestations
```solidity
contract KYARegistryResolver is SchemaResolver {
    mapping(address => bool) public approvedRegistrars;
    mapping(bytes32 => bool) public registeredAgents;
    uint256 public registrationStake = 0.1 ether;
    
    function onAttest(Attestation calldata attestation, uint256 value) 
        internal override returns (bool) {
        // Require approved registrar
        require(approvedRegistrars[attestation.attester], "Unauthorized");
        // Require stake
        require(value >= registrationStake, "Insufficient stake");
        // Prevent duplicate registration
        bytes32 agentDID = abi.decode(attestation.data, (address, bytes32, ...))[1];
        require(!registeredAgents[agentDID], "Already registered");
        registeredAgents[agentDID] = true;
        return true;
    }
}
```

**PrincipalBindingResolver**: Validates principal credentials before allowing binding
```solidity
contract PrincipalBindingResolver is SchemaResolver {
    IEAS public eas;
    bytes32 public kycSchemaUID;
    
    function onAttest(Attestation calldata attestation, uint256) 
        internal view override returns (bool) {
        (bytes32 refUID, address principal, , bytes32 principalCredential, ) = 
            abi.decode(attestation.data, (bytes32, address, uint8, bytes32, uint64));
        // Verify referenced agent registration exists and is not revoked
        Attestation memory agentReg = eas.getAttestation(refUID);
        require(agentReg.revocationTime == 0, "Agent registration revoked");
        // Verify principal has valid KYC attestation
        Attestation memory kyc = eas.getAttestation(principalCredential);
        require(kyc.recipient == principal, "KYC mismatch");
        require(kyc.revocationTime == 0, "KYC revoked");
        require(kyc.expirationTime == 0 || kyc.expirationTime > block.timestamp, "KYC expired");
        return true;
    }
}
```

### Integration patterns for protocol adoption

**x402 Integration**: Extend the Facilitator verification flow
```javascript
async function verifyPaymentWithKYA(payment, requirements) {
    // Standard x402 payment verification
    const paymentValid = await verifyPaymentSignature(payment);
    
    // KYA attestation verification
    if (requirements.kyaRequired) {
        const attestations = await eas.getAttestationsForRecipient(
            payment.payerAddress,
            requirements.requiredSchemas
        );
        
        // Validate attestation chain
        const agentReg = attestations.find(a => a.schema === AGENT_REGISTRATION_SCHEMA);
        const principalBinding = attestations.find(a => 
            a.schema === PRINCIPAL_BINDING_SCHEMA && 
            a.data.refUID === agentReg.uid
        );
        const capabilities = attestations.find(a => 
            a.schema === CAPABILITY_GRANT_SCHEMA &&
            a.data.refUID === principalBinding.uid
        );
        
        // Verify capability includes required permissions
        const hasCapability = capabilities.data.capabilities.includes(
            requirements.requiredCapability
        );
        
        return paymentValid && hasCapability;
    }
    return paymentValid;
}
```

**Kite.ai Integration**: Extend KitePass with attestation references
```python
class KYAEnhancedKitePass:
    def __init__(self, did: str, owner_wallet: str):
        self.did = did
        self.owner_wallet = owner_wallet
        self.eas_attestation_uid = None
    
    async def register_with_kya(self, eas_contract, registrar_signer):
        # Create EAS attestation for agent registration
        attestation_data = encode_abi(
            ['address', 'bytes32', 'address', 'uint64', 'string'],
            [self.agent_address, self.did_bytes, self.owner_wallet, 
             int(time.time()), 'kite-agent']
        )
        
        tx = await eas_contract.attest({
            'schema': AGENT_REGISTRATION_SCHEMA,
            'data': {
                'recipient': self.agent_address,
                'data': attestation_data,
                'value': REGISTRATION_STAKE
            }
        }).send({'from': registrar_signer})
        
        self.eas_attestation_uid = tx.events['Attested']['uid']
        return self.eas_attestation_uid
```

## Market dynamics and adoption pathways

### The $50 billion opportunity

The AI agents market is projected to grow from $5.1 billion (2024) to **$47.1 billion by 2030** at 45% CAGR. The crypto AI sector specifically has grown from $23 billion mid-2024 to $50-70 billion by early 2025. Within this, pure AI agent tokens represent $3+ billion market cap, with projects like ai16z reaching $2 billion+ valuations.

On-chain agent activity is accelerating: Olas processes **700,000+ transactions monthly** with 30%+ month-over-month growth. The x402 protocol saw **750% week-over-week volume increases** in late 2025. These are infrastructure metrics, not token speculation—they represent actual agent economic activity.

### Investor thesis for agent identity

a16z articulates the investment case directly: the bottleneck has shifted from AI capability to **identity infrastructure**. Their "11 AI x Crypto Crossovers" thesis identifies "universal identity for agents (decentralized, composable)" as a critical gap. Paradigm's $50 million investment in Nous Research and Coinbase's x402 development signal institutional conviction.

The grants case: KYA is public good infrastructure. Like EAS itself (permissionless, tokenless), agent identity standards must be credibly neutral to achieve network effects. Protocol-specific identity (Kite-only, Stripe-only) fragments the ecosystem. An open standard deployed on EAS benefits all platforms—justifying ecosystem grants from Base, Optimism, and protocol foundations.

### Regulatory tailwinds

Regulation is forcing the identity question. The EU AI Act (fully applicable August 2026) requires risk assessment and human oversight for high-risk AI systems. While "AI agents" aren't explicitly addressed, systems making autonomous decisions in financial contexts likely qualify. The proposed EU AI Liability Directive creates disclosure obligations that necessitate audit trails—exactly what KYA's on-chain attestations provide.

FATF Travel Rule implementation (73% of jurisdictions) requires transaction participant identification. For agent-to-agent transactions, the current framework is unclear—but likely resolution holds agent principals accountable. KYA's principal binding schema provides the required traceability.

The UK Automated Vehicles Act 2024 establishes a precedent: when autonomous systems operate without human control, liability shifts to manufacturers/developers. Applied to AI agents: the accountable principal bears liability for agent actions within attested capabilities. KYA makes this chain explicit and verifiable.

## Toward credible agent infrastructure

The Know Your Agent protocol addresses a structural gap in the emerging agent economy. AI agents will transact trillions in value over the coming decade—the question is whether that activity occurs within trustworthy, auditable infrastructure or through fragmented, pseudonymous systems that invite regulatory backlash and systemic risk.

KYA's design principles reflect this responsibility:

**Neutrality**: Built on EAS, a permissionless public good with no token or governance capture risk. Any platform can integrate; no platform controls the standard.

**Composability**: Attestation graphs enable complex trust relationships—human KYC flows to organizational KYB flows to agent registration flows to capability grants. Each layer is independently verifiable.

**Privacy-preservation**: Off-chain attestations with selective disclosure enable agents to prove capabilities without revealing sensitive operational details. Zero-knowledge proofs of attestation validity are architecturally supported.

**Economic alignment**: Staking requirements create Sybil costs. Reputation accumulation rewards trustworthy behavior. Slashing mechanisms punish misbehavior. The incentive structure encourages honest participation.

The infrastructure is ready. EAS is deployed. x402 is processing millions of transactions. Kite, Stripe Tempo, and Circle Arc are launching dedicated agent-commerce chains. What's missing is the **trust layer** that connects these systems—the cryptographic proof that an agent is who it claims to be, authorized to do what it claims it can do, and accountable to principals who bear ultimate responsibility. KYA provides this layer. The agents are coming. It's time to know who they are.