"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PaymentMode } from "@/lib/env";
import type { InvocationRecord, ProofRunRecord, ToolRecord } from "@/lib/store";
import { InvocationFeed } from "@/components/invocation-feed";
import { StatusChip } from "@/components/status-chip";

export function ProofRunner({
  tool,
  paymentMode,
  initialProofRun,
  initialInvocations,
}: {
  tool: ToolRecord;
  paymentMode: PaymentMode;
  initialProofRun: ProofRunRecord | null;
  initialInvocations: InvocationRecord[];
}) {
  const router = useRouter();
  const [proofRun, setProofRun] = useState(initialProofRun);
  const [invocations, setInvocations] = useState(initialInvocations);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runBatch = (count: number) => {
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/proof/run", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          toolId: tool.id,
          count,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Proof run failed.");
        return;
      }

      setProofRun(data.proofRun);
      setInvocations(data.invocations);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-5">
      <section className="glass-panel section-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Proof Generator</p>
            <h2 className="mt-2 text-3xl font-semibold">Create repeated paid calls</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
              The hackathon asks for 50-plus onchain transactions. This page runs the complete paid
              loop repeatedly so you can build evidence early instead of waiting until submission day.
            </p>
          </div>
          <StatusChip value={paymentMode} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => runBatch(10)}
            disabled={isPending}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
          >
            Run 10 calls
          </button>
          <button
            type="button"
            onClick={() => runBatch(50)}
            disabled={isPending}
            className="rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold transition hover:border-[var(--accent)] disabled:opacity-60"
          >
            Run 50 calls
          </button>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl border border-[rgba(140,47,47,0.15)] bg-[rgba(140,47,47,0.07)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}
      </section>

      {proofRun ? (
        <section className="balance-grid">
          <article className="glass-panel section-card">
            <div className="eyebrow">Latest Batch</div>
            <div className="mt-2 text-4xl font-semibold">{proofRun.targetCount}</div>
            <p className="mt-3 text-sm text-[var(--muted)]">Requested transactions in the last proof run.</p>
          </article>
          <article className="glass-panel section-card">
            <div className="eyebrow">Successes</div>
            <div className="mt-2 text-4xl font-semibold">{proofRun.successCount}</div>
            <p className="mt-3 text-sm text-[var(--muted)]">Paid invocations completed without errors.</p>
          </article>
          <article className="glass-panel section-card">
            <div className="eyebrow">Status</div>
            <div className="mt-2">
              <StatusChip value={proofRun.status} />
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">Failures stay visible so the demo never hides risk.</p>
          </article>
        </section>
      ) : null}

      <InvocationFeed invocations={invocations} title="Proof-run activity" />
    </div>
  );
}
