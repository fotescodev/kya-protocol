import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

// =============================================================================
// Constants
// =============================================================================

// EAS Contract on Base Sepolia
const EAS_ADDRESS = "0x4200000000000000000000000000000000000021";

// x402 Configuration
const FACILITATOR_URL =
  process.env.FACILITATOR_URL || "https://x402.org/facilitator";
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS as `0x${string}`;

// Base Sepolia RPC
const BASE_SEPOLIA_RPC =
  process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

// =============================================================================
// KYA Verification Types
// =============================================================================

interface KYAVerificationResult {
  valid: boolean;
  reason?: string;
  details?: {
    identity?: { uid: string; verified: boolean; revoked?: boolean };
    capability?: { uid: string; verified: boolean; revoked?: boolean };
    delegation?: { uid: string; verified: boolean; revoked?: boolean };
  };
}

// =============================================================================
// KYA Verification Function
// =============================================================================

/**
 * Verifies KYA attestation headers against EAS on Base Sepolia
 *
 * @param request - The incoming NextRequest with KYA headers
 * @returns Verification result with status and details
 */
async function verifyKYA(request: NextRequest): Promise<KYAVerificationResult> {
  // Extract KYA headers
  const identityUid = request.headers.get("X-KYA-Identity");
  const capabilityUid = request.headers.get("X-KYA-Capability");
  const delegationUid = request.headers.get("X-KYA-Delegation");

  // Check if required headers are present
  if (!identityUid || !capabilityUid || !delegationUid) {
    return {
      valid: false,
      reason: "Missing required KYA headers",
      details: {
        identity: identityUid
          ? { uid: identityUid, verified: false }
          : undefined,
        capability: capabilityUid
          ? { uid: capabilityUid, verified: false }
          : undefined,
        delegation: delegationUid
          ? { uid: delegationUid, verified: false }
          : undefined,
      },
    };
  }

  try {
    // Connect to Base Sepolia
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);

    // Initialize EAS
    const eas = new EAS(EAS_ADDRESS);
    eas.connect(provider);

    // Verify Identity Attestation
    const identityAttestation = await eas.getAttestation(identityUid);
    if (!identityAttestation || identityAttestation.uid === ethers.ZeroHash) {
      return {
        valid: false,
        reason: "Identity attestation not found",
        details: {
          identity: { uid: identityUid, verified: false },
          capability: { uid: capabilityUid, verified: false },
          delegation: { uid: delegationUid, verified: false },
        },
      };
    }
    if (identityAttestation.revocationTime > BigInt(0)) {
      return {
        valid: false,
        reason: "Identity attestation has been revoked",
        details: {
          identity: { uid: identityUid, verified: true, revoked: true },
          capability: { uid: capabilityUid, verified: false },
          delegation: { uid: delegationUid, verified: false },
        },
      };
    }

    // Verify Capability Attestation
    const capabilityAttestation = await eas.getAttestation(capabilityUid);
    if (
      !capabilityAttestation ||
      capabilityAttestation.uid === ethers.ZeroHash
    ) {
      return {
        valid: false,
        reason: "Capability attestation not found",
        details: {
          identity: { uid: identityUid, verified: true, revoked: false },
          capability: { uid: capabilityUid, verified: false },
          delegation: { uid: delegationUid, verified: false },
        },
      };
    }
    if (capabilityAttestation.revocationTime > BigInt(0)) {
      return {
        valid: false,
        reason: "Capability attestation has been revoked",
        details: {
          identity: { uid: identityUid, verified: true, revoked: false },
          capability: { uid: capabilityUid, verified: true, revoked: true },
          delegation: { uid: delegationUid, verified: false },
        },
      };
    }

    // Verify Delegation Attestation
    const delegationAttestation = await eas.getAttestation(delegationUid);
    if (
      !delegationAttestation ||
      delegationAttestation.uid === ethers.ZeroHash
    ) {
      return {
        valid: false,
        reason: "Delegation attestation not found",
        details: {
          identity: { uid: identityUid, verified: true, revoked: false },
          capability: { uid: capabilityUid, verified: true, revoked: false },
          delegation: { uid: delegationUid, verified: false },
        },
      };
    }
    if (delegationAttestation.revocationTime > BigInt(0)) {
      return {
        valid: false,
        reason: "Delegation attestation has been revoked",
        details: {
          identity: { uid: identityUid, verified: true, revoked: false },
          capability: { uid: capabilityUid, verified: true, revoked: false },
          delegation: { uid: delegationUid, verified: true, revoked: true },
        },
      };
    }

    // All attestations verified successfully
    return {
      valid: true,
      details: {
        identity: { uid: identityUid, verified: true, revoked: false },
        capability: { uid: capabilityUid, verified: true, revoked: false },
        delegation: { uid: delegationUid, verified: true, revoked: false },
      },
    };
  } catch (error) {
    console.error("KYA verification error:", error);
    return {
      valid: false,
      reason: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// =============================================================================
// x402 Server Setup
// =============================================================================

// Validate required environment variables
if (!PAYMENT_ADDRESS) {
  console.warn(
    "PAYMENT_ADDRESS environment variable not set. Using placeholder address."
  );
}

// Create HTTP facilitator client
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

// Create x402 resource server and register EVM scheme
const server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(server);

// =============================================================================
// API Handler
// =============================================================================

/**
 * Token balance API handler with KYA verification
 *
 * Returns Alchemy-style token balance response after verifying KYA attestations
 * and processing x402 payment.
 */
const handler = async (request: NextRequest): Promise<NextResponse> => {
  // Verify KYA attestations first
  const kyaResult = await verifyKYA(request);

  if (!kyaResult.valid) {
    return NextResponse.json(
      {
        error: "KYA verification failed",
        reason: kyaResult.reason,
        details: kyaResult.details,
      },
      { status: 403 }
    );
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const wallet = searchParams.get("wallet");

  if (!token || !wallet) {
    return NextResponse.json(
      {
        error: "Missing required parameters",
        reason: "Both 'token' and 'wallet' query parameters are required",
        details: undefined,
      },
      { status: 400 }
    );
  }

  // Generate mock Alchemy-style token balance response
  const mockBalance = Math.floor(Math.random() * 1000000) / 100; // Random balance 0-10000
  const mockDecimals = token.toUpperCase() === "USDC" ? 6 : 18;

  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: 1,
      result: {
        address: wallet,
        tokenBalances: [
          {
            contractAddress: token,
            tokenBalance: BigInt(
              Math.floor(mockBalance * 10 ** mockDecimals)
            ).toString(),
          },
        ],
      },
      meta: {
        kyaVerified: true,
        verificationDetails: kyaResult.details,
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
};

// =============================================================================
// Export Protected Route
// =============================================================================

/**
 * x402-protected GET endpoint for token balance queries
 *
 * This endpoint requires:
 * 1. Valid KYA attestation headers (X-KYA-Identity, X-KYA-Capability, X-KYA-Delegation)
 * 2. x402 payment of $0.001 on Base Sepolia
 *
 * Payment is only settled after successful response (status < 400)
 */
export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:84532", // Base Sepolia
        payTo:
          PAYMENT_ADDRESS ||
          ("0x0000000000000000000000000000000000000000" as `0x${string}`),
      },
    ],
    description: "KYA-verified token balance API with x402 payment",
    mimeType: "application/json",
  },
  server
);
