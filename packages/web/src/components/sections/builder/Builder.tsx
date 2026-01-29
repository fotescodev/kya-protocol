import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { GlowCard } from "@/components/ui/GlowCard";
import { BUILDER, SITE } from "@/lib/constants";

const links = [
  {
    label: "Portfolio",
    href: BUILDER.portfolio,
    description: "edgeoftrust.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: BUILDER.github,
    description: "@dfotesco",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: BUILDER.linkedin,
    description: "Connect with me",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: BUILDER.twitter,
    description: "@dfotesco",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const projectScope = [
  {
    label: "Smart Contracts",
    detail: "2 Solidity resolvers with 11 tests",
    color: "text-electric",
  },
  {
    label: "TypeScript SDK",
    detail: "Full SDK with 7 tests, zero-gas off-chain support",
    color: "text-cyan-accent",
  },
  {
    label: "Specification",
    detail: "38KB technical spec + 31KB whitepaper",
    color: "text-purple-accent",
  },
  {
    label: "This Landing Page",
    detail: "Next.js 15, Tailwind v4, server components",
    color: "text-green-accent",
  },
];

export function Builder() {
  return (
    <SectionWrapper id="builder">
      <div className="max-w-4xl mx-auto">
        <FadeInOnScroll>
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left: Personal info */}
            <div className="lg:w-2/5">
              <p className="text-electric font-mono text-sm uppercase tracking-widest mb-4">
                About the Builder
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {BUILDER.name}
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                I built KYA because I believe the intersection of Web3 and AI is
                where the most consequential infrastructure of the next decade
                will be created — and identity is the foundation everything else
                depends on.
              </p>
              <p className="text-text-muted leading-relaxed mb-8">
                This is a side project born from genuine conviction that agents
                will need open identity standards before they can participate
                meaningfully in commerce, governance, and collaboration. I wrote
                every line of code, every word of the spec, and designed the
                protocol architecture from scratch.
              </p>

              {/* Links */}
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl glass hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                  >
                    <span className="text-text-muted group-hover:text-electric transition-colors">
                      {link.icon}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-text-primary">
                        {link.label}
                      </span>
                      <span className="text-text-muted text-xs ml-2">
                        {link.description}
                      </span>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto text-text-muted group-hover:text-electric transition-colors"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: What I built */}
            <div className="lg:w-3/5">
              <GlowCard glow="blue" className="mb-6">
                <p className="text-electric font-mono text-xs uppercase tracking-widest mb-4">
                  What I Built (Solo)
                </p>
                <div className="space-y-4">
                  {projectScope.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${item.color} bg-current`} />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-text-muted text-xs">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>

              <GlowCard glow="none">
                <p className="text-text-muted text-xs uppercase tracking-widest mb-3 font-mono">
                  Why This Matters to Me
                </p>
                <p className="text-text-secondary text-sm leading-relaxed">
                  I&apos;m looking for a role at the intersection of Web3 and AI —
                  where protocol design, smart contract engineering, and applied AI
                  converge. KYA represents how I think about problems: start with a
                  real need, study what exists, design composable primitives, then
                  build the whole stack. If you&apos;re working on agentic
                  infrastructure, identity, or trust systems —{" "}
                  <a
                    href={`mailto:${BUILDER.email}`}
                    className="text-electric hover:underline"
                  >
                    I&apos;d love to talk
                  </a>.
                </p>
              </GlowCard>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </SectionWrapper>
  );
}
