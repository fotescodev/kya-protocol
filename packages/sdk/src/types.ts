import { ethers } from "ethers";

export interface KYAConfig {
  network: string;
  signer: ethers.Signer;
  /** Override schema UIDs (useful for custom deployments) */
  schemaUIDs?: {
    identity?: string;
    capability?: string;
    provenance?: string;
    delegation?: string;
  };
}

export interface CreateIdentityParams {
  agentAddress: string;
  ownerAddress: string;
  displayName: string;
  description?: string;
  agentDID?: string;
  metadataURI?: string;
}

export interface CreateCapabilityParams {
  parentIdentityUID: string;
  permissions: bigint;
  targetContract?: string;
  expiresAt?: number;
  conditionsHash?: string;
  trustLevel?: number;
  capabilityId?: string;
}

export interface CreateProvenanceParams {
  parentIdentityUID: string;
  sourceCodeHash: string;
  provenanceType: number;
  modelHash?: string;
  buildHash?: string;
  builderAddress?: string;
  auditReportHash?: string;
  previousVersionUID?: string;
}

export interface CreateDelegationParams {
  parentIdentityUID: string;
  delegator: string;
  delegatee: string;
  scope?: string;
  constraints?: bigint;
  expiresAt?: number;
  depth?: number;
}

export interface VerifyResult {
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
  };
}

export interface OffchainAttestationResult {
  uid: string;
  signature: ethers.SignatureLike;
}
