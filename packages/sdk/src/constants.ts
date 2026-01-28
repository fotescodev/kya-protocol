/** Permission bitmask values for KYA-Capability attestations */
export const Permissions = {
  TRANSACT: 1n << 0n,
  SIGN: 1n << 1n,
  DEPLOY: 1n << 2n,
  ADMIN: 1n << 3n,
  READ_PRIVATE: 1n << 4n,
  DELEGATE: 1n << 5n,
  CROSS_CHAIN: 1n << 6n,
} as const;

/** Network configuration for KYA protocol */
export interface NetworkConfig {
  chainId: number;
  easAddress: string;
  schemaRegistryAddress: string;
  schemas: {
    identity: string;
    capability: string;
    provenance: string;
    delegation: string;
  };
}

/** EAS predeploy addresses on Base Sepolia */
const BASE_SEPOLIA_EAS = "0x4200000000000000000000000000000000000021";
const BASE_SEPOLIA_SCHEMA_REGISTRY = "0x4200000000000000000000000000000000000020";

/**
 * Schema UIDs — populated after deployment.
 * Until deployed, these are placeholders. After running `deploy.ts`,
 * replace with actual UIDs from `deployments/base-sepolia.json`.
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  "base-sepolia": {
    chainId: 84532,
    easAddress: BASE_SEPOLIA_EAS,
    schemaRegistryAddress: BASE_SEPOLIA_SCHEMA_REGISTRY,
    schemas: {
      identity: "0x0000000000000000000000000000000000000000000000000000000000000000",
      capability: "0x0000000000000000000000000000000000000000000000000000000000000000",
      provenance: "0x0000000000000000000000000000000000000000000000000000000000000000",
      delegation: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
  },
};

/** Raw schema definition strings */
export const SCHEMA_STRINGS = {
  identity:
    "bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI",
  capability:
    "bytes32 capabilityId,uint256 permissions,address targetContract,uint64 grantedAt,uint64 expiresAt,bytes32 conditionsHash,uint8 trustLevel",
  provenance:
    "bytes32 sourceCodeHash,bytes32 modelHash,bytes32 buildHash,address builderAddress,bytes32 auditReportHash,uint64 buildTimestamp,bytes32 previousVersionUID,uint8 provenanceType",
  delegation:
    "address delegator,address delegatee,bytes32 scope,uint256 constraints,uint64 delegatedAt,uint64 expiresAt,uint8 depth",
} as const;
