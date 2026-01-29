"use client";

import { useState } from "react";
import { USE_CASES } from "../data";
import { CopyButton } from "@/components/ui/CopyButton";
import { highlightCode } from "@/lib/highlight";
import { cn } from "@/lib/cn";

type UseCase = (typeof USE_CASES)[number];

const icons: Record<string, React.ReactNode> = {
  "shopping-cart": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  briefcase: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  "trending-up": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

const schemaColors: Record<string, string> = {
  Identity: "text-electric bg-electric/10",
  Capability: "text-cyan-accent bg-cyan-accent/10",
  Provenance: "text-green-accent bg-green-accent/10",
  Delegation: "text-purple-accent bg-purple-accent/10",
};

export function UseCasesTab() {
  const [selectedCase, setSelectedCase] = useState<UseCase>(USE_CASES[0]);

  return (
    <div className="space-y-8">
      {/* Use case selector */}
      <div className="grid sm:grid-cols-3 gap-4">
        {USE_CASES.map((useCase) => {
          const isSelected = selectedCase.id === useCase.id;

          return (
            <button
              key={useCase.id}
              onClick={() => setSelectedCase(useCase)}
              className={cn(
                "glass rounded-xl p-5 text-left transition-all duration-200 cursor-pointer border",
                isSelected
                  ? "border-electric/50 bg-electric/5"
                  : "border-transparent hover:border-border-bright"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isSelected ? "bg-electric/20 text-electric" : "bg-white/5 text-text-muted"
                  )}
                >
                  {icons[useCase.icon]}
                </div>
                <div>
                  <span className="text-xs text-text-muted uppercase tracking-wider">
                    {useCase.industry}
                  </span>
                  <h3 className="font-semibold text-text-primary">{useCase.title}</h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected use case details */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Scenario + Attestations */}
        <div className="space-y-6">
          {/* Scenario */}
          <div className="glass-bright rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-3">{selectedCase.title}</h3>
            <p className="text-text-secondary text-sm mb-4">{selectedCase.description}</p>

            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium text-text-muted mb-2">Example Scenario</h4>
              <p className="text-sm text-text-secondary whitespace-pre-line">
                {selectedCase.scenario}
              </p>
            </div>
          </div>

          {/* Required Attestations */}
          <div className="glass-bright rounded-2xl p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-electric"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Required Attestations
            </h4>

            <div className="space-y-3">
              {selectedCase.attestations.map((att, i) => (
                <div key={i} className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded",
                        schemaColors[att.schema]
                      )}
                    >
                      {att.schema}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-2">{att.purpose}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(att.data).map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-text-muted"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Implementation code */}
        <div className="glass-bright rounded-2xl overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-text-muted text-xs font-mono">
              {selectedCase.id}-verification.ts
            </span>
            <CopyButton text={selectedCase.code} />
          </div>

          {/* Code content */}
          <div className="p-4 overflow-x-auto">
            <table className="text-sm leading-relaxed w-full">
              <tbody>
                {selectedCase.code.split("\n").map((line, i) => (
                  <tr key={i} className="leading-relaxed">
                    <td className="terminal-line-number pr-4 select-none align-top font-mono text-right w-[2ch]">
                      {i + 1}
                    </td>
                    <td>
                      <code
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line),
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Implementation flow */}
          <div className="border-t border-border p-4">
            <h4 className="text-sm font-medium text-text-muted mb-3">Implementation Flow</h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-electric/10 text-electric">1. Resolve Agent</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <polyline points="9 6 15 12 9 18" />
              </svg>
              <span className="px-2 py-1 rounded bg-cyan-accent/10 text-cyan-accent">2. Check Caps</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <polyline points="9 6 15 12 9 18" />
              </svg>
              <span className="px-2 py-1 rounded bg-green-accent/10 text-green-accent">3. Verify</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
                <polyline points="9 6 15 12 9 18" />
              </svg>
              <span className="px-2 py-1 rounded bg-purple-accent/10 text-purple-accent">4. Execute</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
