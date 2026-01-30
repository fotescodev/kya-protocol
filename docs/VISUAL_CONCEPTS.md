# KYA Protocol: Visual Concepts Guide

> Making agent identity intuitive through visual explanations.

---

## The Big Picture: Why Agents Need Identity

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                          THE AGENT ECONOMY TODAY                                │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │     $24M          3.5M+           100M+          $50B+                   │   │
│   │   ════════      ════════        ════════       ════════                  │   │
│   │    x402        Olas Agent       Agent         AI Agent                  │   │
│   │   Volume       Transactions     Payments      Market Cap                │   │
│   │                                                                         │   │
│   │           Agents are ALREADY transacting at scale.                      │   │
│   │           But they have no way to prove WHO they are.                   │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## The Problem: No Passport for Machines

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                    HUMAN IDENTITY vs AGENT IDENTITY                             │
│                                                                                 │
├─────────────────────────────────┬───────────────────────────────────────────────┤
│                                 │                                               │
│         HUMANS                  │              AI AGENTS                        │
│         ══════                  │              ═════════                        │
│                                 │                                               │
│    ┌───────────────────┐        │        ┌───────────────────┐                  │
│    │  📕 Passport      │        │        │       ???         │                  │
│    │  🏠 Address Proof │        │        │       ???         │                  │
│    │  👁️ Biometrics    │        │        │       ???         │                  │
│    │  📱 Phone Number  │        │        │       ???         │                  │
│    └───────────────────┘        │        └───────────────────┘                  │
│                                 │                                               │
│    Bank can verify:             │        Bank cannot verify:                    │
│    • Who you are                │        • Who authorized this agent            │
│    • Where you live             │        • What it's allowed to do              │
│    • Your history               │        • Who's responsible if it fails        │
│                                 │                                               │
│    Result: ✅ Access granted    │        Result: ❓ Unknown risk                 │
│                                 │                                               │
└─────────────────────────────────┴───────────────────────────────────────────────┘
```

---

## The Solution: Four Building Blocks

KYA provides four composable attestation types that answer the fundamental questions about any agent:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                         THE FOUR QUESTIONS                                      │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │    "WHO is this?"        ──────────────►   🪪 IDENTITY                  │   │
│   │                                            The agent's passport         │   │
│   │                                                                         │   │
│   │    "WHAT can it do?"     ──────────────►   📋 CAPABILITY                │   │
│   │                                            The security clearance       │   │
│   │                                                                         │   │
│   │    "WHO authorized it?"  ──────────────►   🔐 DELEGATION                │   │
│   │                                            The power of attorney        │   │
│   │                                                                         │   │
│   │    "WHERE did it come    ──────────────►   🧬 PROVENANCE                │   │
│   │     from?"                                 The family tree              │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Identity: The Agent's Passport

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                            🪪 KYA-IDENTITY                                      │
│                         "The Agent's Passport"                                  │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   ╔═══════════════════════════════════════════════════════════════════╗ │   │
│   │   ║                    AGENT IDENTITY CARD                            ║ │   │
│   │   ╠═══════════════════════════════════════════════════════════════════╣ │   │
│   │   ║                                                                   ║ │   │
│   │   ║   Name: Trading Bot Alpha                                         ║ │   │
│   │   ║                                                    ┌─────────────┐║ │   │
│   │   ║   Address: 0x742d35Cc6634C0532925a3b8...          │             │║ │   │
│   │   ║                                                    │    🤖      │║ │   │
│   │   ║   Owner: 0x8ba1f109551bD432803012645...           │             │║ │   │
│   │   ║          ↑                                         └─────────────┘║ │   │
│   │   ║          │                                                        ║ │   │
│   │   ║          └─── THE ACCOUNTABILITY ANCHOR                           ║ │   │
│   │   ║               When this agent misbehaves,                         ║ │   │
│   │   ║               this is who's responsible.                          ║ │   │
│   │   ║                                                                   ║ │   │
│   │   ║   Created: January 29, 2026                                       ║ │   │
│   │   ║   UID: 0xabc123...                                                ║ │   │
│   │   ║                                                                   ║ │   │
│   │   ╚═══════════════════════════════════════════════════════════════════╝ │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   KEY PROPERTY: One identity per agent. Permanent. Traceable.                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Capability: The Security Clearance

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                            📋 KYA-CAPABILITY                                    │
│                        "The Security Clearance"                                 │
│                                                                                 │
│   What can this agent actually DO? Not everything. Only what's authorized.      │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   ╔════════════════════════════════════════════════════════════════╗    │   │
│   │   ║              PERMISSIONS GRANTED                               ║    │   │
│   │   ╠════════════════════════════════════════════════════════════════╣    │   │
│   │   ║                                                                ║    │   │
│   │   ║   [✅] TRANSACT    Can execute financial transactions          ║    │   │
│   │   ║   [✅] SIGN        Can sign messages                           ║    │   │
│   │   ║   [❌] DEPLOY      Cannot deploy contracts                     ║    │   │
│   │   ║   [❌] ADMIN       No admin access                             ║    │   │
│   │   ║   [❌] READ_PRIVATE No private data access                     ║    │   │
│   │   ║   [✅] DELEGATE    Can authorize sub-agents                    ║    │   │
│   │   ║   [❌] CROSS_CHAIN No cross-chain operations                   ║    │   │
│   │   ║                                                                ║    │   │
│   │   ║   Permission Value: 35 (binary: 0b00100011)                    ║    │   │
│   │   ║   Trust Level: 100 / 255                                       ║    │   │
│   │   ║   Expires: February 28, 2026                                   ║    │   │
│   │   ║                                                                ║    │   │
│   │   ╚════════════════════════════════════════════════════════════════╝    │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   BONUS: Off-chain conditions can add even more detail:                         │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │   {                                                                     │   │
│   │     "spendingLimits": {                                                 │   │
│   │       "perTransaction": "1000 USDC",                                    │   │
│   │       "daily": "10000 USDC"                                             │   │
│   │     },                                                                  │   │
│   │     "allowedHours": [9, 17],  // 9 AM - 5 PM                            │   │
│   │     "blockedCountries": ["KP", "IR"]                                    │   │
│   │   }                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Delegation: The Power of Attorney

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                            🔐 KYA-DELEGATION                                    │
│                        "The Power of Attorney"                                  │
│                                                                                 │
│   Agents can authorize other agents—but with limits.                            │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │                    THE DELEGATION CHAIN                                 │   │
│   │                                                                         │   │
│   │      👤 Human (Alice)                                                   │   │
│   │       │                                                                 │   │
│   │       │ "I authorize my primary agent"                                  │   │
│   │       │ depth: 0                                                        │   │
│   │       ▼                                                                 │   │
│   │      🤖 Agent A (Portfolio Manager)                                     │   │
│   │       │                                                                 │   │
│   │       │ "I authorize a trading specialist"                              │   │
│   │       │ depth: 1                                                        │   │
│   │       ▼                                                                 │   │
│   │      🤖 Agent B (Trading Bot)                                           │   │
│   │       │                                                                 │   │
│   │       │ "I authorize a rebalancer"                                      │   │
│   │       │ depth: 2                                                        │   │
│   │       ▼                                                                 │   │
│   │      🤖 Agent C (Rebalancer)                                            │   │
│   │       │                                                                 │   │
│   │       │ "I want to authorize another agent"                             │   │
│   │       │ depth: 3                                                        │   │
│   │       ▼                                                                 │   │
│   │      🤖 Agent D                                                         │   │
│   │       ╳                                                                 │   │
│   │       │                                                                 │   │
│   │    ┌──┴────────────────────────────────────────────────────────────┐    │   │
│   │    │  ❌ BLOCKED: Maximum delegation depth (3) reached             │    │   │
│   │    │                                                               │    │   │
│   │    │  Why? At some point, you've lost track of who's responsible.  │    │   │
│   │    │  Unbounded delegation chains = accountability nightmare.      │    │   │
│   │    └───────────────────────────────────────────────────────────────┘    │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Provenance: The Family Tree

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                            🧬 KYA-PROVENANCE                                    │
│                           "The Family Tree"                                     │
│                                                                                 │
│   Where did this agent come from? What code is it running? Who built it?        │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │                      CODE EVOLUTION CHAIN                               │   │
│   │                                                                         │   │
│   │   ┌─────────────────┐                                                   │   │
│   │   │ Version 1.0     │                                                   │   │
│   │   │ ─────────────── │                                                   │   │
│   │   │ Source: 0xaaa...│                                                   │   │
│   │   │ Model: GPT-4    │                                                   │   │
│   │   │ Date: Jan 2026  │                                                   │   │
│   │   └────────┬────────┘                                                   │   │
│   │            │                                                            │   │
│   │            │ previousVersionUID                                         │   │
│   │            ▼                                                            │   │
│   │   ┌─────────────────┐                                                   │   │
│   │   │ Version 1.1     │      ┌─────────────────────────────────────┐      │   │
│   │   │ ─────────────── │      │ 🔍 SECURITY AUDIT                   │      │   │
│   │   │ Source: 0xbbb...│◄─────│    Auditor: Trail of Bits          │      │   │
│   │   │ Model: GPT-4    │      │    Report: 0xccc...                 │      │   │
│   │   │ Date: Jan 2026  │      │    Status: ✅ No critical issues    │      │   │
│   │   └────────┬────────┘      └─────────────────────────────────────┘      │   │
│   │            │                                                            │   │
│   │            │ previousVersionUID                                         │   │
│   │            ▼                                                            │   │
│   │   ┌─────────────────┐                                                   │   │
│   │   │ Version 2.0     │  ◄─── Currently Running                           │   │
│   │   │ ─────────────── │                                                   │   │
│   │   │ Source: 0xddd...│                                                   │   │
│   │   │ Model: Claude   │                                                   │   │
│   │   │ Build: 0xeee... │                                                   │   │
│   │   │ Date: Jan 2026  │                                                   │   │
│   │   └─────────────────┘                                                   │   │
│   │                                                                         │   │
│   │   Complete audit trail from genesis to current state.                   │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## How It All Connects: The Attestation Graph

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                        THE COMPLETE TRUST GRAPH                                 │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │                    ┌───────────────────────────┐                        │   │
│   │                    │    External KYC/KYB       │                        │   │
│   │                    │  (Coinbase, Circle, etc.) │                        │   │
│   │                    │                           │                        │   │
│   │                    │  👤 Human: Alice          │                        │   │
│   │                    │  Verified: 2024           │                        │   │
│   │                    └─────────────┬─────────────┘                        │   │
│   │                                  │                                      │   │
│   │                                  │ ownerAddress                         │   │
│   │                                  ▼                                      │   │
│   │                    ┌───────────────────────────┐                        │   │
│   │                    │     🪪 KYA-IDENTITY       │                        │   │
│   │                    │                           │                        │   │
│   │                    │  Agent: Trading Bot Alpha │                        │   │
│   │                    │  UID: 0xabc123...         │                        │   │
│   │                    └─────────────┬─────────────┘                        │   │
│   │                                  │                                      │   │
│   │           ┌──────────────────────┼──────────────────────┐               │   │
│   │           │                      │                      │               │   │
│   │           │ refUID               │ refUID               │ refUID        │   │
│   │           ▼                      ▼                      ▼               │   │
│   │  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐        │   │
│   │  │📋 KYA-CAPABILITY│   │🧬 KYA-PROVENANCE│   │🔐 KYA-DELEGATION│        │   │
│   │  │                 │   │                 │   │                 │        │   │
│   │  │ TRANSACT: ✅    │   │ Source: 0xddd...│   │ From: Alice     │        │   │
│   │  │ SIGN: ✅        │   │ Model: Claude   │   │ To: TradingBot  │        │   │
│   │  │ DEPLOY: ❌      │   │ Audit: ✅       │   │ Scope: trading  │        │   │
│   │  │ Expires: 30d    │   │                 │   │ Depth: 0        │        │   │
│   │  └────────┬────────┘   └─────────────────┘   └────────┬────────┘        │   │
│   │           │                                           │                 │   │
│   │           │ refUID                                    │ refUID          │   │
│   │           ▼                                           ▼                 │   │
│   │  ┌─────────────────┐                        ┌─────────────────┐         │   │
│   │  │   Session Key   │                        │  Sub-Delegation │         │   │
│   │  │  (ephemeral)    │                        │  to RebalancerBot│        │   │
│   │  │  Expires: 1hr   │                        │  Depth: 1        │         │   │
│   │  └─────────────────┘                        └─────────────────┘         │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   Every path leads back to Alice. That's accountability.                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## The Verification Flow

What happens when a service needs to verify an agent?

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                          VERIFICATION IN ACTION                                 │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   🤖 Agent                          🏦 DeFi Protocol                    │   │
│   │      │                                   │                              │   │
│   │      │   "I want to swap 1000 USDC"      │                              │   │
│   │      ├──────────────────────────────────►│                              │   │
│   │      │                                   │                              │   │
│   │      │                                   │  ┌─────────────────────────┐ │   │
│   │      │                                   │  │ 1. Check KYA-Identity   │ │   │
│   │      │                                   │  │    - Exists? ✅         │ │   │
│   │      │                                   │  │    - Revoked? ❌        │ │   │
│   │      │                                   │  │    - Owner verified? ✅ │ │   │
│   │      │                                   │  │                         │ │   │
│   │      │                                   │  │ 2. Check KYA-Capability │ │   │
│   │      │                                   │  │    - TRANSACT? ✅       │ │   │
│   │      │                                   │  │    - Expired? ❌        │ │   │
│   │      │                                   │  │    - Revoked? ❌        │ │   │
│   │      │                                   │  │                         │ │   │
│   │      │                                   │  │ 3. Check Conditions     │ │   │
│   │      │                                   │  │    - Amount ≤ limit? ✅ │ │   │
│   │      │                                   │  │    - Time ok? ✅        │ │   │
│   │      │                                   │  │    - Country ok? ✅     │ │   │
│   │      │                                   │  │                         │ │   │
│   │      │                                   │  │ 4. All checks passed    │ │   │
│   │      │                                   │  └─────────────────────────┘ │   │
│   │      │                                   │                              │   │
│   │      │   ✅ Swap executed                │                              │   │
│   │      │◄──────────────────────────────────┤                              │   │
│   │      │                                   │                              │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## x402 Integration: Paid APIs for Agents

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                         KYA + x402 = TRUSTED PAYMENTS                           │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   🤖 Agent                🌐 API Server           ⛓️ Blockchain          │   │
│   │      │                        │                        │                │   │
│   │      │  GET /data             │                        │                │   │
│   │      ├───────────────────────►│                        │                │   │
│   │      │                        │                        │                │   │
│   │      │  402 Payment Required  │                        │                │   │
│   │      │  + KYA requirements    │                        │                │   │
│   │      │◄───────────────────────┤                        │                │   │
│   │      │                        │                        │                │   │
│   │      │  ┌─────────────────────────────────────────┐    │                │   │
│   │      │  │ Requirements:                           │    │                │   │
│   │      │  │   price: $0.001                         │    │                │   │
│   │      │  │   KYA-Identity: required                │    │                │   │
│   │      │  │   KYA-Capability: TRANSACT required     │    │                │   │
│   │      │  │   min_trust_level: 50                   │    │                │   │
│   │      │  └─────────────────────────────────────────┘    │                │   │
│   │      │                        │                        │                │   │
│   │      │  GET /data             │                        │                │   │
│   │      │  X-PAYMENT: [signed]   │                        │                │   │
│   │      │  X-KYA-Identity: 0x... │                        │                │   │
│   │      │  X-KYA-Capability: 0x..│                        │                │   │
│   │      ├───────────────────────►│                        │                │   │
│   │      │                        │                        │                │   │
│   │      │                        │  Verify KYA            │                │   │
│   │      │                        ├───────────────────────►│                │   │
│   │      │                        │◄───────────────────────┤                │   │
│   │      │                        │  ✅ Valid              │                │   │
│   │      │                        │                        │                │   │
│   │      │                        │  Settle payment        │                │   │
│   │      │                        ├───────────────────────►│                │   │
│   │      │                        │◄───────────────────────┤                │   │
│   │      │                        │  ✅ Settled            │                │   │
│   │      │                        │                        │                │   │
│   │      │  200 OK + Data         │                        │                │   │
│   │      │◄───────────────────────┤                        │                │   │
│   │      │                        │                        │                │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   The API knows: WHO is paying, WHAT they can do, WHO is accountable.           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Revocation: The Kill Switch

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                         INSTANT GLOBAL REVOCATION                               │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   BEFORE                              AFTER                             │   │
│   │   ══════                              ═════                             │   │
│   │                                                                         │   │
│   │   ┌─────────────────────┐             ┌─────────────────────┐           │   │
│   │   │ 🪪 KYA-Identity     │             │ 🪪 KYA-Identity     │           │   │
│   │   │                     │             │                     │           │   │
│   │   │ Status: ✅ VALID    │   revoke()  │ Status: ❌ REVOKED  │           │   │
│   │   │ revocationTime: 0   │ ──────────► │ revocationTime: now │           │   │
│   │   │                     │             │                     │           │   │
│   │   └─────────────────────┘             └─────────────────────┘           │   │
│   │                                                                         │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│   │   │                                                                 │   │   │
│   │   │   CASCADING EFFECT:                                             │   │   │
│   │   │                                                                 │   │   │
│   │   │   When identity is revoked, all capabilities and delegations    │   │   │
│   │   │   that reference it should be treated as INVALID.               │   │   │
│   │   │                                                                 │   │   │
│   │   │   🪪 Identity ──► ❌ REVOKED                                     │   │   │
│   │   │        │                                                        │   │   │
│   │   │        ├──► 📋 Capability ──► ⚠️ INVALID (parent revoked)       │   │   │
│   │   │        │                                                        │   │   │
│   │   │        ├──► 📋 Capability ──► ⚠️ INVALID (parent revoked)       │   │   │
│   │   │        │                                                        │   │   │
│   │   │        └──► 🔐 Delegation ──► ⚠️ INVALID (parent revoked)       │   │   │
│   │   │                                                                 │   │   │
│   │   └─────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                         │   │
│   │   Revocation is:                                                        │   │
│   │   • INSTANT - Takes effect in the same block                            │   │
│   │   • GLOBAL - All verifiers see it immediately                           │   │
│   │   • PERMANENT - Cannot be un-revoked                                    │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## The One Rule

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                                                                                 │
│                                                                                 │
│           ╔═══════════════════════════════════════════════════════════╗         │
│           ║                                                           ║         │
│           ║                                                           ║         │
│           ║                                                           ║         │
│           ║         EVERY CHAIN ENDS AT A HUMAN.                      ║         │
│           ║                                                           ║         │
│           ║                     ALWAYS.                               ║         │
│           ║                                                           ║         │
│           ║                                                           ║         │
│           ╚═══════════════════════════════════════════════════════════╝         │
│                                                                                 │
│                                                                                 │
│                                                                                 │
│                   🤖 ───► 🤖 ───► 🤖 ───► 👤                                    │
│                                            ▲                                    │
│                                            │                                    │
│                                   This is the accountability anchor.            │
│                                   No matter how many agents are in              │
│                                   the chain, someone is responsible.            │
│                                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Now?

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                        THE CONVERGENCE WINDOW: 2025-2026                        │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   2024                     2025                     2026                │   │
│   │   ════                     ════                     ════                │   │
│   │                                                                         │   │
│   │   AI agents                x402 processes           EU AI Act           │   │
│   │   emerge                   $24M                     enforced            │   │
│   │        │                        │                        │              │   │
│   │        │                        │                        │              │   │
│   │        ▼                        ▼                        ▼              │   │
│   │   ┌─────────┐             ┌─────────┐             ┌─────────┐           │   │
│   │   │Experiment│            │ Growth  │             │Regulation│          │   │
│   │   │   al    │            │         │             │         │           │   │
│   │   │No rules │            │Standards │            │Standards │          │   │
│   │   │         │            │ forming │             │ locked  │           │   │
│   │   └─────────┘             └─────────┘             └─────────┘           │   │
│   │                                                                         │   │
│   │                    ▲                                                    │   │
│   │                    │                                                    │   │
│   │                    │                                                    │   │
│   │                    └── WE ARE HERE                                      │   │
│   │                                                                         │   │
│   │   ═══════════════════════════════════════════════════════════════════   │   │
│   │                                                                         │   │
│   │   THE WINDOW FOR AGENT IDENTITY STANDARDS IS CLOSING.                   │   │
│   │                                                                         │   │
│   │   By August 2026, the EU AI Act requires compliance.                    │   │
│   │   First mover advantage is real. Standards that exist will be adopted.  │   │
│   │   Waiting means fragmentation becomes permanent.                        │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## TL;DR - The Elevator Pitch

> **"KYA is a passport system for AI agents.**
>
> **Humans have KYC—Know Your Customer. Agents need KYA—Know Your Agent.**
>
> **The problem:** AI agents are already transacting billions, but they can't prove who they are, what they're authorized to do, or who's responsible when they fail. You can't ask an AI for a passport.
>
> **KYA solves this** with four composable attestation schemas—Identity, Capability, Provenance, and Delegation—built on infrastructure that already exists (Ethereum Attestation Service).
>
> **The key insight:** Every agent identity chain must terminate at a human. That's how you maintain accountability in a world of autonomous systems."

---

*Visual Concepts Guide v1.0 | KYA Protocol*
