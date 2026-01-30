"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { WalletPanel } from "./components/WalletPanel";
import { AgentIdentityPanel } from "./components/AgentIdentityPanel";
import { ApiRequestPanel } from "./components/ApiRequestPanel";
import { VerificationFlow } from "./components/VerificationFlow";
import { DEMO_AGENT, VERIFICATION_STEPS } from "./data";
import { useX402Fetch } from "@/lib/x402-client";

export function X402Demo() {
  const { isConnected } = useAccount();
  const x402Fetch = useX402Fetch();

  const [currentStep, setCurrentStep] = useState(-1);
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStep, setErrorStep] = useState<number | undefined>();

  async function executeRequest(token: string, wallet: string) {
    setStatus("running");
    setCurrentStep(0);
    setError(null);
    setErrorStep(undefined);
    setResponse(null);

    // Animate through steps with delays
    for (let i = 0; i < VERIFICATION_STEPS.length - 1; i++) {
      await new Promise((r) => setTimeout(r, VERIFICATION_STEPS[i].duration));
      setCurrentStep(i + 1);

      // On step 4 (payment), make the actual request
      if (i === 3) {
        try {
          if (!x402Fetch) {
            throw new Error("Wallet not connected");
          }

          const headers = {
            "X-KYA-Identity": DEMO_AGENT.identity.uid,
            "X-KYA-Capability": DEMO_AGENT.capability.uid,
            "X-KYA-Delegation": DEMO_AGENT.delegation.uid,
          };

          const res = await x402Fetch(`/api/alchemy/token?token=${token}&wallet=${wallet}`, {
            method: "GET",
            headers,
          });

          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          setResponse(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error occurred");
          setErrorStep(4);
          setStatus("error");
          return;
        }
      }
    }

    setStatus("success");
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-electric/5 rounded-full blur-[128px] motion-safe:animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-accent/5 rounded-full blur-[128px] motion-safe:animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-accent/3 rounded-full blur-[160px]" />
      </div>

      {/* Main content */}
      <main className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page header with sophisticated typography */}
          <header className="text-center mb-16">
            {/* Protocol badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-bright mb-6 motion-safe:animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-green-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-accent" />
              </span>
              <span className="text-sm font-medium text-text-secondary">Live on Base Sepolia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance">
              <span className="block text-text-primary">Agent Identity</span>
              <span className="block gradient-text">Meets Micropayments</span>
            </h1>

            <p className="text-text-secondary text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed text-balance">
              Experience the future of AI agent commerce. KYA Protocol verifies agent identity while x402 enables instant, trustless payments—all in one seamless flow.
            </p>

            {/* Tech stack badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {[
                { label: "KYA Protocol", color: "electric" },
                { label: "x402", color: "cyan-accent" },
                { label: "EAS", color: "purple-accent" },
                { label: "Base", color: "green-accent" },
              ].map((tech) => (
                <span
                  key={tech.label}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full bg-${tech.color}/10 text-${tech.color} border border-${tech.color}/20`}
                >
                  {tech.label}
                </span>
              ))}
            </div>
          </header>

          {/* Interactive demo panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Wallet Panel */}
            <div className="glass-bright rounded-2xl p-6 motion-safe:animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <WalletPanel />
            </div>

            {/* Agent Identity Panel */}
            <div className="glass-bright rounded-2xl p-6 motion-safe:animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <AgentIdentityPanel />
            </div>

            {/* API Request Panel */}
            <div className="glass-bright rounded-2xl p-6 motion-safe:animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <ApiRequestPanel
                onExecute={executeRequest}
                isLoading={status === "running"}
                response={response}
                error={error}
              />
            </div>
          </div>

          {/* Verification Flow - Full width below */}
          <div className="motion-safe:animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <VerificationFlow
              currentStep={currentStep}
              status={status}
              errorStep={errorStep}
              errorMessage={error ?? undefined}
            />
          </div>

          {/* Connection hint when not connected */}
          {!isConnected && (
            <div className="text-center mt-12 motion-safe:animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="inline-flex flex-col items-center gap-3 p-6 rounded-2xl glass">
                <div className="w-12 h-12 rounded-full bg-electric/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-electric">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-text-secondary font-medium">Connect your wallet to start the demo</p>
                <p className="text-text-muted text-sm max-w-xs text-center">
                  You&apos;ll need some testnet ETH and USDC on Base Sepolia
                </p>
              </div>
            </div>
          )}

          {/* How it works section */}
          <section className="mt-20 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-center mb-12 text-balance">
              How <span className="gradient-text">KYA + x402</span> Work Together
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Agent Requests Data",
                  description: "Your AI agent needs token balance data from Alchemy's API. It sends a request with its KYA attestation headers.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  ),
                  color: "electric",
                },
                {
                  step: "02",
                  title: "Identity Verified On-Chain",
                  description: "The API verifies the agent's KYA attestations on EAS: identity, TRANSACT capability, and delegation chain back to a human owner.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  ),
                  color: "cyan-accent",
                },
                {
                  step: "03",
                  title: "Pay & Receive Data",
                  description: "Once verified, x402 processes a $0.001 USDC micropayment. The agent receives verified token data instantly.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                  color: "green-accent",
                },
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <div className="glass rounded-2xl p-6 h-full transition-transform duration-300 motion-safe:group-hover:scale-[1.02]">
                    <div className={`w-12 h-12 rounded-xl bg-${item.color}/20 flex items-center justify-center mb-4 text-${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className={`text-xs font-mono text-${item.color}`}>{item.step}</span>
                      <h3 className="font-semibold text-text-primary">{item.title}</h3>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Value proposition for Alchemy */}
          <section className="mt-20 text-center">
            <div className="inline-block p-8 rounded-3xl glass-bright max-w-3xl">
              <h3 className="text-xl font-bold mb-4">
                Why This Matters for <span className="text-electric">Alchemy</span>
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                As AI agents increasingly consume APIs autonomously, you need to know who&apos;s calling, what they&apos;re authorized to do, and who&apos;s accountable. KYA + x402 provides verified identity with frictionless payments—turning your APIs into trusted, monetized agent endpoints.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="px-4 py-2 rounded-full bg-electric/10 text-electric">Know Your Agents</span>
                <span className="px-4 py-2 rounded-full bg-cyan-accent/10 text-cyan-accent">Micropayment Revenue</span>
                <span className="px-4 py-2 rounded-full bg-purple-accent/10 text-purple-accent">Human Accountability</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
