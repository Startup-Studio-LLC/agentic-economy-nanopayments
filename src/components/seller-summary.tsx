import type { SellerSummary as SellerSummaryType } from "@/lib/store";
import { StatusChip } from "@/components/status-chip";

export function SellerSummary({ summary }: { summary: SellerSummaryType }) {
  return (
    <section className="grid gap-4">
      <div className="balance-grid">
        <article className="glass-panel section-card">
          <div className="eyebrow">Revenue</div>
          <div className="mt-2 text-4xl font-semibold">{summary.totalRevenueUsdc} USDC</div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Revenue updates immediately after each successful paid invocation.
          </p>
        </article>
        <article className="glass-panel section-card">
          <div className="eyebrow">Invocations</div>
          <div className="mt-2 text-4xl font-semibold">{summary.totalInvocations}</div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {summary.fulfilledInvocations} fulfilled requests across all recorded sessions.
          </p>
        </article>
        <article className="glass-panel section-card">
          <div className="eyebrow">Settlement</div>
          <div className="mt-2">
            <StatusChip value={summary.latestSettlementStatus} />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            The latest settlement state is surfaced directly so judges can verify the economic loop.
          </p>
        </article>
      </div>

      <section className="glass-panel section-card">
        <div>
          <p className="eyebrow">Revenue by Tool</p>
          <h3 className="mt-2 text-2xl font-semibold">Seller earnings breakdown</h3>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Revenue</th>
                <th>Fulfilled calls</th>
              </tr>
            </thead>
            <tbody>
              {summary.byTool.map((tool) => (
                <tr key={tool.toolId}>
                  <td className="font-medium">{tool.toolName}</td>
                  <td>{tool.revenueUsdc} USDC</td>
                  <td>{tool.invocationCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
