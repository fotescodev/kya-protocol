import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { SCHEMA_STRINGS } from "./constants.js";
import type { VerifyResult } from "./types.js";

export async function verify(
  eas: EAS,
  uid: string,
  expectedSchemaUID?: string
): Promise<VerifyResult> {
  const attestation = await eas.getAttestation(uid);

  // Check attestation exists
  if (!attestation || attestation.uid === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return { valid: false, reason: "Attestation not found" };
  }

  // Check if revoked
  if (attestation.revocationTime !== 0n) {
    return { valid: false, reason: "Attestation has been revoked" };
  }

  // Check if expired
  if (
    attestation.expirationTime !== 0n &&
    attestation.expirationTime < BigInt(Math.floor(Date.now() / 1000))
  ) {
    return { valid: false, reason: "Attestation has expired" };
  }

  // Check schema match if expected
  if (expectedSchemaUID && attestation.schema !== expectedSchemaUID) {
    return { valid: false, reason: "Schema mismatch" };
  }

  // Try to decode the data based on known schemas
  let decoded: Record<string, unknown> | undefined;
  for (const [name, schemaString] of Object.entries(SCHEMA_STRINGS)) {
    try {
      const encoder = new SchemaEncoder(schemaString);
      const decodedData = encoder.decodeData(attestation.data);
      decoded = Object.fromEntries(
        decodedData.map((item) => [item.name, item.value.value])
      );
      break;
    } catch {
      // Not this schema, try next
    }
  }

  return {
    valid: true,
    decoded,
    attestation: {
      uid: attestation.uid,
      attester: attestation.attester,
      recipient: attestation.recipient,
      time: attestation.time,
      revocationTime: attestation.revocationTime,
      expirationTime: attestation.expirationTime,
    },
  };
}
