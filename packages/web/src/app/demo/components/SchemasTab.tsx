"use client";

import { useState } from "react";
import { DEMO_SCHEMAS } from "../data";
import { CopyButton } from "@/components/ui/CopyButton";
import { highlightCode } from "@/lib/highlight";
import { cn } from "@/lib/cn";

type Schema = (typeof DEMO_SCHEMAS)[number];

const colorStyles: Record<
  string,
  { border: string; text: string; bg: string; glow: string }
> = {
  electric: {
    border: "border-electric/30 hover:border-electric/50",
    text: "text-electric",
    bg: "bg-electric/10",
    glow: "shadow-electric/20",
  },
  "cyan-accent": {
    border: "border-cyan-accent/30 hover:border-cyan-accent/50",
    text: "text-cyan-accent",
    bg: "bg-cyan-accent/10",
    glow: "shadow-cyan-accent/20",
  },
  "green-accent": {
    border: "border-green-accent/30 hover:border-green-accent/50",
    text: "text-green-accent",
    bg: "bg-green-accent/10",
    glow: "shadow-green-accent/20",
  },
  "purple-accent": {
    border: "border-purple-accent/30 hover:border-purple-accent/50",
    text: "text-purple-accent",
    bg: "bg-purple-accent/10",
    glow: "shadow-purple-accent/20",
  },
};

export function SchemasTab() {
  const [selectedSchema, setSelectedSchema] = useState<Schema>(DEMO_SCHEMAS[0]);
  const styles = colorStyles[selectedSchema.color];

  return (
    <div className="space-y-8">
      {/* Schema selector cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_SCHEMAS.map((schema) => {
          const schemaStyles = colorStyles[schema.color];
          const isSelected = selectedSchema.id === schema.id;

          return (
            <button
              key={schema.id}
              onClick={() => setSelectedSchema(schema)}
              className={cn(
                "glass rounded-xl p-4 text-left transition-all duration-200 cursor-pointer",
                schemaStyles.border,
                isSelected && "ring-2 ring-offset-2 ring-offset-navy",
                isSelected && schemaStyles.text.replace("text-", "ring-")
              )}
            >
              <div className={cn("text-sm font-semibold mb-1", schemaStyles.text)}>
                {schema.name}
              </div>
              <p className="text-text-muted text-xs">{schema.question}</p>
            </button>
          );
        })}
      </div>

      {/* Schema details */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Fields panel */}
        <div className="glass-bright rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", styles.bg)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={styles.text}
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <h3 className={cn("font-semibold", styles.text)}>{selectedSchema.name} Schema</h3>
              <p className="text-text-muted text-sm">{selectedSchema.fields.length} fields</p>
            </div>
          </div>

          <p className="text-text-secondary text-sm mb-6">{selectedSchema.description}</p>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {selectedSchema.fields.map((field) => (
              <div
                key={field.name}
                className="glass rounded-lg p-3 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="text-sm font-mono text-text-primary">{field.name}</code>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-text-muted font-mono">
                    {field.type}
                  </span>
                </div>
                <p className="text-text-muted text-xs mb-2">{field.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-xs">Example:</span>
                  <code className="text-xs font-mono text-text-secondary truncate">
                    {field.example}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code preview panel */}
        <div className="glass-bright rounded-2xl overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-text-muted text-xs font-mono">
              {selectedSchema.id}-example.ts
            </span>
            <CopyButton text={selectedSchema.codeExample} />
          </div>

          {/* Code content */}
          <div className="p-4 overflow-x-auto max-h-[450px] overflow-y-auto">
            <table className="text-sm leading-relaxed w-full">
              <tbody>
                {selectedSchema.codeExample.split("\n").map((line, i) => (
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
        </div>
      </div>
    </div>
  );
}
