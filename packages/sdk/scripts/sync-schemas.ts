#!/usr/bin/env npx ts-node

/**
 * Sync Schema UIDs from deployment artifacts to SDK constants
 *
 * This script reads the deployment JSON from packages/contracts/deployments/
 * and updates packages/sdk/src/constants.ts with the actual schema UIDs.
 *
 * Usage:
 *   npm run sync-schemas -- --network base-sepolia
 *   npx ts-node scripts/sync-schemas.ts --network base-sepolia
 */

import * as fs from "fs";
import * as path from "path";

interface DeploymentInfo {
  network: string;
  chainId: number;
  schemas: {
    identity: string;
    capability: string;
    provenance: string;
    delegation: string;
  };
  contracts: {
    KYAIdentityResolver: string;
    KYACapabilityResolver: string;
  };
}

function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const networkIdx = args.indexOf("--network");
  const network = networkIdx !== -1 ? args[networkIdx + 1] : "base-sepolia";

  if (!network) {
    console.error("Usage: sync-schemas --network <network-name>");
    process.exit(1);
  }

  // Paths
  const deploymentPath = path.resolve(
    __dirname,
    `../../contracts/deployments/${network}.json`
  );
  const constantsPath = path.resolve(__dirname, "../src/constants.ts");

  // Check deployment file exists
  if (!fs.existsSync(deploymentPath)) {
    console.error(`Deployment file not found: ${deploymentPath}`);
    console.error(
      "Run the deployment script first: npm run deploy:base-sepolia"
    );
    process.exit(1);
  }

  // Read deployment info
  const deployment: DeploymentInfo = JSON.parse(
    fs.readFileSync(deploymentPath, "utf-8")
  );

  console.log(`Reading deployment for network: ${deployment.network}`);
  console.log(`Chain ID: ${deployment.chainId}`);
  console.log(`Schema UIDs:`);
  console.log(`  identity: ${deployment.schemas.identity}`);
  console.log(`  capability: ${deployment.schemas.capability}`);
  console.log(`  provenance: ${deployment.schemas.provenance}`);
  console.log(`  delegation: ${deployment.schemas.delegation}`);

  // Read constants file
  let constantsContent = fs.readFileSync(constantsPath, "utf-8");

  // Replace schema UIDs for this network using line-by-line parsing
  const lines = constantsContent.split("\n");
  let inNetwork = false;
  let inSchemas = false;
  const newLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect entering the target network block
    if (line.includes(`"${network}"`)) {
      inNetwork = true;
    }

    // Detect entering schemas block within network
    if (inNetwork && line.includes("schemas:") && line.includes("{")) {
      inSchemas = true;
      newLines.push("    schemas: {");
      newLines.push(`      identity: "${deployment.schemas.identity}",`);
      newLines.push(`      capability: "${deployment.schemas.capability}",`);
      newLines.push(`      provenance: "${deployment.schemas.provenance}",`);
      newLines.push(`      delegation: "${deployment.schemas.delegation}",`);
      // Skip until we find the closing brace of schemas
      while (i < lines.length - 1 && !lines[i + 1].trim().startsWith("},")) {
        i++;
      }
      continue;
    }

    // Reset flags when exiting network block
    if (inNetwork && line.trim() === "},") {
      inNetwork = false;
      inSchemas = false;
    }

    newLines.push(line);
  }

  // Write updated constants
  fs.writeFileSync(constantsPath, newLines.join("\n"));

  console.log(`\nUpdated ${constantsPath}`);
  console.log("Schema UIDs synced successfully!");
}

main();
