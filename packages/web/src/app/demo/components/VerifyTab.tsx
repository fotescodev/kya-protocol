"use client";

import { useState, useEffect, useCallback } from "react";
import { VERIFICATION_STEPS } from "../data";
import { cn } from "@/lib/cn";

const icons: Record<string, React.ReactNode> = {
  inbox: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  search: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  "user-check": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  "shield-check": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  "file-check": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  ),
  "check-circle": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

type StepStatus = "pending" | "active" | "complete";

export function VerifyTab() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [agentAddress, setAgentAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");

  const runVerification = useCallback(() => {
    setIsRunning(true);
    setCurrentStep(0);
  }, []);

  const resetVerification = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(-1);
  }, []);

  useEffect(() => {
    if (!isRunning || currentStep < 0) return;

    if (currentStep >= VERIFICATION_STEPS.length) {
      // Verification complete
      return;
    }

    const step = VERIFICATION_STEPS[currentStep];
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  const getStepStatus = (stepIndex: number): StepStatus => {
    if (currentStep < 0) return "pending";
    if (stepIndex < currentStep) return "complete";
    if (stepIndex === currentStep) return "active";
    return "pending";
  };

  const isComplete = currentStep >= VERIFICATION_STEPS.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Control panel */}
      <div className="glass-bright rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Agent Address to Verify
            </label>
            <input
              type="text"
              value={agentAddress}
              onChange={(e) => setAgentAddress(e.target.value)}
              disabled={isRunning}
              className="w-full glass rounded-lg px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-electric/50 disabled:opacity-50"
              placeholder="0x..."
            />
          </div>

          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={runVerification}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-electric hover:bg-electric-dark text-white font-medium transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Verification
              </button>
            ) : (
              <button
                onClick={resetVerification}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl glass-bright text-text-primary font-medium transition-colors cursor-pointer hover:bg-white/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification steps */}
      <div className="glass-bright rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-electric"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Verification Flow
        </h3>

        <div className="space-y-4">
          {VERIFICATION_STEPS.map((step, i) => {
            const status = getStepStatus(i);

            return (
              <div
                key={step.step}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
                  status === "active" && "glass bg-electric/5",
                  status === "complete" && "bg-green-accent/5",
                  status === "pending" && "opacity-50"
                )}
              >
                {/* Step indicator */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    status === "active" && "bg-electric/20 text-electric animate-pulse",
                    status === "complete" && "bg-green-accent/20 text-green-accent",
                    status === "pending" && "bg-white/5 text-text-muted"
                  )}
                >
                  {status === "complete" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    icons[step.icon]
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-text-muted">Step {step.step}</span>
                    {status === "active" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-electric/20 text-electric animate-pulse">
                        Processing...
                      </span>
                    )}
                    {status === "complete" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-accent/20 text-green-accent">
                        Complete
                      </span>
                    )}
                  </div>
                  <h4
                    className={cn(
                      "font-medium transition-colors",
                      status === "active" && "text-electric",
                      status === "complete" && "text-green-accent",
                      status === "pending" && "text-text-primary"
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className="text-text-muted text-sm mt-1">{step.description}</p>
                </div>

                {/* Duration indicator */}
                {status === "active" && (
                  <div className="text-xs font-mono text-text-muted">~{step.duration}ms</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Result */}
        {isComplete && (
          <div className="mt-6 p-4 rounded-xl bg-green-accent/10 border border-green-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-accent/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-accent">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-accent">Verification Successful</h4>
                <p className="text-text-secondary text-sm">
                  Agent <code className="font-mono text-xs">{agentAddress.slice(0, 10)}...</code> is verified and authorized
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Identity</p>
                <p className="text-sm font-mono text-electric">Valid</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Capabilities</p>
                <p className="text-sm font-mono text-cyan-accent">3 grants</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Provenance</p>
                <p className="text-sm font-mono text-green-accent">Audited</p>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Trust Level</p>
                <p className="text-sm font-mono text-purple-accent">85/100</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
