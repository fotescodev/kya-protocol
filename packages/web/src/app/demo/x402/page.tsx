import type { Metadata } from "next";
import { X402Demo } from "./X402Demo";

export const metadata: Metadata = {
  title: "x402 + KYA Demo | KYA Protocol",
  description:
    "Interactive demo showing how KYA Protocol integrates with x402 for agent-verified API payments",
  openGraph: {
    title: "x402 + KYA Integration Demo",
    description:
      "Watch how AI agent identity verification works with micropayments",
  },
};

export default function X402DemoPage() {
  return <X402Demo />;
}
