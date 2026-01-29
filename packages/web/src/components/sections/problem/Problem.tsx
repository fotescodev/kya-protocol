import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlowCard } from "@/components/ui/GlowCard";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { AnimatedCounter } from "./AnimatedCounter";
import { STATS } from "@/lib/constants";

const problems = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: "No Verifiable Identity",
    description: "Agents transact billions but can't prove who they are or who authorized them.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "No Accountability Chain",
    description: "When an agent misbehaves, there's no trail back to a responsible human.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: "No Portable Credentials",
    description: "Each platform builds its own silo. Agent credentials can't move across systems.",
  },
];

export function Problem() {
  return (
    <SectionWrapper id="problem">
      <FadeInOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Agents Can&apos;t Show ID
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            AI agents are transacting at unprecedented scale — yet they remain
            &quot;unbanked ghosts&quot; with no way to prove who they are.
          </p>
        </div>
      </FadeInOnScroll>

      {/* Stats */}
      <FadeInOnScroll delay={150}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {STATS.map((stat) => (
            <GlowCard key={stat.label} glow="blue" className="text-center">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                />
              </div>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </GlowCard>
          ))}
        </div>
      </FadeInOnScroll>

      {/* Problem Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {problems.map((problem, i) => (
          <FadeInOnScroll key={problem.title} delay={i * 100}>
            <GlowCard glow="none" className="h-full">
              <div className="text-electric mb-4">{problem.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {problem.description}
              </p>
            </GlowCard>
          </FadeInOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
}
