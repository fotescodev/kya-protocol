"use client";

import { VERIFICATION_STEPS } from "../data";
import { cn } from "@/lib/cn";

interface VerificationFlowProps {
  currentStep: number; // -1 = idle, 0-5 = active step
  status: "idle" | "running" | "success" | "error";
  errorStep?: number;
  errorMessage?: string;
}

const icons: Record<string, React.ReactNode> = {
  inbox: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  "user-check": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  "shield-check": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  link: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "dollar-sign": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  "check-circle": (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const checkIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const xIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

type StepState = "pending" | "active" | "complete" | "error";

const colorMap: Record<string, { bg: string; text: string }> = {
  gray: { bg: "bg-gray-500/20", text: "text-gray-400" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
  green: { bg: "bg-green-500/20", text: "text-green-400" },
};

export function VerificationFlow({
  currentStep,
  status,
  errorStep,
  errorMessage,
}: VerificationFlowProps) {
  const getStepState = (stepIndex: number): StepState => {
    if (status === "error" && errorStep === stepIndex) return "error";
    if (currentStep < 0) return "pending";
    if (stepIndex < currentStep) return "complete";
    if (stepIndex === currentStep && status === "running") return "active";
    if (status === "success" && stepIndex <= currentStep) return "complete";
    return "pending";
  };

  // Calculate progress percentage for the connecting line
  const getProgressPercent = (): number => {
    if (currentStep < 0) return 0;
    if (status === "success") return 100;
    if (status === "error" && errorStep !== undefined) {
      return (errorStep / (VERIFICATION_STEPS.length - 1)) * 100;
    }
    // Progress based on completed steps plus partial for active
    const completed = Math.max(0, currentStep);
    return (completed / (VERIFICATION_STEPS.length - 1)) * 100;
  };

  return (
    <div
      className="glass-bright rounded-2xl p-6"
      role="region"
      aria-label="Verification flow progress"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-electric"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Verification Flow
        </h3>
        <div aria-live="polite" aria-atomic="true">
          {status === "running" && (
            <span className="text-xs px-3 py-1 rounded-full bg-electric/20 text-electric motion-safe:animate-pulse">
              Processing...
            </span>
          )}
          {status === "success" && (
            <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400">
              Complete
            </span>
          )}
          {status === "error" && (
            <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Horizontal step flow */}
      <div className="relative" role="list" aria-label="Verification steps">
        {/* Progress line background */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10" aria-hidden="true" />

        {/* Progress line fill */}
        <div
          className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{
            width: `calc(${getProgressPercent()}% - ${getProgressPercent() === 100 ? 0 : 20}px)`,
          }}
          role="progressbar"
          aria-valuenow={Math.round(getProgressPercent())}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Verification progress"
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {VERIFICATION_STEPS.map((step, i) => {
            const state = getStepState(i);
            const stepColor = colorMap[step.color] || colorMap.gray;
            const stateLabel = state === "complete" ? "completed" : state === "error" ? "failed" : state === "active" ? "in progress" : "pending";

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ width: `${100 / VERIFICATION_STEPS.length}%` }}
                role="listitem"
                aria-label={`Step ${i + 1}: ${step.label} - ${stateLabel}`}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                    state === "pending" && "bg-white/5 text-text-muted",
                    state === "active" && [stepColor.bg, stepColor.text, "motion-safe:animate-pulse"],
                    state === "complete" && "bg-green-500/20 text-green-400",
                    state === "error" && "bg-red-500/20 text-red-400"
                  )}
                  aria-hidden="true"
                >
                  {state === "complete" && checkIcon}
                  {state === "error" && xIcon}
                  {(state === "pending" || state === "active") && icons[step.icon]}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    "mt-2 text-xs text-center transition-colors duration-300 max-w-[80px]",
                    state === "pending" && "text-text-muted",
                    state === "active" && stepColor.text,
                    state === "complete" && "text-green-400",
                    state === "error" && "text-red-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error message */}
      {status === "error" && errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
