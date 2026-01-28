import { describe, it, expect } from "vitest";
import { ethers } from "ethers";
import { encodeIdentity, encodeCapability, encodeProvenance, encodeDelegation, hashString } from "../schemas.js";
import { Permissions, SCHEMA_STRINGS } from "../constants.js";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

describe("hashString", () => {
  it("should return keccak256 of input", () => {
    const result = hashString("hello");
    expect(result).toBe(ethers.keccak256(ethers.toUtf8Bytes("hello")));
  });
});

describe("Permissions", () => {
  it("should have correct bitmask values", () => {
    expect(Permissions.TRANSACT).toBe(1n);
    expect(Permissions.SIGN).toBe(2n);
    expect(Permissions.DEPLOY).toBe(4n);
    expect(Permissions.ADMIN).toBe(8n);
    expect(Permissions.READ_PRIVATE).toBe(16n);
    expect(Permissions.DELEGATE).toBe(32n);
    expect(Permissions.CROSS_CHAIN).toBe(64n);
  });

  it("should support bitwise OR for combining", () => {
    const combined = Permissions.TRANSACT | Permissions.SIGN;
    expect(combined).toBe(3n);
  });
});

describe("encodeIdentity", () => {
  it("should produce valid ABI-encoded data", () => {
    const encoded = encodeIdentity({
      agentAddress: "0x1234567890123456789012345678901234567890",
      ownerAddress: "0x0987654321098765432109876543210987654321",
      displayName: "TestBot",
    });

    expect(encoded).toBeDefined();
    expect(typeof encoded).toBe("string");
    expect(encoded.startsWith("0x")).toBe(true);

    // Should be decodable with the identity schema
    const encoder = new SchemaEncoder(SCHEMA_STRINGS.identity);
    const decoded = encoder.decodeData(encoded);
    expect(decoded).toHaveLength(8);

    const agentAddr = decoded.find((d) => d.name === "agentAddress");
    expect(agentAddr?.value.value).toBe("0x1234567890123456789012345678901234567890");

    const ownerAddr = decoded.find((d) => d.name === "ownerAddress");
    expect(ownerAddr?.value.value).toBe("0x0987654321098765432109876543210987654321");

    const version = decoded.find((d) => d.name === "version");
    expect(version?.value.value).toBe(1n);
  });
});

describe("encodeCapability", () => {
  it("should encode permissions correctly", () => {
    const encoded = encodeCapability({
      parentIdentityUID: ethers.ZeroHash,
      permissions: Permissions.TRANSACT | Permissions.SIGN,
      trustLevel: 80,
    });

    const encoder = new SchemaEncoder(SCHEMA_STRINGS.capability);
    const decoded = encoder.decodeData(encoded);

    const permissions = decoded.find((d) => d.name === "permissions");
    expect(permissions?.value.value).toBe(3n);

    const trustLevel = decoded.find((d) => d.name === "trustLevel");
    expect(trustLevel?.value.value).toBe(80n);
  });
});

describe("encodeProvenance", () => {
  it("should encode provenance data", () => {
    const sourceHash = ethers.keccak256(ethers.toUtf8Bytes("commit-abc123"));
    const encoded = encodeProvenance({
      parentIdentityUID: ethers.ZeroHash,
      sourceCodeHash: sourceHash,
      provenanceType: 1, // source
    });

    const encoder = new SchemaEncoder(SCHEMA_STRINGS.provenance);
    const decoded = encoder.decodeData(encoded);

    const source = decoded.find((d) => d.name === "sourceCodeHash");
    expect(source?.value.value).toBe(sourceHash);

    const pType = decoded.find((d) => d.name === "provenanceType");
    expect(pType?.value.value).toBe(1n);
  });
});

describe("encodeDelegation", () => {
  it("should encode delegation data", () => {
    const encoded = encodeDelegation({
      parentIdentityUID: ethers.ZeroHash,
      delegator: "0x1111111111111111111111111111111111111111",
      delegatee: "0x2222222222222222222222222222222222222222",
      depth: 1,
    });

    const encoder = new SchemaEncoder(SCHEMA_STRINGS.delegation);
    const decoded = encoder.decodeData(encoded);

    const delegator = decoded.find((d) => d.name === "delegator");
    expect(delegator?.value.value).toBe("0x1111111111111111111111111111111111111111");

    const delegatee = decoded.find((d) => d.name === "delegatee");
    expect(delegatee?.value.value).toBe("0x2222222222222222222222222222222222222222");

    const depth = decoded.find((d) => d.name === "depth");
    expect(depth?.value.value).toBe(1n);
  });
});
