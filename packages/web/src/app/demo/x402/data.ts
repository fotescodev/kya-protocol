// Demo data for x402 payment protocol demonstration

// =============================================================================
// TypeScript Interfaces
// =============================================================================

export interface DemoIdentity {
  uid: string;
  displayName: string;
  description: string;
  ownerAddress: string;
  agentAddress: string;
}

export interface DemoCapability {
  uid: string;
  permissions: string[];
  permissionsBitmask: string;
}

export interface DemoDelegation {
  uid: string;
  delegator: string;
  delegatee: string;
  scope: string;
  depth: number;
}

export interface DemoAgent {
  identity: DemoIdentity;
  capability: DemoCapability;
  delegation: DemoDelegation;
}

export interface DemoToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  chainName: string;
}

export interface VerificationStep {
  id: string;
  label: string;
  icon: string;
  duration: number;
  color: string;
}

// =============================================================================
// Demo Agent Data
// =============================================================================

export const DEMO_AGENT: DemoAgent = {
  identity: {
    uid: '0x6ba4ce7faff6c1c0c09c320e1f3d64f69b66c577f6135a26bae079d815d4f00a',
    displayName: 'Trading Bot Alpha',
    description: 'Autonomous trading agent for x402 demo',
    ownerAddress: '0x6A0E9E21eb8681c45260cE71dd969BA5Dbb28A91',
    agentAddress: '0x825329E9666B8Eb97bbaF8E623E9E98462b2A60d',
  },
  capability: {
    uid: '0xa96e6ce8fa24709796bc7e4af7574258cd85315820d2420d109f490de3e0bfdc',
    permissions: ['TRANSACT', 'SIGN'],
    permissionsBitmask: '0x0000000000000000000000000000000000000000000000000000000000000003',
  },
  delegation: {
    uid: '0xe0b62f44024dca674127eccb784e1465ee1aa46eb5f22abea45d4878998c3f99',
    delegator: '0x6A0E9E21eb8681c45260cE71dd969BA5Dbb28A91',
    delegatee: '0x825329E9666B8Eb97bbaF8E623E9E98462b2A60d',
    scope: 'trading:execute',
    depth: 0,
  },
};

// =============================================================================
// Demo Tokens (Base Sepolia Testnet)
// =============================================================================

export const DEMO_TOKENS: DemoToken[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals: 6,
    chainId: 84532,
    chainName: 'Base Sepolia',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    chainId: 84532,
    chainName: 'Base Sepolia',
  },
];

// =============================================================================
// Verification Steps
// =============================================================================

export const VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: 'request-received',
    label: 'Request Received',
    icon: 'inbox',
    duration: 300,
    color: 'gray',
  },
  {
    id: 'kya-identity',
    label: 'KYA Identity',
    icon: 'user-check',
    duration: 800,
    color: 'blue',
  },
  {
    id: 'transact-capability',
    label: 'TRANSACT Capability',
    icon: 'shield-check',
    duration: 600,
    color: 'cyan',
  },
  {
    id: 'delegation-chain',
    label: 'Delegation Chain',
    icon: 'link',
    duration: 500,
    color: 'purple',
  },
  {
    id: 'x402-payment',
    label: 'x402 Payment',
    icon: 'dollar-sign',
    duration: 2000,
    color: 'green',
  },
  {
    id: 'data-delivered',
    label: 'Data Delivered',
    icon: 'check-circle',
    duration: 400,
    color: 'green',
  },
];
