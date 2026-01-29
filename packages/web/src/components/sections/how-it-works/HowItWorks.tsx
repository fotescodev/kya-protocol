"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { highlightCode } from "@/lib/highlight";
import { cn } from "@/lib/cn";

const steps = [
  {
    number: "01",
    title: "Register Identity",
    description:
      "Create an on-chain attestation linking your agent to its human owner. One identity per agent, cryptographically verifiable.",
    detail:
      "The Identity schema stores agentDID, agentAddress, ownerAddress, and metadata — enforced by the KYAIdentityResolver to guarantee uniqueness.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    color: "electric",
    colorText: "text-electric",
    colorBg: "bg-electric/10",
    colorBorder: "border-electric/50",
    glow: "glow-blue",
    snippet: `const uid = await kya.createIdentity({
  agentAddress: "0xAgent...",
  ownerAddress: "0xHuman...",
  displayName: "TradingBot Alpha",
});`,
  },
  {
    number: "02",
    title: "Grant Capabilities",
    description:
      "Define what the agent can do with fine-grained permission bitmasks, target contracts, and expiration times.",
    detail:
      "Permissions use a bitmask system: TRANSACT (1), SIGN (2), DEPLOY (4), ADMIN (8), READ_PRIVATE (16), DELEGATE (32), CROSS_CHAIN (64).",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
    color: "cyan-accent",
    colorText: "text-cyan-accent",
    colorBg: "bg-cyan-accent/10",
    colorBorder: "border-cyan-accent/50",
    glow: "glow-cyan",
    snippet: `const cap = await kya.createCapability({
  parentIdentityUID: uid,
  permissions: TRANSACT | SIGN,
  expiresAt: now + 86400 * 30,
});`,
  },
  {
    number: "03",
    title: "Verify Trust Chain",
    description:
      "Anyone can verify the complete chain from agent back to human. No centralized authority required.",
    detail:
      "The SDK's verify() method checks attestation validity, revocation status, expiration, and resolves the full identity chain in a single call.",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    color: "purple-accent",
    colorText: "text-purple-accent",
    colorBg: "bg-purple-accent/10",
    colorBorder: "border-purple-accent/50",
    glow: "glow-purple",
    snippet: `const result = await kya.verify(uid);
// result.valid === true
// result.chain: Human → Agent`,
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <SectionWrapper id="how-it-works">
      <FadeInOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Three steps to give your agent a verifiable on-chain identity
          </p>
        </div>
      </FadeInOnScroll>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        {/* Connection lines (desktop only) */}
        <div
          className="hidden lg:block absolute top-1/2 left-0 right-0 h-px"
          aria-hidden="true"
        >
          <div className="mx-[16%] h-px bg-gradient-to-r from-electric via-cyan-accent to-purple-accent opacity-30" />
        </div>

        {steps.map((step, i) => (
          <FadeInOnScroll key={step.number} delay={i * 150}>
            <button
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              className={cn(
                "relative w-full text-left glass rounded-2xl p-8 transition-all duration-300 cursor-pointer group border-l-4",
                activeStep === i
                  ? `${step.colorBorder} bg-white/[0.06] scale-[1.02] ${step.glow}`
                  : "border-l-transparent hover:border-white/20 hover:bg-white/[0.04]"
              )}
              aria-expanded={activeStep === i}
            >
              {/* Step number + icon row */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "text-sm font-mono transition-colors",
                    activeStep === i ? step.colorText : "text-text-muted"
                  )}
                >
                  {step.number}
                </div>
                <div className={cn("transition-colors", step.colorText)}>
                  {step.icon}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Inline code snippet - always visible */}
              <div
                className={cn(
                  "rounded-lg p-3 mb-3 font-mono text-xs overflow-x-auto border",
                  activeStep === i
                    ? `${step.colorBg} ${step.colorBorder}`
                    : "bg-white/[0.03] border-border"
                )}
              >
                <pre className="leading-relaxed">
                  {step.snippet.split("\n").map((line, li) => (
                    <code
                      key={li}
                      className="block"
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(line),
                      }}
                    />
                  ))}
                </pre>
              </div>

              {/* Expanded detail */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  activeStep === i
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                )}
              >
                <div className="pt-4 border-t border-border">
                  <p className="text-text-muted text-xs font-mono leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>

              {/* Expand indicator */}
              <div className="flex items-center gap-2 mt-2 text-text-muted text-xs">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "transition-transform duration-200",
                    activeStep === i && "rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {activeStep === i ? "Less" : "Details"}
              </div>
            </button>
          </FadeInOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
}
