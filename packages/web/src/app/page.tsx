import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/hero/Hero";
import { HowItWorks } from "@/components/sections/how-it-works/HowItWorks";
import { SchemaArchitecture } from "@/components/sections/schema-architecture/SchemaArchitecture";
import { DemoPromo } from "@/components/sections/demo-promo/DemoPromo";
import { CodeExample } from "@/components/sections/code-example/CodeExample";
import { Builder } from "@/components/sections/builder/Builder";
import { CTAFooter } from "@/components/sections/cta-footer/CTAFooter";

function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "KYA Protocol",
    description:
      "An open-source on-chain identity standard for autonomous AI agents, built on the Ethereum Attestation Service and Base.",
    url: "https://kyaprotocol.com",
    codeRepository: "https://github.com/aspect-build/kya-protocol",
    programmingLanguage: ["Solidity", "TypeScript"],
    runtimePlatform: "Ethereum / Base",
    license: "https://opensource.org/licenses/MIT",
    author: {
      "@type": "Person",
      name: "Daniel Fotescu",
      url: "https://edgeoftrust.com",
      sameAs: [
        "https://github.com/dfotesco",
        "https://linkedin.com/in/dfotesco",
        "https://x.com/dfotesco",
      ],
    },
    keywords: [
      "AI agent identity",
      "on-chain identity",
      "EAS",
      "Ethereum Attestation Service",
      "Base blockchain",
      "agent KYC",
      "Web3 AI",
      "autonomous agents",
      "verifiable credentials",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <Header />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <SchemaArchitecture />
        <DemoPromo />
        <CodeExample />
        <Builder />
        <CTAFooter />
      </main>
    </>
  );
}
