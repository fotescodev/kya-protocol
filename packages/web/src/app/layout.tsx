import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "KYA Protocol — On-Chain Identity for AI Agents | Know Your Agent",
  description:
    "AI agents move billions but can't prove who they are. KYA is an open standard for verifiable agent identity — four composable attestation schemas built on EAS and Base. No new chain. No token. Open source.",
  keywords: [
    "AI agent identity",
    "on-chain identity",
    "Know Your Agent",
    "KYA Protocol",
    "EAS",
    "Ethereum Attestation Service",
    "Base blockchain",
    "agent KYC",
    "Web3 AI",
    "autonomous agents",
    "verifiable credentials",
    "agent attestation",
    "agentic commerce",
    "AI accountability",
    "agent trust chain",
    "Solidity",
    "TypeScript SDK",
  ],
  authors: [{ name: "Daniel Fotescu", url: "https://edgeoftrust.com" }],
  creator: "Daniel Fotescu",
  openGraph: {
    title: "KYA Protocol — On-Chain Identity for AI Agents",
    description:
      "AI agents move billions but can't prove who they are. KYA is an open standard for verifiable agent identity built on EAS and Base. Open source.",
    url: "https://kyaprotocol.com",
    siteName: "KYA Protocol",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "KYA Protocol — On-Chain Identity for AI Agents",
    description:
      "AI agents move billions but can't prove who they are. Open standard for verifiable agent identity. Built on EAS + Base.",
    creator: "@dfotesco",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kyaprotocol.com",
  },
  metadataBase: new URL("https://kyaprotocol.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-navy text-text-primary`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-electric focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
