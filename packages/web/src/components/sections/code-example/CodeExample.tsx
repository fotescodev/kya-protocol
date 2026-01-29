"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { FadeInOnScroll } from "@/components/ui/FadeInOnScroll";
import { CopyButton } from "@/components/ui/CopyButton";
import { CODE_SNIPPETS, CLI_OUTPUT_LINES } from "./code-snippets";
import { highlightCode } from "@/lib/highlight";
import { cn } from "@/lib/cn";

const CLI_LINE_CLASSES = {
  prompt: "terminal-prompt font-semibold",
  success: "terminal-success",
  info: "terminal-info",
  plain: "terminal-output",
  dim: "terminal-dim",
} as const;

export function CodeExample() {
  const [activeTab, setActiveTab] = useState(0);
  const snippet = CODE_SNIPPETS[activeTab];
  const isTerminal = snippet.language === "terminal";

  const codeLines = isTerminal ? [] : snippet.code.split("\n");

  return (
    <SectionWrapper id="code-example">
      <FadeInOnScroll>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Build with the SDK
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Clean TypeScript API. Full type safety. On-chain and off-chain
            support.
          </p>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={150}>
        <div className="max-w-3xl mx-auto">
          {/* Code window */}
          <div className="glass-bright rounded-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-text-muted text-xs font-mono">
                {snippet.filename}
              </span>
              {!isTerminal && <CopyButton text={snippet.code} />}
              {isTerminal && <div className="w-8" />}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border" role="tablist">
              {CODE_SNIPPETS.map((tab, i) => (
                <button
                  key={tab.label}
                  role="tab"
                  aria-selected={activeTab === i}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                    activeTab === i
                      ? tab.language === "terminal"
                        ? "text-green-accent"
                        : "text-electric"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  {tab.language === "terminal" && (
                    <span className="mr-1.5 text-xs">{'>'}_</span>
                  )}
                  {tab.label}
                  {activeTab === i && (
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 h-px",
                        tab.language === "terminal"
                          ? "bg-green-accent"
                          : "bg-electric"
                      )}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Code content */}
            <div className="p-4 overflow-x-auto" role="tabpanel">
              {isTerminal ? (
                <div className="text-sm leading-relaxed font-mono space-y-0.5">
                  {CLI_OUTPUT_LINES.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        CLI_LINE_CLASSES[line.type],
                        !line.text && "h-4"
                      )}
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
              ) : (
                <table className="text-sm leading-relaxed w-full">
                  <tbody>
                    {codeLines.map((line, i) => (
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
              )}
            </div>
          </div>

          {/* Install command */}
          <div className="mt-6 glass rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-green-accent text-sm select-none font-mono">
                $
              </span>
              <code className="text-sm font-mono text-text-primary whitespace-nowrap">
                npm install @kya/sdk ethers
              </code>
            </div>
            <CopyButton text="npm install @kya/sdk ethers" />
          </div>
        </div>
      </FadeInOnScroll>
    </SectionWrapper>
  );
}
