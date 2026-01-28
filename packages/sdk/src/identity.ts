import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { encodeIdentity } from "./schemas.js";
import type { CreateIdentityParams } from "./types.js";

export async function createIdentity(
  eas: EAS,
  schemaUID: string,
  params: CreateIdentityParams
): Promise<string> {
  const data = encodeIdentity(params);

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: params.agentAddress,
      expirationTime: 0n,
      revocable: true,
      refUID: ethers.ZeroHash,
      data,
      value: 0n,
    },
  });

  return await tx.wait();
}

export async function revokeIdentity(
  eas: EAS,
  schemaUID: string,
  uid: string
): Promise<void> {
  const tx = await eas.revoke({
    schema: schemaUID,
    data: { uid, value: 0n },
  });
  await tx.wait();
}
