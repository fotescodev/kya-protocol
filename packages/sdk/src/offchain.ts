import { EAS, Offchain, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { encodeIdentity, encodeCapability } from "./schemas.js";
import type { CreateIdentityParams, CreateCapabilityParams } from "./types.js";

export async function createIdentityOffchain(
  eas: EAS,
  schemaUID: string,
  params: CreateIdentityParams,
  signer: ethers.Signer
): Promise<{ uid: string; offchainAttestation: unknown }> {
  const offchain = await eas.getOffchain();
  const data = encodeIdentity(params);

  const attestation = await offchain.signOffchainAttestation(
    {
      schema: schemaUID,
      recipient: params.agentAddress,
      expirationTime: 0n,
      revocable: true,
      refUID: ethers.ZeroHash,
      data,
      time: BigInt(Math.floor(Date.now() / 1000)),
    },
    signer
  );

  return {
    uid: attestation.uid,
    offchainAttestation: attestation,
  };
}

export async function createCapabilityOffchain(
  eas: EAS,
  schemaUID: string,
  params: CreateCapabilityParams,
  recipient: string,
  signer: ethers.Signer
): Promise<{ uid: string; offchainAttestation: unknown }> {
  const offchain = await eas.getOffchain();
  const data = encodeCapability(params);

  const attestation = await offchain.signOffchainAttestation(
    {
      schema: schemaUID,
      recipient,
      expirationTime: params.expiresAt
        ? BigInt(Math.floor(params.expiresAt / 1000))
        : 0n,
      revocable: true,
      refUID: params.parentIdentityUID,
      data,
      time: BigInt(Math.floor(Date.now() / 1000)),
    },
    signer
  );

  return {
    uid: attestation.uid,
    offchainAttestation: attestation,
  };
}
