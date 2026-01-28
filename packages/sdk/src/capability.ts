import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { encodeCapability } from "./schemas.js";
import type { CreateCapabilityParams } from "./types.js";

export async function createCapability(
  eas: EAS,
  schemaUID: string,
  params: CreateCapabilityParams,
  recipient: string
): Promise<string> {
  const data = encodeCapability(params);

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient,
      expirationTime: params.expiresAt
        ? BigInt(Math.floor(params.expiresAt / 1000))
        : 0n,
      revocable: true,
      refUID: params.parentIdentityUID,
      data,
      value: 0n,
    },
  });

  return await tx.wait();
}

export async function revokeCapability(
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
