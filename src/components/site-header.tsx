import Link from "next/link";
import type { PaymentMode } from "@/lib/env";
import { primaryNav, siteCopy } from "@/lib/content";
import { ModeSwitch } from "@/components/mode-switch";

export function SiteHeader({
  currentMode,
  realAvailable,
}: {
  currentMode: PaymentMode;
  realAvailable: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[rgba(251,245,235,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white shadow-lg shadow-[rgba(196,95,50,0.25)]">
              TM
            </div>
            <div>
              <div className="text-base font-semibold">{siteCopy.productName}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Agentic economy demo
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ModeSwitch currentMode={currentMode} realAvailable={realAvailable} />
        </div>
      </div>
    </header>
  );
}
