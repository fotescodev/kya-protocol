/**
 * Simple schema registration script for x402 demo
 *
 * Registers KYA schemas on Base Sepolia WITHOUT resolvers (simpler, faster)
 *
 * Usage: npx tsx scripts/register-schemas.ts
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load env from contracts package
dotenv.config({ path: path.resolve(process.cwd(), "packages/contracts/.env") });

const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020";

// Schema strings
const SCHEMAS = {
  identity:
    "bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI",
  capability:
    "bytes32 capabilityId,uint256 permissions,address targetContract,uint64 grantedAt,uint64 expiresAt,bytes32 conditionsHash,uint8 trustLevel",
  provenance:
    "bytes32 sourceCodeHash,bytes32 modelHash,bytes32 buildHash,address builderAddress,bytes32 auditReportHash,uint64 buildTimestamp,bytes32 previousVersionUID,uint8 provenanceType",
  delegation:
    "address delegator,address delegatee,bytes32 scope,uint256 constraints,uint64 delegatedAt,uint64 expiresAt,uint8 depth",
};

// Schema Registry ABI (minimal)
const SCHEMA_REGISTRY_ABI = [
  "function register(string calldata schema, address resolver, bool revocable) external returns (bytes32)",
  "event Registered(bytes32 indexed uid, address indexed registerer, tuple(bytes32 uid, address resolver, bool revocable, string schema) schema)"
];

async function main() {
  console.log("=== KYA Schema Registration ===\n");

  // Get private key
  let rawKey = (process.env.DEPLOYER_PRIVATE_KEY || "").trim().replace(/^0x/, "");
  if (rawKey.length === 65 && rawKey.startsWith("0")) {
    rawKey = rawKey.slice(1);
  }
  if (rawKey.length !== 64) {
    throw new Error("Invalid DEPLOYER_PRIVATE_KEY");
  }

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const signer = new ethers.Wallet(rawKey, provider);
  console.log("Deployer:", await signer.getAddress());

  const balance = await provider.getBalance(signer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  const schemaRegistry = new ethers.Contract(SCHEMA_REGISTRY_ADDRESS, SCHEMA_REGISTRY_ABI, signer);

  const schemaUIDs: Record<string, string> = {};

  for (const [name, schema] of Object.entries(SCHEMAS)) {
    console.log(`Registering ${name} schema...`);
    try {
      const tx = await schemaRegistry.register(schema, ethers.ZeroAddress, true);
      console.log(`  Tx: ${tx.hash}`);
      const receipt = await tx.wait();
      const uid = receipt?.logs[0]?.topics[1];
      schemaUIDs[name] = uid || "unknown";
      console.log(`  UID: ${uid}\n`);
    } catch (error: any) {
      // If schema already exists, try to compute its UID
      console.log(`  Error: ${error.message}`);
      console.log(`  Schema may already be registered.\n`);
    }
  }

  console.log("=== Registration Complete ===\n");
  console.log("Schema UIDs:");
  console.log(JSON.stringify(schemaUIDs, null, 2));

  // Write to deployment file
  const deployment = {
    network: "base-sepolia",
    chainId: 84532,
    deployer: await signer.getAddress(),
    timestamp: new Date().toISOString(),
    contracts: {},
    schemas: schemaUIDs,
    eas: {
      EAS: "0x4200000000000000000000000000000000000021",
      SchemaRegistry: SCHEMA_REGISTRY_ADDRESS,
    },
  };

  const deploymentsDir = path.join(process.cwd(), "packages/contracts/deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, "base-sepolia.json"),
    JSON.stringify(deployment, null, 2)
  );
  console.log("\nSaved to packages/contracts/deployments/base-sepolia.json");
}

main().catch(console.error);
