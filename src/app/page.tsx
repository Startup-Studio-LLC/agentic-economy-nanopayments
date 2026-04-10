import Link from "next/link";
import { BuyerConsole } from "@/components/buyer-console";
import { ToolCard } from "@/components/tool-card";
import { getProviderStatus } from "@/lib/payment";
import { siteCopy } from "@/lib/content";
import { getRequestedModeFromCookies, resolvePaymentMode } from "@/lib/env";
import { getFeaturedTool, listRecentInvocations } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const mode = resolvePaymentMode(await getRequestedModeFromCookies());
  const tool = await getFeaturedTool();
  const invocations = await listRecentInvocations(8);
  const providerStatus = getProviderStatus(mode);

  if (!tool) {
    return <div>No featured tool found.</div>;
  }

  return (
    <div className="grid gap-6">
      <section className="glass-panel surface-stripe section-card">
        <div className="hero-copy relative">
          <p className="eyebrow">Agentic Economy on Arc</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-tight md:text-6xl">
            {siteCopy.heroTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            {siteCopy.heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/tools/${tool.slug}`}
              className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
            >
              Inspect the paid endpoint
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--muted)]"
            >
              Why Arc matters
            </Link>
          </div>
        </div>
      </section>

      <div className="grid-shell">
        <div className="grid gap-5">
          <ToolCard tool={tool} />
          <BuyerConsole
            tool={tool}
            initialInvocations={invocations}
            paymentMode={mode}
            providerStatus={providerStatus}
          />
        </div>
        <aside className="grid gap-5">
          <section className="glass-panel section-card">
            <p className="eyebrow">Why per-call</p>
            <h2 className="mt-2 text-2xl font-semibold">Payments are the product, not the footer.</h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">{siteCopy.whyItMatters}</p>
          </section>
          <section className="glass-panel section-card">
            <p className="eyebrow">Why Arc</p>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">{siteCopy.whyArc}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
