/**
 * Setup script for x402 demo attestations
 *
 * Deploys demo attestations to Base Sepolia using the KYA SDK:
 * - Identity attestation for a trading bot agent
 * - Capability attestation with TRANSACT | SIGN permissions
 * - Delegation attestation for trading execution scope
 *
 * Usage:
 *   npx tsx scripts/setup-x402-demo.ts
 *
 * Required environment variables:
 *   DEMO_PRIVATE_KEY - Private key for the demo wallet
 *   BASE_SEPOLIA_RPC_URL - RPC URL for Base Sepolia
 */

import { ethers } from "ethers";
import { KYA, Permissions } from "@kya/sdk";

// Load environment variables from multiple locations
import * as dotenv from "dotenv";
import * as path from "path";

// Load contracts .env first (has the real key), then allow root .env to override
const contractsEnvPath = path.resolve(process.cwd(), "packages/contracts/.env");
const rootEnvPath = path.resolve(process.cwd(), ".env");

const result1 = dotenv.config({ path: contractsEnvPath });
const result2 = dotenv.config({ path: rootEnvPath, override: true });

// Debug: show which env files were loaded
if (result1.error) {
  console.log(`Note: Could not load ${contractsEnvPath}: ${result1.error.message}`);
}
if (result2.error && !result2.error.message.includes("ENOENT")) {
  console.log(`Note: Could not load ${rootEnvPath}: ${result2.error.message}`);
}

// Support both DEMO_PRIVATE_KEY and DEPLOYER_PRIVATE_KEY for flexibility
// Handle private key with or without 0x prefix, trim whitespace
const rawEnvKey = (process.env.DEMO_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || "").trim();
let rawKey = rawEnvKey.replace(/^0x/, "");

// Auto-fix common issues: if 65 chars with leading 0, remove it
if (rawKey.length === 65 && rawKey.startsWith("0")) {
  rawKey = rawKey.slice(1);
}

const DEMO_PRIVATE_KEY = rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey) ? rawKey : null;
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

// Demo agent address (can be any address - typically a smart contract or EOA acting as an agent)
// For this demo, we'll derive a separate agent address from a deterministic seed
const AGENT_SEED = "kya-demo-trading-bot-alpha";

async function main() {
  console.log("=== KYA x402 Demo Setup ===\n");

  // Validate environment variables
  if (!DEMO_PRIVATE_KEY) {
    throw new Error("Missing or invalid DEPLOYER_PRIVATE_KEY environment variable (must be 64 hex characters)");
  }

  // Create provider and signer
  console.log("1. Setting up provider and signer...");
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(DEMO_PRIVATE_KEY, provider);
  const ownerAddress = await signer.getAddress();
  console.log(`   Owner address: ${ownerAddress}`);

  // Derive a deterministic agent address for the demo
  const agentWallet = ethers.Wallet.createRandom();
  const agentAddress = agentWallet.address;
  console.log(`   Agent address: ${agentAddress}`);

  // Check balance
  const balance = await provider.getBalance(ownerAddress);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
  if (balance === 0n) {
    console.warn("\n   WARNING: Wallet has 0 ETH. Get testnet ETH from a faucet.");
    console.warn("   Base Sepolia faucet: https://www.coinbase.com/faucets/base-sepolia-faucet\n");
  }

  // Initialize KYA SDK
  console.log("\n2. Initializing KYA SDK...");
  const kya = new KYA({
    network: "base-sepolia",
    signer,
  });
  console.log("   KYA SDK initialized for base-sepolia");

  // Create Identity attestation
  console.log("\n3. Creating Identity attestation...");
  console.log(`   Agent: ${agentAddress}`);
  console.log(`   Owner: ${ownerAddress}`);
  console.log(`   Display Name: "Trading Bot Alpha"`);

  const identityUID = await kya.createIdentity({
    agentAddress,
    ownerAddress,
    displayName: "Trading Bot Alpha",
    description: "Autonomous trading agent for x402 demo",
  });
  console.log(`   Identity UID: ${identityUID}`);

  // Create Capability attestation
  console.log("\n4. Creating Capability attestation...");
  const permissions = Permissions.TRANSACT | Permissions.SIGN;
  // expiresAt needs to be in milliseconds for the SDK
  const expiresAtMs = (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000; // 30 days in ms
  console.log(`   Parent Identity: ${identityUID}`);
  console.log(`   Permissions: TRANSACT | SIGN (bitmask: ${permissions})`);
  console.log(`   Expires: ${new Date(expiresAtMs).toISOString()}`);

  const capabilityUID = await kya.createCapability({
    parentIdentityUID: identityUID,
    permissions,
    expiresAt: expiresAtMs,
    trustLevel: 2, // Medium trust
  });
  console.log(`   Capability UID: ${capabilityUID}`);

  // Create Delegation attestation
  console.log("\n5. Creating Delegation attestation...");
  const delegationExpiresAtMs = (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) * 1000; // 30 days in ms
  console.log(`   Parent Identity: ${identityUID}`);
  console.log(`   Delegator: ${ownerAddress}`);
  console.log(`   Delegatee: ${agentAddress}`);
  console.log(`   Scope: "trading:execute"`);
  console.log(`   Depth: 0 (no sub-delegation)`);

  const delegationUID = await kya.createDelegation({
    parentIdentityUID: identityUID,
    delegator: ownerAddress,
    delegatee: agentAddress,
    scope: "trading:execute",
    depth: 0,
    expiresAt: delegationExpiresAtMs,
  });
  console.log(`   Delegation UID: ${delegationUID}`);

  // Output summary
  console.log("\n=== Setup Complete ===\n");
  console.log("Attestation UIDs created on Base Sepolia:\n");
  console.log(`  Identity:   ${identityUID}`);
  console.log(`  Capability: ${capabilityUID}`);
  console.log(`  Delegation: ${delegationUID}`);
  console.log(`\n  Agent Address: ${agentAddress}`);
  console.log(`  Owner Address: ${ownerAddress}`);

  console.log("\n--- Update data.ts with these values ---\n");
  console.log(`export const DEMO_ATTESTATIONS = {
  identity: "${identityUID}",
  capability: "${capabilityUID}",
  delegation: "${delegationUID}",
  agentAddress: "${agentAddress}",
  ownerAddress: "${ownerAddress}",
};`);

  console.log("\n--- EAS Explorer Links ---\n");
  console.log(`  Identity:   https://base-sepolia.easscan.org/attestation/view/${identityUID}`);
  console.log(`  Capability: https://base-sepolia.easscan.org/attestation/view/${capabilityUID}`);
  console.log(`  Delegation: https://base-sepolia.easscan.org/attestation/view/${delegationUID}`);
}

main().catch((error) => {
  console.error("\nError:", error.message || error);
  process.exit(1);
});
