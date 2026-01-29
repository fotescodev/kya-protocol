"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { SCHEMAS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const schemaColors: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
    glow: string;
    leftBorder: string;
    fieldBg: string;
    fieldText: string;
    dot: string;
  }
> = {
  electric: {
    text: "text-electric",
    bg: "bg-electric/10",
    border: "border-electric/30",
    glow: "glow-blue",
    leftBorder: "border-l-electric",
    fieldBg: "bg-electric/8",
    fieldText: "text-electric",
    dot: "bg-electric",
  },
  "cyan-accent": {
    text: "text-cyan-accent",
    bg: "bg-cyan-accent/10",
    border: "border-cyan-accent/30",
    glow: "glow-cyan",
    leftBorder: "border-l-cyan-accent",
    fieldBg: "bg-cyan-accent/8",
    fieldText: "text-cyan-accent",
    dot: "bg-cyan-accent",
  },
  "green-accent": {
    text: "text-green-accent",
    bg: "bg-green-accent/10",
    border: "border-green-accent/30",
    glow: "glow-green",
    leftBorder: "border-l-green-accent",
    fieldBg: "bg-green-accent/8",
    fieldText: "text-green-accent",
    dot: "bg-green-accent",
  },
  "purple-accent": {
    text: "text-purple-accent",
    bg: "bg-purple-accent/10",
    border: "border-purple-accent/30",
    glow: "glow-purple",
    leftBorder: "border-l-purple-accent",
    fieldBg: "bg-purple-accent/8",
    fieldText: "text-purple-accent",
    dot: "bg-purple-accent",
  },
};

const phaseLabels = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"];

export function SchemaArchitecture() {
  const [activeSchema, setActiveSchema] = useState<number | null>(null);

  return (
    <SectionWrapper id="schemas">
      <FadeInOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Four Composable Schemas
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Built on the{" "}
            <a
              href="https://attest.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              Ethereum Attestation Service
            </a>
            . Each schema answers a fundamental question about your agent.
          </p>
        </div>
      </FadeInOnScroll>

      {/* Phase flow visualization */}
      <FadeInOnScroll delay={100}>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-12 overflow-x-auto pb-4">
          {SCHEMAS.map((schema, i) => {
            const colors = schemaColors[schema.color];
            return (
              <div
                key={schema.name}
                className="flex items-center gap-2 sm:gap-3"
              >
                <button
                  onClick={() =>
                    setActiveSchema(activeSchema === i ? null : i)
                  }
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap",
                    activeSchema === i
                      ? `${colors.bg} ${colors.border} ${colors.glow}`
                      : "border-border hover:border-white/20"
                  )}
                  aria-pressed={activeSchema === i}
                >
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                      colors.bg,
                      colors.text
                    )}
                  >
                    {phaseLabels[i]}
                  </span>
                  <span
                    className={cn("font-semibold text-sm", colors.text)}
                  >
                    {schema.name}
                  </span>
                  <span className="text-text-muted text-xs hidden sm:inline">
                    {schema.question}
                  </span>
                </button>
                {i < SCHEMAS.length - 1 && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-text-muted flex-shrink-0"
                    aria-hidden="true"
                  >
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </FadeInOnScroll>

      {/* Schema detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCHEMAS.map((schema, i) => {
          const colors = schemaColors[schema.color];
          const isActive = activeSchema === i;

          return (
            <FadeInOnScroll key={schema.name} delay={i * 100}>
              <button
                onClick={() =>
                  setActiveSchema(activeSchema === i ? null : i)
                }
                className={cn(
                  "w-full text-left glass rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border-l-4",
                  colors.leftBorder,
                  isActive
                    ? `${colors.border} bg-white/[0.06] ${colors.glow}`
                    : "hover:border-white/20 hover:bg-white/[0.04]"
                )}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        colors.bg
                      )}
                    >
                      <span
                        className={cn("text-lg font-bold", colors.text)}
                      >
                        {schema.name[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {schema.name}
                        </h3>
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                            colors.bg,
                            colors.text
                          )}
                        >
                          {phaseLabels[i]}
                        </span>
                      </div>
                      <p className={cn("text-sm", colors.text)}>
                        {schema.question}
                      </p>
                    </div>
                  </div>

                  <p className="text-text-secondary text-sm mb-4">
                    {schema.description}
                  </p>

                  {/* Fields - always visible as colored pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {schema.fields.map((field) => (
                      <span
                        key={field}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-mono",
                          isActive
                            ? `${colors.fieldBg} ${colors.fieldText}`
                            : "bg-white/5 text-text-secondary"
                        )}
                      >
                        {field}
                      </span>
                    ))}
                  </div>

                  {/* Expanded: Use Cases */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isActive
                        ? "max-h-60 opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="pt-4 border-t border-border">
                      <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                        Use Cases
                      </p>
                      <ul className="space-y-1.5">
                        {schema.useCases.map((uc) => (
                          <li
                            key={uc}
                            className="flex items-start gap-2 text-text-secondary text-sm"
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                                colors.dot
                              )}
                            />
                            {uc}
                          </li>
                        ))}
                      </ul>
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
                        isActive && "rotate-180"
                      )}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {isActive ? "Less" : "Use cases"}
                  </div>
                </div>
              </button>
            </FadeInOnScroll>
          );
        })}
      </div>

      {/* Footnote */}
      <FadeInOnScroll delay={400}>
        <div className="mt-12 text-center">
          <div className="inline-block glass rounded-xl px-6 py-3">
            <p className="text-sm font-mono text-text-secondary">
              Every chain terminates at a human.{" "}
              <span className="text-electric font-semibold">Always.</span>
            </p>
          </div>
        </div>
      </FadeInOnScroll>
    </SectionWrapper>
  );
}
