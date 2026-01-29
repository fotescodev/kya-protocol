"use client";

import { useState } from "react";
import { DemoHeader } from "./components/DemoHeader";
import { SchemasTab } from "./components/SchemasTab";
import { UseCasesTab } from "./components/UseCasesTab";
import { AttestationTab } from "./components/AttestationTab";
import { VerifyTab } from "./components/VerifyTab";
import { TrustProfileTab } from "./components/TrustProfileTab";
import { DEMO_TABS } from "./data";
import { cn } from "@/lib/cn";

const icons: Record<string, React.ReactNode> = {
  layers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  briefcase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  "plus-circle": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  network: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="5" r="3" />
      <circle cx="19" cy="17" r="3" />
      <circle cx="5" cy="17" r="3" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="12" x2="5" y2="14" />
      <line x1="12" y1="12" x2="19" y2="14" />
    </svg>
  ),
};

type TabId = (typeof DEMO_TABS)[number]["id"];

const tabComponents: Record<TabId, React.ComponentType> = {
  schemas: SchemasTab,
  "use-cases": UseCasesTab,
  attestation: AttestationTab,
  verify: VerifyTab,
  "trust-profile": TrustProfileTab,
};

export function Demo() {
  const [activeTab, setActiveTab] = useState<TabId>(DEMO_TABS[0].id);
  const ActiveTabComponent = tabComponents[activeTab];

  return (
    <div className="min-h-screen bg-navy">
      <DemoHeader />

      {/* Main content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Interactive <span className="gradient-text">Demo</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Explore the KYA Protocol without writing code. Browse schemas, simulate
              attestations, and watch verification in action.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="glass-bright rounded-2xl p-1.5 mb-8 max-w-fit mx-auto">
            <div
              className="flex flex-wrap justify-center gap-1"
              role="tablist"
              aria-label="Demo sections"
            >
              {DEMO_TABS.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer",
                      isActive
                        ? "bg-electric text-white shadow-lg shadow-electric/25"
                        : "text-text-muted hover:text-text-primary hover:bg-white/5"
                    )}
                  >
                    {icons[tab.icon]}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div
            id={`${activeTab}-panel`}
            role="tabpanel"
            aria-labelledby={activeTab}
            className="animate-fade-in"
          >
            <ActiveTabComponent />
          </div>

          {/* Footer hint */}
          <div className="text-center mt-16 pt-8 border-t border-border">
            <p className="text-text-muted text-sm mb-4">
              Ready to integrate KYA into your project?
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="/#code-example"
                className="inline-flex items-center gap-2 text-sm text-electric hover:underline"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                View SDK Examples
              </a>
              <span className="text-text-muted">|</span>
              <a
                href="https://github.com/aspect-build/kya-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
