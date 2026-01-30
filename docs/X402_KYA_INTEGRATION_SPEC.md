# Technical Specification: x402 + KYA Integration Demo

**Version**: 1.0
**Date**: January 29, 2026
**Author**: Engineering Team
**Status**: Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Success Criteria](#2-goals--success-criteria)
3. [System Architecture](#3-system-architecture)
4. [Technical Stack](#4-technical-stack)
5. [Component Specifications](#5-component-specifications)
6. [API Specifications](#6-api-specifications)
7. [Data Models](#7-data-models)
8. [Implementation Phases](#8-implementation-phases)
9. [Security Considerations](#9-security-considerations)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment & Environment](#11-deployment--environment)
12. [Risks & Mitigations](#12-risks--mitigations)

---

## 1. Executive Summary

### 1.1 Problem Statement

As AI agents increasingly consume APIs autonomously, service providers like Alchemy face three challenges:

1. **Identity**: Who is this agent making requests?
2. **Authorization**: What is this agent allowed to do?
3. **Accountability**: Who is responsible when something goes wrong?
4. **Payment**: How do agents pay for API access without human intervention?

### 1.2 Proposed Solution

Demonstrate how **KYA Protocol** (Know Your Agent) combined with **x402** (HTTP payment protocol) solves all four challenges:

- **KYA** provides on-chain verifiable identity, capabilities, and delegation chains
- **x402** enables micropayments ($0.001/request) without subscription friction

### 1.3 Demo Narrative

> "A Trading Agent needs token balance data from Alchemy's API. Before accessing the data, the agent must prove its identity (KYA Identity), demonstrate it has permission to transact (KYA Capability), show accountability to a human owner (KYA Delegation), and pay for access (x402 payment). Only when all four criteria are met does the agent receive the data."

---

## 2. Goals & Success Criteria

### 2.1 Primary Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **Functional Demo** | Working end-to-end flow on testnet | Complete request cycle with real payment |
| **Visual Impact** | Impressive UI for interview setting | Animated verification flow, professional design |
| **Technical Proof** | Real on-chain verification | Attestations verifiable on EAS explorer |
| **Alchemy Relevance** | Directly applicable to their use case | Mock API returns Alchemy-style responses |

### 2.2 Non-Goals (Out of Scope)

- Production-ready code (this is a demo)
- Multiple network support (Base Sepolia only)
- Real Alchemy API integration (mock responses)
- Persistent state or database
- User authentication beyond wallet connection

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js 15)                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        /demo/x402 Page                              │    │
│  │  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │    │
│  │  │ WalletPanel │  │ AgentIdentity   │  │   ApiRequestPanel       │  │    │
│  │  │             │  │ Panel           │  │                         │  │    │
│  │  │ • Connect   │  │ • Identity      │  │ • Token selector        │  │    │
│  │  │ • Balance   │  │ • Capability    │  │ • Execute button        │  │    │
│  │  │ • Network   │  │ • Delegation    │  │ • Response viewer       │  │    │
│  │  └─────────────┘  └─────────────────┘  └─────────────────────────┘  │    │
│  │                                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                   VerificationFlow                          │    │    │
│  │  │  [Request] → [Identity] → [Capability] → [Payment] → [Data] │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      │ HTTP + Headers                       │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    /api/alchemy/token (API Route)                   │    │
│  │                                                                     │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │    │
│  │  │ x402 Middleware│  │ KYA Verifier  │  │ Token Data Handler    │   │    │
│  │  │               │  │               │  │                       │   │    │
│  │  │ • Parse 402   │  │ • Check EAS   │  │ • Mock Alchemy resp   │   │    │
│  │  │ • Verify pay  │  │ • Validate    │  │ • Format JSON-RPC     │   │    │
│  │  │ • Settle USDC │  │   permissions │  │                       │   │    │
│  │  └───────────────┘  └───────────────┘  └───────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │                              │
                    ▼                              ▼
    ┌───────────────────────────┐    ┌───────────────────────────────────┐
    │   x402 Facilitator        │    │   Ethereum Attestation Service    │
    │   (x402.org/facilitator)  │    │   (Base Sepolia)                  │
    │                           │    │                                   │
    │   • Verify payment sig    │    │   • Identity attestation          │
    │   • Settle USDC on-chain  │    │   • Capability attestation        │
    │   • Return tx hash        │    │   • Delegation attestation        │
    │                           │    │                                   │
    │   Network: Base Sepolia   │    │   Address: 0x4200...0021          │
    └───────────────────────────┘    └───────────────────────────────────┘
```

### 3.2 Request Flow Sequence

```
┌────────┐          ┌────────┐          ┌────────────┐          ┌───────┐          ┌─────┐
│  User  │          │   UI   │          │  API Route │          │  EAS  │          │x402 │
└───┬────┘          └───┬────┘          └─────┬──────┘          └───┬───┘          └──┬──┘
    │                   │                     │                     │                 │
    │ Click "Request"   │                     │                     │                 │
    │──────────────────>│                     │                     │                 │
    │                   │                     │                     │                 │
    │                   │ GET /api/alchemy/token                    │                 │
    │                   │ Headers: X-KYA-Identity, X-KYA-Capability │                 │
    │                   │────────────────────>│                     │                 │
    │                   │                     │                     │                 │
    │                   │                     │ getAttestation(identityUID)           │
    │                   │                     │────────────────────>│                 │
    │                   │                     │                     │                 │
    │                   │                     │<────────────────────│                 │
    │                   │                     │  attestation data   │                 │
    │                   │                     │                     │                 │
    │                   │                     │ (repeat for capability, delegation)   │
    │                   │                     │                     │                 │
    │                   │  402 Payment Required                     │                 │
    │                   │  + PAYMENT-REQUIRED header                │                 │
    │                   │<────────────────────│                     │                 │
    │                   │                     │                     │                 │
    │ Sign payment      │                     │                     │                 │
    │<──────────────────│                     │                     │                 │
    │                   │                     │                     │                 │
    │ Signature         │                     │                     │                 │
    │──────────────────>│                     │                     │                 │
    │                   │                     │                     │                 │
    │                   │ Retry with PAYMENT-SIGNATURE header       │                 │
    │                   │────────────────────>│                     │                 │
    │                   │                     │                     │                 │
    │                   │                     │ verify(payment)     │                 │
    │                   │                     │────────────────────────────────────────>│
    │                   │                     │                     │                 │
    │                   │                     │<────────────────────────────────────────│
    │                   │                     │  verification OK    │                 │
    │                   │                     │                     │                 │
    │                   │                     │ settle(payment)     │                 │
    │                   │                     │────────────────────────────────────────>│
    │                   │                     │                     │                 │
    │                   │                     │<────────────────────────────────────────│
    │                   │                     │  tx hash            │                 │
    │                   │                     │                     │                 │
    │                   │  200 OK + Token Data                      │                 │
    │                   │  + PAYMENT-RESPONSE header                │                 │
    │                   │<────────────────────│                     │                 │
    │                   │                     │                     │                 │
    │ Display result    │                     │                     │                 │
    │<──────────────────│                     │                     │                 │
    │                   │                     │                     │                 │
```

### 3.3 Component Dependency Graph

```
                    ┌──────────────────┐
                    │  npm install     │
                    │  dependencies    │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ wagmi.ts    │   │ x402-client │   │ demo/data   │
    │ (config)    │   │ (utility)   │   │ (constants) │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
           ▼                 │                 │
    ┌─────────────┐          │          ┌──────┴──────┐
    │ Web3Provider│          │          │             │
    └──────┬──────┘          │          ▼             ▼
           │                 │   ┌─────────────┐ ┌─────────────┐
           ▼                 │   │ AgentPanel  │ │ VerifyFlow  │
    ┌─────────────┐          │   └──────┬──────┘ └──────┬──────┘
    │ layout.tsx  │          │          │               │
    │ (update)    │          │          │               │
    └──────┬──────┘          │          │               │
           │                 │          │               │
           ▼                 │          │               │
    ┌──────┴──────┐          │          │               │
    │             │          │          │               │
    ▼             ▼          │          │               │
┌─────────┐ ┌─────────┐      │          │               │
│ Wallet  │ │ Request │      │          │               │
│ Panel   │ │ Panel   │      │          │               │
└────┬────┘ └────┬────┘      │          │               │
     │           │           │          │               │
     └─────┬─────┴───────────┴──────────┴───────────────┘
           │
           ▼
    ┌─────────────┐
    │ X402Demo    │
    │ (main)      │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐         ┌─────────────┐
    │ page.tsx    │         │ API Route   │
    │ (entry)     │         │ /api/...    │
    └─────────────┘         └─────────────┘
```

---

## 4. Technical Stack

### 4.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.7.x | Type safety |
| Tailwind CSS | 4.x | Styling (glassmorphic design) |
| wagmi | 2.x | React hooks for Ethereum |
| viem | 2.x | TypeScript Ethereum library |
| @tanstack/react-query | 5.x | Async state management |

### 4.2 x402 Protocol

| Package | Purpose |
|---------|---------|
| @x402/core | Core protocol types and utilities |
| @x402/evm | EVM payment scheme (Base Sepolia) |
| @x402/next | Next.js API route middleware |
| @x402/fetch | Client-side fetch wrapper |

### 4.3 KYA Protocol

| Package | Purpose |
|---------|---------|
| @kya/sdk | Create and verify attestations |
| @ethereum-attestation-service/eas-sdk | Direct EAS queries |
| ethers | Ethereum provider (EAS dependency) |

### 4.4 External Services

| Service | Network | Endpoint |
|---------|---------|----------|
| x402 Facilitator | Base Sepolia | https://x402.org/facilitator |
| EAS | Base Sepolia | 0x4200000000000000000000000000000000000021 |
| Base Sepolia RPC | Base Sepolia | https://sepolia.base.org |
| USDC Contract | Base Sepolia | 0x036CbD53842c5426634e7929541eC2318f3dCF7e |

---

## 5. Component Specifications

### 5.1 WalletPanel Component

**File**: `packages/web/src/app/demo/x402/components/WalletPanel.tsx`

**Purpose**: Manage wallet connection and display balances

**Props**: None (uses wagmi hooks)

**State**:
- Connection status (from useAccount)
- ETH balance (from useBalance)
- USDC balance (from useBalance with token)

**UI Elements**:
```
┌─────────────────────────────────┐
│  🔷 Agent Wallet                │
│  Connected to Base Sepolia      │
├─────────────────────────────────┤
│  Address                        │
│  ┌─────────────────────────┐    │
│  │ 0x742d...f44e           │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌───────────┐ ┌───────────┐    │
│  │ ETH       │ │ USDC      │    │
│  │ 0.0234    │ │ $10.50    │    │
│  └───────────┘ └───────────┘    │
│                                 │
│  [Base Sepolia]                 │
│                                 │
│  [ Disconnect ]                 │
└─────────────────────────────────┘
```

**Behavior**:
1. When disconnected: Show connector buttons (MetaMask, Coinbase, WalletConnect)
2. When connected: Show address (truncated), balances, network badge
3. Wrong network: Show "Switch to Base Sepolia" button

---

### 5.2 AgentIdentityPanel Component

**File**: `packages/web/src/app/demo/x402/components/AgentIdentityPanel.tsx`

**Purpose**: Display KYA attestation credentials

**Props**:
```typescript
interface AgentIdentityPanelProps {
  identity: {
    uid: string;
    displayName: string;
    ownerAddress: string;
  };
  capability: {
    uid: string;
    permissions: string[];
  };
  delegation: {
    uid: string;
    delegator: string;
    scope: string;
    depth: number;
  };
}
```

**UI Elements**:
```
┌─────────────────────────────────┐
│  🛡️ KYA Identity                │
│  On-chain attestations          │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ IDENTITY        [Valid] │    │
│  │ 0x1234567890abcd...     │    │
│  │ Trading Bot Alpha       │    │
│  │ Owner: 0x8ba1...        │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ CAPABILITY    [TRANSACT]│    │
│  │ [TRANSACT] [SIGN]       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ DELEGATION    [Depth: 0]│    │
│  │ Delegated by: 0x8ba1... │    │
│  │ Scope: trading:execute  │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Behavior**:
- Each card links to EAS explorer
- Permission badges are color-coded
- Shows validity status

---

### 5.3 ApiRequestPanel Component

**File**: `packages/web/src/app/demo/x402/components/ApiRequestPanel.tsx`

**Purpose**: Configure and execute API requests

**Props**:
```typescript
interface ApiRequestPanelProps {
  onExecute: (params: RequestParams) => Promise<void>;
  isLoading: boolean;
  response: TokenResponse | null;
  error: string | null;
}
```

**State**:
- selectedToken: string (token address)
- walletAddress: string (auto-filled from connected wallet)

**UI Elements**:
```
┌─────────────────────────────────┐
│  📊 Alchemy Token API           │
│  KYA-Verified Access            │
├─────────────────────────────────┤
│  Token                          │
│  ┌─────────────────────────┐    │
│  │ USDC (0x036C...)    ▼   │    │
│  └─────────────────────────┘    │
│                                 │
│  Wallet to Query                │
│  ┌─────────────────────────┐    │
│  │ 0x742d35Cc6634C...      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Cost: $0.001 USDC         │  │
│  │ Network: Base Sepolia     │  │
│  └───────────────────────────┘  │
│                                 │
│  [ Request Token Data ]         │
│                                 │
│  Response:                      │
│  ┌─────────────────────────┐    │
│  │ {                       │    │
│  │   "jsonrpc": "2.0",     │    │
│  │   "result": { ... }     │    │
│  │ }                       │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

### 5.4 VerificationFlow Component

**File**: `packages/web/src/app/demo/x402/components/VerificationFlow.tsx`

**Purpose**: Animated visualization of the verification process

**Props**:
```typescript
interface VerificationFlowProps {
  currentStep: number;        // -1 = idle, 0-5 = active step
  status: 'idle' | 'running' | 'success' | 'error';
  errorStep?: number;
  errorMessage?: string;
}
```

**Steps**:
| Step | Label | Icon | Color | Duration |
|------|-------|------|-------|----------|
| 0 | Request Received | inbox | gray | 300ms |
| 1 | KYA Identity | user-check | blue | 800ms |
| 2 | TRANSACT Capability | shield-check | cyan | 600ms |
| 3 | Delegation Chain | link | purple | 500ms |
| 4 | x402 Payment | dollar-sign | green | 2000ms |
| 5 | Data Delivered | check-circle | green | 400ms |

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Verification Flow                                          [Processing...] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ○────────○────────●────────○────────○────────○                           │
│  Request  Identity  Capability Delegation Payment   Data                    │
│                        ↑                                                    │
│                    (active)                                                 │
│              "Check TRANSACT permission"                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Animations**:
- Progress line fills as steps complete
- Active step pulses
- Completed steps show checkmark
- Error state shows X with red color

---

### 5.5 X402Demo Component (Main Orchestrator)

**File**: `packages/web/src/app/demo/x402/X402Demo.tsx`

**Purpose**: Orchestrate all panels and manage demo state

**State**:
```typescript
interface DemoState {
  // Verification flow
  currentStep: number;
  status: 'idle' | 'running' | 'success' | 'error';
  errorStep?: number;
  errorMessage?: string;

  // Response
  response: TokenResponse | null;

  // Logs
  logs: LogEntry[];
}
```

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│                     x402 + KYA Demo                             │
│  See how agent identity verification + micropayments work       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐ ┌─────────────────┐ ┌─────────────────────┐  │
│  │               │ │                 │ │                     │  │
│  │  WalletPanel  │ │ AgentIdentity   │ │   ApiRequestPanel   │  │
│  │               │ │ Panel           │ │                     │  │
│  │               │ │                 │ │                     │  │
│  └───────────────┘ └─────────────────┘ └─────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   VerificationFlow                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Request Execution Logic**:
```typescript
async function executeRequest(params: RequestParams) {
  setStatus('running');
  setCurrentStep(0);
  addLog('Sending request to /api/alchemy/token...');

  // Step 1: Request
  await delay(300);
  setCurrentStep(1);
  addLog('Verifying Identity attestation...');

  // Build headers
  const headers = {
    'X-KYA-Identity': DEMO_AGENT.identity.uid,
    'X-KYA-Capability': DEMO_AGENT.capability.uid,
    'X-KYA-Delegation': DEMO_AGENT.delegation.uid,
  };

  // Step 2-3: KYA verification happens server-side
  await delay(800);
  setCurrentStep(2);
  addLog('Identity verified. Checking TRANSACT capability...');

  await delay(600);
  setCurrentStep(3);
  addLog('Capability confirmed. Validating delegation...');

  await delay(500);
  setCurrentStep(4);
  addLog('Delegation valid. Processing x402 payment...');

  // Step 4: Make actual x402 request
  try {
    const x402Fetch = createX402Fetch(walletClient);
    const response = await x402Fetch(
      `/api/alchemy/token?token=${params.token}&wallet=${params.wallet}`,
      { method: 'GET', headers }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    // Step 5: Success
    setCurrentStep(5);
    addLog('Payment confirmed. Data received.');
    setResponse(data);
    setStatus('success');

  } catch (error) {
    setErrorStep(currentStep);
    setErrorMessage(error.message);
    setStatus('error');
  }
}
```

---

## 6. API Specifications

### 6.1 GET /api/alchemy/token

**Purpose**: Mock Alchemy Token API with x402 payment + KYA verification

**Request**:
```http
GET /api/alchemy/token?token=0x036C...&wallet=0x742d...
X-KYA-Identity: 0x1234567890abcdef...
X-KYA-Capability: 0x5678901234abcdef...
X-KYA-Delegation: 0x9abcdef012345678...
PAYMENT-SIGNATURE: <base64 encoded payment payload>
```

**Response (Success - 200)**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "tokenBalances": [
      {
        "contractAddress": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "tokenBalance": "0x8ac7230489e80000",
        "error": null
      }
    ],
    "pageKey": null
  },
  "meta": {
    "kyaVerified": true,
    "agentIdentity": "0x1234567890abcdef...",
    "verificationDetails": {
      "identity": "valid",
      "capability": "TRANSACT",
      "delegation": "depth:0"
    },
    "timestamp": "2026-01-29T12:00:00Z",
    "priceUSD": 1.0
  }
}
```

**Response (Payment Required - 402)**:
```http
HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: <base64 encoded payment requirements>

{
  "error": "Payment required",
  "price": "$0.001",
  "network": "base-sepolia"
}
```

**Response (KYA Verification Failed - 403)**:
```json
{
  "error": "Invalid or revoked Identity attestation",
  "code": "KYA_VERIFICATION_FAILED",
  "details": {
    "step": "identity",
    "uid": "0x1234..."
  }
}
```

### 6.2 x402 Payment Requirements

The PAYMENT-REQUIRED header contains:
```json
{
  "x402Version": 2,
  "resource": {
    "url": "/api/alchemy/token",
    "description": "Alchemy Token API - KYA Verified",
    "mimeType": "application/json"
  },
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:84532",
      "asset": "usdc",
      "amount": "1000",
      "payTo": "0x...",
      "maxTimeoutSeconds": 300
    }
  ]
}
```

---

## 7. Data Models

### 7.1 Demo Agent Configuration

**File**: `packages/web/src/app/demo/x402/data.ts`

```typescript
export interface DemoAgent {
  agentAddress: string;
  ownerAddress: string;

  identity: {
    uid: string;
    displayName: string;
    description: string;
    agentDID: string;
    createdAt: number;
    easExplorerUrl: string;
  };

  capability: {
    uid: string;
    permissions: string[];
    permissionsBitmask: bigint;
    targetContract: string;
    expiresAt: number;
    trustLevel: number;
    easExplorerUrl: string;
  };

  delegation: {
    uid: string;
    delegator: string;
    delegatee: string;
    scope: string;
    depth: number;
    expiresAt: number;
    easExplorerUrl: string;
  };
}

export const DEMO_AGENT: DemoAgent = {
  agentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  ownerAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",

  identity: {
    uid: "0x...", // Filled after deployment
    displayName: "Trading Bot Alpha",
    description: "Autonomous DeFi trading agent for yield optimization",
    agentDID: "did:ethr:base-sepolia:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    createdAt: 1706500000,
    easExplorerUrl: "https://base-sepolia.easscan.org/attestation/view/0x...",
  },

  capability: {
    uid: "0x...", // Filled after deployment
    permissions: ["TRANSACT", "SIGN"],
    permissionsBitmask: 3n, // TRANSACT(1) | SIGN(2)
    targetContract: "0x0000000000000000000000000000000000000000",
    expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    trustLevel: 100,
    easExplorerUrl: "https://base-sepolia.easscan.org/attestation/view/0x...",
  },

  delegation: {
    uid: "0x...", // Filled after deployment
    delegator: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    delegatee: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    scope: "trading:execute",
    depth: 0,
    expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    easExplorerUrl: "https://base-sepolia.easscan.org/attestation/view/0x...",
  },
};
```

### 7.2 Verification Flow Steps

```typescript
export const VERIFICATION_STEPS = [
  {
    id: "request",
    label: "Request Received",
    icon: "inbox",
    description: "Agent sends API request with KYA headers",
    color: "text-text-secondary",
    duration: 300,
  },
  {
    id: "identity",
    label: "KYA Identity",
    icon: "user-check",
    description: "Verify agent has valid Identity attestation on EAS",
    color: "text-electric",
    duration: 800,
  },
  {
    id: "capability",
    label: "TRANSACT Capability",
    icon: "shield-check",
    description: "Check agent has TRANSACT permission bitmask",
    color: "text-cyan-accent",
    duration: 600,
  },
  {
    id: "delegation",
    label: "Delegation Chain",
    icon: "link",
    description: "Validate delegation traces to human owner",
    color: "text-purple-accent",
    duration: 500,
  },
  {
    id: "payment",
    label: "x402 Payment",
    icon: "dollar-sign",
    description: "Process $0.001 USDC micropayment via x402",
    color: "text-green-accent",
    duration: 2000,
  },
  {
    id: "data",
    label: "Data Delivered",
    icon: "check-circle",
    description: "Return verified token data to agent",
    color: "text-green-accent",
    duration: 400,
  },
] as const;
```

### 7.3 Token Response Type

```typescript
export interface TokenResponse {
  jsonrpc: "2.0";
  id: number;
  result: {
    address: string;
    tokenBalances: Array<{
      contractAddress: string;
      tokenBalance: string; // Hex string
      error: string | null;
    }>;
    pageKey: string | null;
  };
  meta: {
    kyaVerified: boolean;
    agentIdentity: string;
    verificationDetails: {
      identity: string;
      capability: string;
      delegation: string;
    };
    timestamp: string;
    priceUSD: number;
  };
}
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Parallel Tasks)

**Duration**: ~1 hour

| Task | Assignee | Depends On | Output |
|------|----------|------------|--------|
| Install dependencies | - | - | Updated package.json |
| Create data.ts | - | - | Demo constants file |
| Create env template | - | - | .env.example |
| Create setup script | - | - | scripts/setup-x402-demo.ts |

**Parallel Execution**: All 4 tasks can run simultaneously.

---

### Phase 2: Infrastructure (Sequential after Phase 1)

**Duration**: ~1 hour

| Task | Assignee | Depends On | Output |
|------|----------|------------|--------|
| Create wagmi.ts | - | Phase 1 | Wallet config |
| Create Web3Provider | - | Phase 1 | Provider component |
| Create x402-client.ts | - | Phase 1 | Payment utility |
| Update layout.tsx | - | wagmi.ts, Web3Provider | Wrapped app |

**Execution Order**:
1. wagmi.ts + Web3Provider + x402-client.ts (parallel)
2. Update layout.tsx (after wagmi + provider)

---

### Phase 3: API Route (Parallel with Phase 2)

**Duration**: ~1.5 hours

| Task | Assignee | Depends On | Output |
|------|----------|------------|--------|
| Create /api/alchemy/token | - | Phase 1 | Protected API route |

**Implementation Steps**:
1. Set up x402 resource server with facilitator
2. Register EVM exact scheme
3. Implement KYA verification function
4. Add token data handler
5. Wrap with withX402 middleware

---

### Phase 4: UI Components (After Phase 2)

**Duration**: ~2 hours

| Task | Assignee | Depends On | Output |
|------|----------|------------|--------|
| WalletPanel | - | layout.tsx | Wallet UI |
| AgentIdentityPanel | - | data.ts | Attestation display |
| ApiRequestPanel | - | layout.tsx | Request UI |
| VerificationFlow | - | data.ts | Animation component |

**Parallel Execution**: All 4 components can be built simultaneously after dependencies are ready.

---

### Phase 5: Integration (After Phase 4)

**Duration**: ~1.5 hours

| Task | Assignee | Depends On | Output |
|------|----------|------------|--------|
| X402Demo (main) | - | All UI components | Orchestrator |
| page.tsx | - | X402Demo | Page entry |

**Execution Order**:
1. X402Demo (orchestrates all components)
2. page.tsx (simple wrapper)

---

### Phase 6: Testnet Setup (Can start during Phase 3)

**Duration**: ~30 minutes

| Task | Assignee | Depends On | Output |
|------|----------|------------|--------|
| Deploy attestations | - | setup script | Real UIDs |
| Get testnet USDC | - | - | Funded wallet |
| Update data.ts | - | Deploy attestations | Final config |

---

### Phase 7: Testing & Polish (Final)

**Duration**: ~1 hour

| Task | Assignee | Depends On | Output |
|------|----------|------------|--------|
| End-to-end testing | - | All phases | Verified flow |
| Add Demo Mode toggle | - | Testing | Dry-run option |
| Polish animations | - | Testing | Final UI |

---

### Timeline Summary

```
Hour 1:  ████████████████████████████████████████
         Phase 1 (Foundation) - All parallel

Hour 2:  ████████████████████████████████████████
         Phase 2 (Infrastructure) + Phase 3 (API) parallel

Hour 3:  ████████████████████████████████████████
         Phase 4 (UI Components) - All parallel

Hour 4:  ████████████████████████████████████████
         Phase 5 (Integration) + Phase 6 (Testnet)

Hour 5:  ████████████████████████████████████████
         Phase 7 (Testing & Polish)
```

**Total Estimated Time**: 4-5 hours

---

## 9. Security Considerations

### 9.1 Testnet Only

- All operations on Base Sepolia testnet
- No real value at risk
- Demo wallet uses testnet USDC only

### 9.2 Private Key Handling

- Demo wallet private key in .env (gitignored)
- Never commit private keys
- Use environment variables for deployment

### 9.3 API Route Protection

- x402 middleware validates payments before processing
- KYA verification before accepting payment
- No sensitive data in responses

### 9.4 Client-Side

- Wallet signatures happen in user's wallet
- No private keys stored in browser
- Standard wagmi security practices

---

## 10. Testing Strategy

### 10.1 Unit Tests (Optional for Demo)

Not prioritized for demo, but structure allows:
- KYA verification function tests
- x402 middleware tests
- Component render tests

### 10.2 Integration Testing

**Manual Test Script**:

1. **Wallet Connection**
   - [ ] Connect MetaMask to Base Sepolia
   - [ ] Verify address displays correctly
   - [ ] Verify ETH balance displays
   - [ ] Verify USDC balance displays

2. **Agent Identity Display**
   - [ ] Identity card shows correct UID
   - [ ] Capability shows TRANSACT permission
   - [ ] Delegation shows correct delegator
   - [ ] EAS explorer links work

3. **API Request (without payment)**
   - [ ] curl /api/alchemy/token returns 402
   - [ ] PAYMENT-REQUIRED header present

4. **Full Flow**
   - [ ] Click "Request Token Data"
   - [ ] Verification steps animate in order
   - [ ] Wallet prompts for signature
   - [ ] USDC balance decreases by $0.001
   - [ ] Response displays token data
   - [ ] meta.kyaVerified = true

5. **Error Cases**
   - [ ] Wrong network shows error
   - [ ] Insufficient USDC shows error
   - [ ] Invalid attestation returns 403

### 10.3 Demo Mode

For interviews without testnet setup:
- Toggle to simulate flow without real payment
- All animations run
- Mock response returned

---

## 11. Deployment & Environment

### 11.1 Environment Variables

**File**: `packages/web/.env.local`

```bash
# RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# WalletConnect (get from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# x402 Payment Recipient
PAYMENT_WALLET_ADDRESS=0x...

# Demo Agent Attestations (after deployment)
NEXT_PUBLIC_DEMO_IDENTITY_UID=0x...
NEXT_PUBLIC_DEMO_CAPABILITY_UID=0x...
NEXT_PUBLIC_DEMO_DELEGATION_UID=0x...
```

### 11.2 Local Development

```bash
cd packages/web
npm install
npm run dev
# Open http://localhost:3000/demo/x402
```

### 11.3 Testnet Resources

| Resource | URL |
|----------|-----|
| Base Sepolia Faucet | https://www.coinbase.com/faucets/base-sepolia |
| Circle USDC Faucet | https://faucet.circle.com/ |
| EAS Explorer | https://base-sepolia.easscan.org |
| x402 Facilitator | https://x402.org/facilitator |

---

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| x402 facilitator downtime | Demo fails | Low | Add mock fallback mode |
| EAS query latency | Slow verification | Medium | Cache attestation data |
| Testnet USDC depleted | Can't demo payment | Medium | Pre-fund multiple wallets |
| Wagmi/viem breaking changes | Build fails | Low | Pin dependency versions |
| Wallet extension issues | Can't connect | Medium | Support multiple connectors |

### Contingency Plan

If real x402 payment fails during interview:
1. Enable "Demo Mode" toggle
2. Flow animates with mock timing
3. Response shows simulated data
4. Explain that real payments work on testnet

---

## Appendix A: File Checklist

### New Files to Create

```
packages/web/
├── src/
│   ├── app/
│   │   ├── demo/
│   │   │   └── x402/
│   │   │       ├── page.tsx                    [ ]
│   │   │       ├── X402Demo.tsx                [ ]
│   │   │       ├── data.ts                     [ ]
│   │   │       └── components/
│   │   │           ├── WalletPanel.tsx         [ ]
│   │   │           ├── AgentIdentityPanel.tsx  [ ]
│   │   │           ├── ApiRequestPanel.tsx     [ ]
│   │   │           └── VerificationFlow.tsx    [ ]
│   │   └── api/
│   │       └── alchemy/
│   │           └── token/
│   │               └── route.ts                [ ]
│   ├── lib/
│   │   ├── wagmi.ts                            [ ]
│   │   └── x402-client.ts                      [ ]
│   └── providers/
│       └── Web3Provider.tsx                    [ ]

scripts/
└── setup-x402-demo.ts                          [ ]
```

### Files to Modify

```
packages/web/
├── package.json                                [ ] Add dependencies
├── src/app/layout.tsx                          [ ] Add Web3Provider
└── .env.example                                [ ] Add new variables
```

---

## Appendix B: Useful Commands

```bash
# Install dependencies
cd packages/web && npm install wagmi viem @tanstack/react-query @x402/next @x402/fetch @x402/core @x402/evm @ethereum-attestation-service/eas-sdk ethers

# Run development server
npm run dev

# Deploy demo attestations
npx ts-node scripts/setup-x402-demo.ts

# Test API route
curl -v http://localhost:3000/api/alchemy/token

# Check EAS attestation
cast call 0x4200000000000000000000000000000000000021 "getAttestation(bytes32)" <UID> --rpc-url https://sepolia.base.org
```

---

## Appendix C: Reference Links

- [x402 Documentation](https://docs.x402.org)
- [x402 GitHub Repository](https://github.com/coinbase/x402)
- [KYA Protocol SDK](/packages/sdk)
- [EAS Documentation](https://docs.attest.sh)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Wagmi Documentation](https://wagmi.sh)
- [Alchemy Token API Reference](https://docs.alchemy.com/reference/token-api-quickstart)
