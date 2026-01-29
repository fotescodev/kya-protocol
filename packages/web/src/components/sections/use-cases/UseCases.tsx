import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { cn } from "@/lib/cn";

const useCases = [
  {
    title: "DeFi Trading Agent",
    scenario:
      "A market-making bot executes $2M in daily swaps. Its counterparty verifies the agent's identity, confirms TRANSACT permission, and checks that a licensed fund owns it — all on-chain in one call.",
    schemas: ["Identity", "Capability"],
    schemaColors: ["text-electric", "text-cyan-accent"],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "AI Customer Service",
    scenario:
      "A support agent handles billing disputes for an e-commerce platform. Customers can verify the agent is authorized by the company and scoped to READ_PRIVATE data — no ADMIN or DEPLOY access.",
    schemas: ["Identity", "Capability", "Delegation"],
    schemaColors: ["text-electric", "text-cyan-accent", "text-purple-accent"],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Multi-Agent Supply Chain",
    scenario:
      "A logistics coordinator delegates regional authority to 12 sub-agents. Each has scoped capabilities with depth limits. Any warehouse can verify the delegation chain back to the human operator.",
    schemas: ["Identity", "Delegation", "Capability"],
    schemaColors: ["text-electric", "text-purple-accent", "text-cyan-accent"],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Audited Code Verification",
    scenario:
      "Before interacting with a smart contract deployed by an agent, a protocol checks the agent's provenance: source code hash, model version, build hash, and whether the code was audited.",
    schemas: ["Identity", "Provenance"],
    schemaColors: ["text-electric", "text-green-accent"],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "Cross-Chain Bridge Agent",
    scenario:
      "An agent bridges assets between Base and Arbitrum. Both chains can verify the agent's CROSS_CHAIN permission, check its delegation depth, and confirm provenance — using the same EAS-based attestations.",
    schemas: ["Identity", "Capability", "Provenance", "Delegation"],
    schemaColors: [
      "text-electric",
      "text-cyan-accent",
      "text-green-accent",
      "text-purple-accent",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export function UseCases() {
  return (
    <SectionWrapper id="use-cases">
      <FadeInOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Real-World Use Cases
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Every scenario where an agent acts on behalf of a human needs
            verifiable identity. Here&apos;s where KYA fits.
          </p>
        </div>
      </FadeInOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCases.map((uc, i) => (
          <FadeInOnScroll key={uc.title} delay={i * 100}>
            <div className="glass rounded-2xl p-6 h-full flex flex-col hover:bg-white/[0.04] transition-colors">
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary">
                  {uc.icon}
                </div>
                <h3 className="font-semibold text-lg">{uc.title}</h3>
              </div>

              {/* Scenario */}
              <p className="text-text-secondary text-sm leading-relaxed flex-1 mb-4">
                {uc.scenario}
              </p>

              {/* Schema badges */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
                {uc.schemas.map((schema, si) => (
                  <span
                    key={schema}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-mono font-medium",
                      uc.schemaColors[si],
                      "bg-white/5"
                    )}
                  >
                    {schema}
                  </span>
                ))}
              </div>
            </div>
          </FadeInOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
}
