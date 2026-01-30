import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "dotenv/config";

// Handle private key with or without 0x prefix, trim whitespace
// Only use if it's exactly 64 hex characters (32 bytes)
// Also handle case where key is 65 chars with leading 0
let rawKey = process.env.DEPLOYER_PRIVATE_KEY?.trim().replace(/^0x/, "") || "";
if (rawKey.length === 65 && rawKey.startsWith("0") && /^[0-9a-fA-F]+$/.test(rawKey)) {
  rawKey = rawKey.slice(1);
}
const privateKey = rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey) ? rawKey : "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: { enabled: true, runs: 1_000_000 },
          evmVersion: "cancun",
        },
      },
      {
        version: "0.8.27",
        settings: {
          optimizer: { enabled: true, runs: 1_000_000 },
          evmVersion: "cancun",
        },
      },
    ],
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      chainId: 84532,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    L2: "base",
    L2Etherscan: process.env.BASESCAN_API_KEY,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    reportFormat: "terminal",
    showMethodSig: true,
    showTimeSpent: true,
  },
};

export default config;
