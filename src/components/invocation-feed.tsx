import type { InvocationRecord } from "@/lib/store";
import { formatCompactDate, formatUsdc, truncate } from "@/lib/utils";
import { StatusChip } from "@/components/status-chip";

export function InvocationFeed({
  invocations,
  title,
}: {
  invocations: InvocationRecord[];
  title: string;
}) {
  return (
    <section className="glass-panel section-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Activity</p>
          <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
        </div>
        <div className="text-sm text-[var(--muted)]">{invocations.length} recent events</div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Status</th>
              <th>Input</th>
              <th>Price</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {invocations.map((invocation) => (
              <tr key={invocation.id}>
                <td>
                  <div className="font-medium">{invocation.buyerLabel}</div>
                  <div className="mono text-xs text-[var(--muted)]">{invocation.id.slice(0, 8)}</div>
                </td>
                <td>
                  <StatusChip value={invocation.status} />
                </td>
                <td className="max-w-xs text-sm text-[var(--muted)]">
                  {truncate(invocation.input.url, 68)}
                </td>
                <td>{formatUsdc(invocation.priceUsdc)}</td>
                <td className="text-sm text-[var(--muted)]">{formatCompactDate(invocation.createdAt)}</td>
              </tr>
            ))}
            {invocations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-[var(--muted)]">
                  No invocations yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
