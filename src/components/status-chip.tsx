import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  payment_required: "bg-[rgba(139,91,16,0.12)] text-[var(--warning)]",
  authorizing: "bg-[rgba(31,76,112,0.12)] text-[var(--info)]",
  paid: "bg-[rgba(31,76,112,0.12)] text-[var(--info)]",
  executing: "bg-[rgba(196,95,50,0.12)] text-[var(--accent-strong)]",
  fulfilled: "bg-[rgba(29,107,77,0.14)] text-[var(--success)]",
  failed: "bg-[rgba(140,47,47,0.12)] text-[var(--danger)]",
  simulated: "bg-[rgba(139,91,16,0.12)] text-[var(--warning)]",
  confirmed: "bg-[rgba(29,107,77,0.14)] text-[var(--success)]",
  completed: "bg-[rgba(29,107,77,0.14)] text-[var(--success)]",
  completed_with_errors: "bg-[rgba(139,91,16,0.12)] text-[var(--warning)]",
  running: "bg-[rgba(31,76,112,0.12)] text-[var(--info)]",
  active: "bg-[rgba(29,107,77,0.14)] text-[var(--success)]",
  demo: "bg-[rgba(139,91,16,0.12)] text-[var(--warning)]",
  real: "bg-[rgba(29,107,77,0.14)] text-[var(--success)]",
};

export function StatusChip({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.14em] uppercase",
        toneMap[value] || "bg-black/5 text-black/65",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
