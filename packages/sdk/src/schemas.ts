import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { SCHEMA_STRINGS } from "./constants.js";
import type {
  CreateIdentityParams,
  CreateCapabilityParams,
  CreateProvenanceParams,
  CreateDelegationParams,
} from "./types.js";

const ZERO_HASH = ethers.ZeroHash;
const ZERO_ADDRESS = ethers.ZeroAddress;

function hashString(value: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

export function encodeIdentity(params: CreateIdentityParams): string {
  const encoder = new SchemaEncoder(SCHEMA_STRINGS.identity);
  return encoder.encodeData([
    {
      name: "agentDID",
      value: params.agentDID
        ? hashString(params.agentDID)
        : hashString(`did:ethr:base:${params.agentAddress}`),
      type: "bytes32",
    },
    { name: "agentAddress", value: params.agentAddress, type: "address" },
    { name: "ownerAddress", value: params.ownerAddress, type: "address" },
    { name: "displayNameHash", value: hashString(params.displayName), type: "bytes32" },
    {
      name: "descriptionHash",
      value: params.description ? hashString(params.description) : ZERO_HASH,
      type: "bytes32",
    },
    {
      name: "createdAt",
      value: BigInt(Math.floor(Date.now() / 1000)),
      type: "uint64",
    },
    { name: "version", value: 1, type: "uint8" },
    {
      name: "metadataURI",
      value: params.metadataURI ? hashString(params.metadataURI) : ZERO_HASH,
      type: "bytes32",
    },
  ]);
}

export function encodeCapability(params: CreateCapabilityParams): string {
  const encoder = new SchemaEncoder(SCHEMA_STRINGS.capability);
  return encoder.encodeData([
    {
      name: "capabilityId",
      value: params.capabilityId
        ? hashString(params.capabilityId)
        : hashString(`cap-${Date.now()}`),
      type: "bytes32",
    },
    { name: "permissions", value: params.permissions, type: "uint256" },
    {
      name: "targetContract",
      value: params.targetContract || ZERO_ADDRESS,
      type: "address",
    },
    {
      name: "grantedAt",
      value: BigInt(Math.floor(Date.now() / 1000)),
      type: "uint64",
    },
    {
      name: "expiresAt",
      value: params.expiresAt ? BigInt(Math.floor(params.expiresAt / 1000)) : 0n,
      type: "uint64",
    },
    {
      name: "conditionsHash",
      value: params.conditionsHash || ZERO_HASH,
      type: "bytes32",
    },
    { name: "trustLevel", value: params.trustLevel ?? 100, type: "uint8" },
  ]);
}

export function encodeProvenance(params: CreateProvenanceParams): string {
  const encoder = new SchemaEncoder(SCHEMA_STRINGS.provenance);
  return encoder.encodeData([
    { name: "sourceCodeHash", value: params.sourceCodeHash, type: "bytes32" },
    { name: "modelHash", value: params.modelHash || ZERO_HASH, type: "bytes32" },
    { name: "buildHash", value: params.buildHash || ZERO_HASH, type: "bytes32" },
    {
      name: "builderAddress",
      value: params.builderAddress || ZERO_ADDRESS,
      type: "address",
    },
    {
      name: "auditReportHash",
      value: params.auditReportHash || ZERO_HASH,
      type: "bytes32",
    },
    {
      name: "buildTimestamp",
      value: BigInt(Math.floor(Date.now() / 1000)),
      type: "uint64",
    },
    {
      name: "previousVersionUID",
      value: params.previousVersionUID || ZERO_HASH,
      type: "bytes32",
    },
    { name: "provenanceType", value: params.provenanceType, type: "uint8" },
  ]);
}

export function encodeDelegation(params: CreateDelegationParams): string {
  const encoder = new SchemaEncoder(SCHEMA_STRINGS.delegation);
  return encoder.encodeData([
    { name: "delegator", value: params.delegator, type: "address" },
    { name: "delegatee", value: params.delegatee, type: "address" },
    {
      name: "scope",
      value: params.scope ? hashString(params.scope) : ZERO_HASH,
      type: "bytes32",
    },
    { name: "constraints", value: params.constraints ?? 0n, type: "uint256" },
    {
      name: "delegatedAt",
      value: BigInt(Math.floor(Date.now() / 1000)),
      type: "uint64",
    },
    {
      name: "expiresAt",
      value: params.expiresAt ? BigInt(Math.floor(params.expiresAt / 1000)) : 0n,
      type: "uint64",
    },
    { name: "depth", value: params.depth ?? 1, type: "uint8" },
  ]);
}

export { hashString };
