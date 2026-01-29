import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { GlowCard } from "@/components/ui/GlowCard";
import { AnimatedCounter } from "@/components/sections/problem/AnimatedCounter";

export function Thesis() {
  return (
    <SectionWrapper id="thesis">
      <div className="max-w-3xl mx-auto">
        <FadeInOnScroll>
          <p className="text-electric font-mono text-sm uppercase tracking-widest mb-6">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
            We&apos;re building a world of autonomous agents
            <span className="text-text-muted"> without any way to know who they are</span>
          </h2>
        </FadeInOnScroll>

        <FadeInOnScroll delay={100}>
          <div className="space-y-6 text-text-secondary text-lg leading-relaxed mb-12">
            <p>
              When a human walks into a bank, they show an ID. When they sign a contract,
              there&apos;s a notary. When they send money, there&apos;s KYC. We&apos;ve spent
              decades building identity infrastructure for people.
            </p>
            <p>
              Now imagine an AI agent walks into the same bank. It wants to execute a trade,
              sign a message, deploy a contract. It&apos;s authorized by a company, built by
              a team, running code that was audited. But it has{" "}
              <strong className="text-text-primary">no way to prove any of this.</strong>
            </p>
            <p>
              This isn&apos;t hypothetical. Coinbase&apos;s x402 protocol has already processed{" "}
              <strong className="text-text-primary">$24 million</strong> in agent transactions.
              Olas agents have executed{" "}
              <strong className="text-text-primary">3.5 million transactions</strong> and
              account for 75% of Safe transactions on Gnosis. Kite.ai raised{" "}
              <strong className="text-text-primary">$33 million</strong> for agent infrastructure.
            </p>
            <p>
              The agents are already here. The identity layer is missing.
            </p>
          </div>
        </FadeInOnScroll>

        {/* Scale indicators */}
        <FadeInOnScroll delay={200}>
          <div className="grid grid-cols-3 gap-4 mb-16">
            <GlowCard glow="blue" className="text-center py-8">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">
                <AnimatedCounter value={24} prefix="$" suffix="M+" />
              </div>
              <p className="text-text-muted text-xs mt-2">x402 volume</p>
            </GlowCard>
            <GlowCard glow="cyan" className="text-center py-8">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">
                <AnimatedCounter value={3.5} suffix="M+" decimals={1} />
              </div>
              <p className="text-text-muted text-xs mt-2">Olas agent txns</p>
            </GlowCard>
            <GlowCard glow="purple" className="text-center py-8">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">
                <AnimatedCounter value={33} prefix="$" suffix="M" />
              </div>
              <p className="text-text-muted text-xs mt-2">Kite.ai raised</p>
            </GlowCard>
          </div>
        </FadeInOnScroll>

        {/* The insight */}
        <FadeInOnScroll delay={250}>
          <div className="border-l-2 border-electric pl-6 mb-12">
            <p className="text-electric font-mono text-sm uppercase tracking-widest mb-4">
              My Conviction
            </p>
            <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
              <p>
                The solution isn&apos;t a new blockchain. It isn&apos;t a token.
                It&apos;s an <strong className="text-text-primary">open standard</strong> that
                anyone can adopt — built on infrastructure that already exists and already works.
              </p>
              <p>
                The Ethereum Attestation Service has been audited by Spearbit with 100% test
                coverage. It&apos;s deployed on Base, Ethereum, Optimism, Arbitrum, and more.
                We don&apos;t need to reinvent the wheel. We need to use it for a new purpose.
              </p>
              <p>
                Every AI agent traces back to a human. Always. A developer wrote the code.
                A company deployed it. A person authorized its actions. KYA makes that chain{" "}
                <strong className="text-text-primary">
                  cryptographically verifiable and publicly auditable
                </strong>.
              </p>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Why open standards */}
        <FadeInOnScroll delay={300}>
          <div className="glass rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-4">
              Why open standards matter here
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Fragmentation is the real enemy",
                  body: "Every platform is building its own identity silo. Agents can't carry credentials across systems. An open standard prevents a future of walled gardens.",
                },
                {
                  title: "Composability creates network effects",
                  body: "Four schemas that work independently but compose into trust chains. Identity + Capability + Provenance + Delegation = a complete agent profile.",
                },
                {
                  title: "Existing infrastructure is enough",
                  body: "EAS is already deployed on 10+ chains. W3C DIDs provide the naming layer. We don't need new protocols — we need new schemas.",
                },
                {
                  title: "Regulation is coming regardless",
                  body: "EU AI Act, SEC guidance on autonomous systems — regulators will require accountability chains. Better to build them as open standards now.",
                },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-white/[0.03]">
                  <h4 className="font-medium text-sm text-text-primary mb-2">
                    {item.title}
                  </h4>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </SectionWrapper>
  );
}
