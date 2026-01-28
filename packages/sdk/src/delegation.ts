import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { encodeDelegation } from "./schemas.js";
import type { CreateDelegationParams } from "./types.js";

export async function createDelegation(
  eas: EAS,
  schemaUID: string,
  params: CreateDelegationParams,
  recipient: string
): Promise<string> {
  const data = encodeDelegation(params);

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
