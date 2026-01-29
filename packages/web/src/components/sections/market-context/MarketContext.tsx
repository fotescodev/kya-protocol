import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { GlowCard } from "@/components/ui/GlowCard";
import { AnimatedCounter } from "@/components/sections/problem/AnimatedCounter";

const stats = [
  {
    value: 24,
    prefix: "$",
    suffix: "M+",
    label: "Transacted through x402 protocol",
    sublabel: "Coinbase's agent payment layer",
    glow: "blue" as const,
  },
  {
    value: 3.5,
    prefix: "",
    suffix: "M+",
    label: "Agent transactions on Olas",
    sublabel: "75% of Safe txns on Gnosis",
    glow: "cyan" as const,
  },
  {
    value: 33,
    prefix: "$",
    suffix: "M",
    label: "Raised by Kite.ai",
    sublabel: "Agent infrastructure funding",
    glow: "purple" as const,
  },
];

export function MarketContext() {
  return (
    <SectionWrapper id="market">
      <FadeInOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            The Market Is Moving
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Agents are already transacting at scale. The identity layer is
            missing.
          </p>
        </div>
      </FadeInOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <FadeInOnScroll key={stat.label} delay={i * 100}>
            <GlowCard glow={stat.glow} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-3">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                />
              </div>
              <p className="text-text-primary font-medium mb-1">{stat.label}</p>
              <p className="text-text-muted text-sm">{stat.sublabel}</p>
            </GlowCard>
          </FadeInOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
}
