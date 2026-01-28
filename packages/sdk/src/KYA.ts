import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { NETWORKS, Permissions } from "./constants.js";
import { hashString } from "./schemas.js";
import { createIdentity, revokeIdentity } from "./identity.js";
import { createCapability, revokeCapability } from "./capability.js";
import { createProvenance } from "./provenance.js";
import { createDelegation } from "./delegation.js";
import { verify } from "./verify.js";
import {
  createIdentityOffchain,
  createCapabilityOffchain,
} from "./offchain.js";
import type {
  KYAConfig,
  CreateIdentityParams,
  CreateCapabilityParams,
  CreateProvenanceParams,
  CreateDelegationParams,
  VerifyResult,
} from "./types.js";

export class KYA {
  private eas: EAS;
  private signer: ethers.Signer;
  private schemas: {
    identity: string;
    capability: string;
    provenance: string;
    delegation: string;
  };

  /** Permission bitmask constants */
  static Permissions = Permissions;

  /** Hash a string with keccak256 */
  static hashString = hashString;

  constructor(config: KYAConfig) {
    const network = NETWORKS[config.network];
    if (!network) {
      throw new Error(`Unknown network: ${config.network}. Available: ${Object.keys(NETWORKS).join(", ")}`);
    }

    this.eas = new EAS(network.easAddress);
    this.eas.connect(config.signer);
    this.signer = config.signer;

    this.schemas = {
      identity: config.schemaUIDs?.identity || network.schemas.identity,
      capability: config.schemaUIDs?.capability || network.schemas.capability,
      provenance: config.schemaUIDs?.provenance || network.schemas.provenance,
      delegation: config.schemaUIDs?.delegation || network.schemas.delegation,
    };
  }

  // --- Identity ---

  async createIdentity(params: CreateIdentityParams): Promise<string> {
    return createIdentity(this.eas, this.schemas.identity, params);
  }

  async createIdentityOffchain(params: CreateIdentityParams) {
    return createIdentityOffchain(
      this.eas,
      this.schemas.identity,
      params,
      this.signer
    );
  }

  async revokeIdentity(uid: string): Promise<void> {
    return revokeIdentity(this.eas, this.schemas.identity, uid);
  }

  // --- Capability ---

  async createCapability(
    params: CreateCapabilityParams & { recipient?: string }
  ): Promise<string> {
    const recipient = params.recipient || (await this.signer.getAddress());
    return createCapability(this.eas, this.schemas.capability, params, recipient);
  }

  async createCapabilityOffchain(
    params: CreateCapabilityParams & { recipient?: string }
  ) {
    const recipient = params.recipient || (await this.signer.getAddress());
    return createCapabilityOffchain(
      this.eas,
      this.schemas.capability,
      params,
      recipient,
      this.signer
    );
  }

  async revokeCapability(uid: string): Promise<void> {
    return revokeCapability(this.eas, this.schemas.capability, uid);
  }

  // --- Provenance ---

  async createProvenance(
    params: CreateProvenanceParams & { recipient?: string }
  ): Promise<string> {
    const recipient = params.recipient || (await this.signer.getAddress());
    return createProvenance(this.eas, this.schemas.provenance, params, recipient);
  }

  // --- Delegation ---

  async createDelegation(
    params: CreateDelegationParams & { recipient?: string }
  ): Promise<string> {
    const recipient = params.recipient || (await this.signer.getAddress());
    return createDelegation(this.eas, this.schemas.delegation, params, recipient);
  }

  // --- Verification ---

  async verify(uid: string): Promise<VerifyResult> {
    return verify(this.eas, uid);
  }
}
