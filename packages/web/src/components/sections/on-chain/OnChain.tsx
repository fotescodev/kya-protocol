import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

const contracts = [
  {
    name: "KYAIdentityResolver",
    description: "Enforces one identity per agent, validates owner address, manages attester whitelist",
    tests: 8,
    lines: 133,
  },
  {
    name: "KYACapabilityResolver",
    description: "Validates parent identity exists, isn't revoked, and isn't expired before granting capabilities",
    tests: 3,
    lines: 63,
  },
];

const network = {
  name: "Base Sepolia",
  chainId: 84532,
  eas: "0x4200000000000000000000000000000000000021",
  schemaRegistry: "0x4200000000000000000000000000000000000020",
  easExplorer: "https://base-sepolia.easscan.org",
};

export function OnChain() {
  return (
    <SectionWrapper id="on-chain">
      <FadeInOnScroll>
        <div className="text-center mb-12">
          <p className="text-electric font-mono text-sm uppercase tracking-widest mb-4">
            Not Vaporware
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Live on Base Sepolia
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Real contracts. Real tests. Real attestations. Everything is deployed,
            open source, and verifiable on-chain right now.
          </p>
        </div>
      </FadeInOnScroll>

      <div className="max-w-4xl mx-auto">
        {/* Contracts */}
        <FadeInOnScroll delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {contracts.map((contract) => (
              <GlowCard key={contract.name} glow="blue">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-accent animate-pulse-glow" />
                  <h3 className="font-mono text-sm font-semibold text-text-primary">
                    {contract.name}
                  </h3>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {contract.description}
                </p>
                <div className="flex gap-4 text-xs text-text-muted">
                  <span>{contract.lines} lines of Solidity</span>
                  <span>{contract.tests} tests passing</span>
                </div>
              </GlowCard>
            ))}
          </div>
        </FadeInOnScroll>

        {/* Network details */}
        <FadeInOnScroll delay={200}>
          <div className="glass rounded-2xl p-6 mb-8">
            <p className="text-text-muted text-xs font-mono uppercase tracking-widest mb-4">
              Network Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/[0.03]">
                <p className="text-text-muted text-xs mb-1">Network</p>
                <p className="font-mono text-sm">
                  {network.name}{" "}
                  <span className="text-text-muted">(Chain ID {network.chainId})</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03]">
                <p className="text-text-muted text-xs mb-1">EAS Contract</p>
                <p className="font-mono text-xs text-text-secondary break-all">
                  {network.eas}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03]">
                <p className="text-text-muted text-xs mb-1">Schema Registry</p>
                <p className="font-mono text-xs text-text-secondary break-all">
                  {network.schemaRegistry}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03]">
                <p className="text-text-muted text-xs mb-1">Test Coverage</p>
                <p className="font-mono text-sm">
                  <span className="text-green-accent">18 tests</span>{" "}
                  <span className="text-text-muted">(11 contract + 7 SDK)</span>
                </p>
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Verify links */}
        <FadeInOnScroll delay={250}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              href={network.easExplorer}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Explore on EAS
            </Button>
            <Button
              href={`${SITE.github}/tree/main/packages/contracts`}
              variant="ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Contract Source
            </Button>
            <Button
              href={`${SITE.github}/tree/main/docs`}
              variant="ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read Full Specification
            </Button>
          </div>
        </FadeInOnScroll>
      </div>
    </SectionWrapper>
  );
}
