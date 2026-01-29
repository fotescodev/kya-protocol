import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";

const ecosystem = [
  {
    name: "Ethereum Attestation Service",
    short: "EAS",
    description: "The foundation layer for all KYA attestations",
    url: "https://attest.sh",
  },
  {
    name: "Base",
    short: "Base",
    description: "Coinbase L2 — fast, low-cost, Ethereum-secured",
    url: "https://base.org",
  },
  {
    name: "Ethereum",
    short: "ETH",
    description: "Settlement and security layer",
    url: "https://ethereum.org",
  },
  {
    name: "W3C DIDs",
    short: "DIDs",
    description: "Compatible with decentralized identifier standards",
    url: "https://www.w3.org/TR/did-core/",
  },
  {
    name: "A2A Protocol",
    short: "A2A",
    description: "Interoperable with Google's Agent-to-Agent protocol",
    url: "https://github.com/google/A2A",
  },
];

export function Ecosystem() {
  return (
    <SectionWrapper id="ecosystem">
      <FadeInOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Built on Standards
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            KYA complements existing protocols and standards. No lock-in.
            Portable across any platform that accepts EAS attestations.
          </p>
        </div>
      </FadeInOnScroll>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {ecosystem.map((item, i) => (
          <FadeInOnScroll key={item.short} delay={i * 80}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/20 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-electric font-bold text-lg transition-colors group-hover:bg-electric/10">
                {item.short[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{item.short}</p>
                <p className="text-text-muted text-xs mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </a>
          </FadeInOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
}
