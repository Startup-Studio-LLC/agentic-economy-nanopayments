import { InvocationFeed } from "@/components/invocation-feed";
import { SellerSummary } from "@/components/seller-summary";
import { getSellerActivity, getSellerSummary } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SellerPage() {
  const summary = await getSellerSummary();
  const activity = await getSellerActivity(12);

  if (!summary) {
    return <div>Seller summary is unavailable.</div>;
  }

  return (
    <div className="grid gap-6">
      <section className="glass-panel section-card">
        <p className="eyebrow">Seller View</p>
        <h1 className="mt-2 text-4xl font-semibold">{summary.seller.name}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
          {summary.seller.tagline} This screen exists for judges: who earned money, from which
          tool, and what settlement state backed the revenue claim.
        </p>
      </section>

      <SellerSummary summary={summary} />

      <InvocationFeed
        invocations={activity.map((item) => item.invocation)}
        title="Seller-side invocation history"
      />
    </div>
  );
}
