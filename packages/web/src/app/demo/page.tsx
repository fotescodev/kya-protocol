import type { Metadata } from "next";
import { Demo } from "./Demo";

export const metadata: Metadata = {
  title: "Interactive Demo | KYA Protocol",
  description:
    "Explore KYA schemas, simulate attestations, and watch the verification flow in action. No code required.",
  openGraph: {
    title: "Interactive Demo | KYA Protocol",
    description:
      "Explore KYA schemas, simulate attestations, and watch the verification flow in action.",
    type: "website",
  },
};

export default function DemoPage() {
  return <Demo />;
}
