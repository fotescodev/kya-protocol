"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const nodes = [
  {
    label: "Human",
    sublabel: "Accountability anchor",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    color: "text-electric",
    bg: "bg-electric/10",
    glow: "shadow-electric/20",
  },
  {
    label: "Organization",
    sublabel: "Deploys & controls",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <line x1="8" y1="6" x2="10" y2="6" />
        <line x1="14" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="10" y2="10" />
        <line x1="14" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
      </svg>
    ),
    color: "text-cyan-accent",
    bg: "bg-cyan-accent/10",
    glow: "shadow-cyan-accent/20",
  },
  {
    label: "Agent",
    sublabel: "Autonomous actor",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
    color: "text-purple-accent",
    bg: "bg-purple-accent/10",
    glow: "shadow-purple-accent/20",
  },
  {
    label: "Sub-Agent",
    sublabel: "Delegated scope",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    color: "text-green-accent",
    bg: "bg-green-accent/10",
    glow: "shadow-green-accent/20",
  },
];

const connections = ["owns", "deploys", "delegates to"];

export function TrustChain() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <SectionWrapper id="trust-chain">
      <FadeInOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Every Chain Ends at a Human
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            KYA creates an unbreakable accountability trail from any agent
            back to a responsible human owner.
          </p>
        </div>
      </FadeInOnScroll>

      {/* Chain visualization */}
      <div
        ref={ref}
        className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0"
      >
        {nodes.map((node, i) => (
          <div key={node.label} className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0">
            {/* Node */}
            <div
              className={cn(
                "flex flex-col items-center gap-3 transition-all duration-700",
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center glass transition-shadow duration-500",
                  node.bg,
                  node.color,
                  isInView && `shadow-lg ${node.glow}`
                )}
              >
                {node.icon}
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{node.label}</p>
                <p className="text-text-muted text-xs">{node.sublabel}</p>
              </div>
            </div>

            {/* Connection arrow */}
            {i < nodes.length - 1 && (
              <div
                className={cn(
                  "flex items-center gap-2 px-4 transition-all duration-700",
                  isInView ? "opacity-100" : "opacity-0"
                )}
                style={{ transitionDelay: `${i * 200 + 100}ms` }}
              >
                {/* Vertical on mobile, horizontal on desktop */}
                <div className="hidden lg:flex items-center gap-2">
                  <div className="w-12 h-px bg-gradient-to-r from-white/20 to-white/5" />
                  <span className="text-text-muted text-xs whitespace-nowrap">
                    {connections[i]}
                  </span>
                  <div className="w-12 h-px bg-gradient-to-r from-white/5 to-white/20" />
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-text-muted"
                  >
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </div>
                <div className="flex lg:hidden flex-col items-center gap-1">
                  <div className="h-8 w-px bg-gradient-to-b from-white/20 to-white/5" />
                  <span className="text-text-muted text-xs">{connections[i]}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-text-muted rotate-90"
                  >
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
