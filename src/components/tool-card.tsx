import type { ToolRecord } from "@/lib/store";
import { formatUsdc } from "@/lib/utils";
import { StatusChip } from "@/components/status-chip";

export function ToolCard({ tool }: { tool: ToolRecord }) {
  return (
    <div className="glass-panel surface-stripe section-card relative overflow-hidden">
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{tool.category}</p>
            <h2 className="mt-2 text-3xl font-semibold">{tool.name}</h2>
          </div>
          <StatusChip value={tool.status} />
        </div>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">{tool.description}</p>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Price</div>
            <div className="mt-1 text-xl font-semibold">{formatUsdc(tool.priceUsdc)}</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Delivery</div>
            <div className="mt-1 text-xl font-semibold">Immediately after authorization</div>
          </div>
        </div>
      </div>
    </div>
  );
}
