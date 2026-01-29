"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const schemaCards = [
  {
    name: "Identity",
    description: "Who is this agent?",
    color: "electric",
    fields: ["agentDID", "ownerAddress", "displayName"],
  },
  {
    name: "Capability",
    description: "What can it do?",
    color: "cyan-accent",
    fields: ["permissions", "targetContract", "expiresAt"],
  },
  {
    name: "Provenance",
    description: "Where did it come from?",
    color: "green-accent",
    fields: ["sourceCodeHash", "modelHash", "auditReport"],
  },
  {
    name: "Delegation",
    description: "Who authorized it?",
    color: "purple-accent",
    fields: ["delegator", "delegatee", "scope"],
  },
];

const colorStyles: Record<string, { border: string; text: string; glow: string; bg: string }> = {
  electric: {
    border: "border-electric/30",
    text: "text-electric",
    glow: "group-hover:shadow-electric/20",
    bg: "bg-electric/5",
  },
  "cyan-accent": {
    border: "border-cyan-accent/30",
    text: "text-cyan-accent",
    glow: "group-hover:shadow-cyan-accent/20",
    bg: "bg-cyan-accent/5",
  },
  "green-accent": {
    border: "border-green-accent/30",
    text: "text-green-accent",
    glow: "group-hover:shadow-green-accent/20",
    bg: "bg-green-accent/5",
  },
  "purple-accent": {
    border: "border-purple-accent/30",
    text: "text-purple-accent",
    glow: "group-hover:shadow-purple-accent/20",
    bg: "bg-purple-accent/5",
  },
};

export function DemoPromo() {
  return (
    <SectionWrapper id="demo-promo" className="overflow-hidden">
      <FadeInOnScroll>
        <div className="text-center mb-12">
          <Badge variant="glow" className="mb-6">
            Interactive Experience
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            See KYA in Action
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Explore schemas, simulate attestations, and watch the verification
            flow — all without writing a single line of code.
          </p>
        </div>
      </FadeInOnScroll>

      {/* Schema preview cards */}
      <FadeInOnScroll delay={100}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {schemaCards.map((schema, i) => {
            const styles = colorStyles[schema.color];
            return (
              <div
                key={schema.name}
                className={cn(
                  "group glass rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]",
                  styles.border,
                  "hover:shadow-lg",
                  styles.glow
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={cn("text-sm font-semibold mb-1", styles.text)}>
                  {schema.name}
                </div>
                <p className="text-text-muted text-xs mb-3">{schema.description}</p>
                <div className="space-y-1">
                  {schema.fields.map((field) => (
                    <div
                      key={field}
                      className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded",
                        styles.bg,
                        "text-text-secondary"
                      )}
                    >
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </FadeInOnScroll>

      {/* Demo features */}
      <FadeInOnScroll delay={200}>
        <div className="glass-bright rounded-2xl p-8 max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center mx-auto mb-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-electric"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>
              <p className="text-sm font-medium">Schema Explorer</p>
              <p className="text-xs text-text-muted mt-1">Browse all 4 schemas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-accent/10 flex items-center justify-center mx-auto mb-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-cyan-accent"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <p className="text-sm font-medium">Attestation Builder</p>
              <p className="text-xs text-text-muted mt-1">Create test attestations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-accent/10 flex items-center justify-center mx-auto mb-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-purple-accent"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-sm font-medium">Live Verification</p>
              <p className="text-xs text-text-muted mt-1">Watch the 6-step flow</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/demo" variant="primary" size="lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Launch Interactive Demo
            </Button>
            <Button href="#code-example" variant="ghost" size="lg">
              Or view code examples
            </Button>
          </div>
        </div>
      </FadeInOnScroll>
    </SectionWrapper>
  );
}
