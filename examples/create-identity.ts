/**
 * Example: Create a KYA identity attestation on Base Sepolia
 *
 * Prerequisites:
 *   1. Deploy contracts: cd packages/contracts && npx hardhat run scripts/deploy.ts --network baseSepolia
 *   2. Copy schema UIDs from deployments/base-sepolia.json into this script
 *   3. Set PRIVATE_KEY env variable
 *
 * Run:
 *   npx ts-node examples/create-identity.ts
 */

import { KYA } from "@kya/sdk";
import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider(
    process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const address = await signer.getAddress();

  console.log("Signer address:", address);

  // Initialize KYA SDK
  const kya = new KYA({
    network: "base-sepolia",
    signer,
    // After deploying, paste your schema UIDs here:
    // schemaUIDs: {
    //   identity: "0x...",
    //   capability: "0x...",
    // },
  });

  // Create an identity attestation
  console.log("\nCreating identity attestation...");
  const identityUID = await kya.createIdentity({
    agentAddress: address,
    ownerAddress: address,
    displayName: "Example Agent",
    description: "A test agent created by the KYA SDK example",
  });
  console.log("Identity UID:", identityUID);

  // Verify the attestation
  console.log("\nVerifying attestation...");
  const result = await kya.verify(identityUID);
  console.log("Valid:", result.valid);
  if (result.decoded) {
    console.log("Decoded data:", result.decoded);
  }

  // Grant a capability
  console.log("\nGranting TRANSACT + SIGN capability...");
  const capUID = await kya.createCapability({
    parentIdentityUID: identityUID,
    permissions: KYA.Permissions.TRANSACT | KYA.Permissions.SIGN,
    recipient: address,
  });
  console.log("Capability UID:", capUID);

  console.log("\nDone! View on EAS:");
  console.log(`  https://base-sepolia.easscan.org/attestation/view/${identityUID}`);
}

main().catch(console.error);
