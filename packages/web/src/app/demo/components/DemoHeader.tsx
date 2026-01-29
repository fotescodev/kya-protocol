"use client";

import Link from "next/link";
import { SITE } from "@/lib/constants";

export function DemoHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-text-primary hover:text-electric transition-colors"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              className="text-electric"
            >
              <rect
                x="2"
                y="2"
                width="28"
                height="28"
                rx="6"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M10 16L14 20L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold">{SITE.name}</span>
          </Link>

          {/* Demo badge + back link */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-electric/10 text-electric text-xs font-medium border border-electric/20">
              Interactive Demo
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
