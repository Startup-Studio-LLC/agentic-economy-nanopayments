import { getProviderStatus } from "@/lib/payment";
import { siteCopy } from "@/lib/content";
import { getRequestedModeFromCookies, resolvePaymentMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const mode = resolvePaymentMode(await getRequestedModeFromCookies());
  const providerStatus = getProviderStatus(mode);

  return (
    <div className="grid gap-6">
      <section className="glass-panel section-card">
        <p className="eyebrow">About the Product</p>
        <h1 className="mt-2 text-4xl font-semibold">Why this app exists</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
          {siteCopy.whyItMatters} The point is to make the economic loop visible in one demo: price,
          authorization, fulfillment, revenue, and settlement.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-panel section-card">
          <p className="eyebrow">Arc</p>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            Arc is an EVM-compatible environment with USDC-native fees and deterministic finality.
            That makes it easier to defend the economics of sub-cent API calls in a hackathon demo.
          </p>
        </article>
        <article className="glass-panel section-card">
          <p className="eyebrow">Circle and x402</p>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            The app uses an x402-style 402 challenge, a buyer authorization step, and a settlement
            record. Demo mode mirrors the shape faithfully. Real mode swaps in Circle Gateway
            batching if the required environment variables are configured.
          </p>
        </article>
      </section>

      <section className="glass-panel section-card">
        <p className="eyebrow">Provider Status</p>
        <h2 className="mt-2 text-2xl font-semibold">{providerStatus.activeLabel}</h2>
        <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
          {providerStatus.capabilities.notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
        {providerStatus.realMissing.length > 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Real mode is unavailable until these env vars are present:{" "}
            {providerStatus.realMissing.join(", ")}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
