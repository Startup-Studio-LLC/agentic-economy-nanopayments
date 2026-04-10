import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { getRequestedModeFromCookies, getRealProviderReadiness, resolvePaymentMode } from "@/lib/env";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ToolMarket Lite",
  description: "Demo-first x402-style API monetization on Arc.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentMode = resolvePaymentMode(await getRequestedModeFromCookies());
  const readiness = getRealProviderReadiness();

  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="page-shell">
          <SiteHeader currentMode={currentMode} realAvailable={readiness.available} />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 pb-16 pt-6 md:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
