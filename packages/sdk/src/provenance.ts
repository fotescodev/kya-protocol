import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { encodeProvenance } from "./schemas.js";
import type { CreateProvenanceParams } from "./types.js";

export async function createProvenance(
  eas: EAS,
  schemaUID: string,
  params: CreateProvenanceParams,
  recipient: string
): Promise<string> {
  const data = encodeProvenance(params);

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient,
      expirationTime: 0n,
      revocable: true,
      refUID: params.parentIdentityUID,
      data,
      value: 0n,
    },
  });

  return await tx.wait();
}
