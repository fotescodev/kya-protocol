import { ethers } from "hardhat";

// Base Sepolia predeploy addresses
const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";
const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020";

// Schema strings
const IDENTITY_SCHEMA =
  "bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI";
const CAPABILITY_SCHEMA =
  "bytes32 capabilityId,uint256 permissions,address targetContract,uint64 grantedAt,uint64 expiresAt,bytes32 conditionsHash,uint8 trustLevel";
const PROVENANCE_SCHEMA =
  "bytes32 sourceCodeHash,bytes32 modelHash,bytes32 buildHash,address builderAddress,bytes32 auditReportHash,uint64 buildTimestamp,bytes32 previousVersionUID,uint8 provenanceType";
const DELEGATION_SCHEMA =
  "address delegator,address delegatee,bytes32 scope,uint256 constraints,uint64 delegatedAt,uint64 expiresAt,uint8 depth";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const schemaRegistry = await ethers.getContractAt(
    "ISchemaRegistry",
    SCHEMA_REGISTRY_ADDRESS
  );

  // 1. Deploy KYAIdentityResolver
  console.log("\n1. Deploying KYAIdentityResolver...");
  const IdentityResolver = await ethers.getContractFactory("KYAIdentityResolver");
  const identityResolver = await IdentityResolver.deploy(
    EAS_ADDRESS,
    deployer.address,
    true // whitelistEnabled
  );
  await identityResolver.waitForDeployment();
  const identityResolverAddress = await identityResolver.getAddress();
  console.log("   KYAIdentityResolver:", identityResolverAddress);

  // Whitelist deployer as initial attester
  await identityResolver.addAuthorizedAttester(deployer.address);
  console.log("   Whitelisted deployer as attester");

  // 2. Register Identity schema
  console.log("\n2. Registering Identity schema...");
  const identityTx = await schemaRegistry.register(
    IDENTITY_SCHEMA,
    identityResolverAddress,
    true
  );
  const identityReceipt = await identityTx.wait();
  const identitySchemaUID = identityReceipt?.logs[0]?.topics[1];
  console.log("   Identity schema UID:", identitySchemaUID);

  // 3. Deploy KYACapabilityResolver
  console.log("\n3. Deploying KYACapabilityResolver...");
  const CapabilityResolver = await ethers.getContractFactory("KYACapabilityResolver");
  const capabilityResolver = await CapabilityResolver.deploy(
    EAS_ADDRESS,
    identitySchemaUID!
  );
  await capabilityResolver.waitForDeployment();
  const capabilityResolverAddress = await capabilityResolver.getAddress();
  console.log("   KYACapabilityResolver:", capabilityResolverAddress);

  // 4. Register Capability schema
  console.log("\n4. Registering Capability schema...");
  const capabilityTx = await schemaRegistry.register(
    CAPABILITY_SCHEMA,
    capabilityResolverAddress,
    true
  );
  const capabilityReceipt = await capabilityTx.wait();
  const capabilitySchemaUID = capabilityReceipt?.logs[0]?.topics[1];
  console.log("   Capability schema UID:", capabilitySchemaUID);

  // 5. Register Provenance schema (no resolver)
  console.log("\n5. Registering Provenance schema (no resolver)...");
  const provenanceTx = await schemaRegistry.register(
    PROVENANCE_SCHEMA,
    ethers.ZeroAddress,
    true
  );
  const provenanceReceipt = await provenanceTx.wait();
  const provenanceSchemaUID = provenanceReceipt?.logs[0]?.topics[1];
  console.log("   Provenance schema UID:", provenanceSchemaUID);

  // 6. Register Delegation schema (no resolver)
  console.log("\n6. Registering Delegation schema (no resolver)...");
  const delegationTx = await schemaRegistry.register(
    DELEGATION_SCHEMA,
    ethers.ZeroAddress,
    true
  );
  const delegationReceipt = await delegationTx.wait();
  const delegationSchemaUID = delegationReceipt?.logs[0]?.topics[1];
  console.log("   Delegation schema UID:", delegationSchemaUID);

  // 7. Write deployment info
  const deployment = {
    network: "base-sepolia",
    chainId: 84532,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      KYAIdentityResolver: identityResolverAddress,
      KYACapabilityResolver: capabilityResolverAddress,
    },
    schemas: {
      identity: identitySchemaUID,
      capability: capabilitySchemaUID,
      provenance: provenanceSchemaUID,
      delegation: delegationSchemaUID,
    },
    eas: {
      EAS: EAS_ADDRESS,
      SchemaRegistry: SCHEMA_REGISTRY_ADDRESS,
    },
  };

  const fs = await import("fs");
  const path = await import("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, "base-sepolia.json"),
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n=== Deployment Complete ===");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
