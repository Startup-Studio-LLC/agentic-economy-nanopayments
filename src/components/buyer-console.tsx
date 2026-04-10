"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PaymentMode } from "@/lib/env";
import type { InvocationRecord, ToolRecord } from "@/lib/store";
import type { PaymentPayload } from "@/lib/payment";
import { formatUsdc } from "@/lib/utils";
import { InvocationFeed } from "@/components/invocation-feed";
import { StatusChip } from "@/components/status-chip";

interface BuyerConsoleProps {
  tool: ToolRecord;
  initialInvocations: InvocationRecord[];
  paymentMode: PaymentMode;
  providerStatus: {
    activeMode: PaymentMode;
    activeLabel: string;
    realAvailable: boolean;
    realMissing: string[];
  };
}

export function BuyerConsole({
  tool,
  initialInvocations,
  paymentMode,
  providerStatus,
}: BuyerConsoleProps) {
  const router = useRouter();
  const [activity, setActivity] = useState(initialInvocations);
  const [url, setUrl] = useState(tool.sampleInput.url);
  const [goal, setGoal] = useState(tool.sampleInput.goal || "");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [invocationId, setInvocationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvocationRecord | null>(null);
  const [settlement, setSettlement] = useState<{
    status: string;
    txHash?: string | null;
    explorerUrl?: string | null;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const beginPayment = () => {
    setError(null);
    setResult(null);
    setSettlement(null);
    setStatus("requesting");

    startTransition(async () => {
      const response = await fetch(`/api/tools/${tool.id}/invoke`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url,
          goal,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        setChallengeId(data.challenge.id);
        setInvocationId(data.invocation.id);
        setStatus("payment_required");
        return;
      }

      setError(data.error || "The initial request did not return a payment challenge.");
      setStatus("failed");
    });
  };

  const authorizeAndRetry = () => {
    if (!challengeId || !invocationId) {
      return;
    }

    setError(null);
    setStatus("authorizing");

    startTransition(async () => {
      const authorizationResponse = await fetch("/api/payments/authorize", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
        }),
      });
      const authorizationData = await authorizationResponse.json();

      if (!authorizationResponse.ok) {
        setError(authorizationData.error || "Authorization failed.");
        setStatus("failed");
        return;
      }

      setStatus("paid");

      const invokeResponse = await fetch(`/api/tools/${tool.id}/invoke`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          invocationId,
          challengeId,
          paymentPayload: authorizationData.authorization.paymentPayload as PaymentPayload,
        }),
      });

      const invokeData = await invokeResponse.json();
      if (!invokeResponse.ok) {
        setError(invokeData.error || "Settlement or fulfillment failed.");
        setStatus("failed");
        return;
      }

      setResult(invokeData.invocation);
      setSettlement(invokeData.settlement);
      setActivity(invokeData.recentInvocations);
      setStatus(invokeData.invocation.status);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-5">
      <section className="glass-panel section-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Buyer Flow</p>
            <h3 className="mt-2 text-2xl font-semibold">Run the paid action</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusChip value={paymentMode} />
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {providerStatus.activeLabel}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">URL</span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 outline-none ring-0 transition focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Extraction goal</span>
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                rows={3}
                className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 outline-none ring-0 transition focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_var(--ring)]"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={beginPayment}
                disabled={isPending}
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(196,95,50,0.24)] transition hover:bg-[var(--accent-strong)] disabled:opacity-60"
              >
                1. Request paid result
              </button>
              <button
                type="button"
                onClick={authorizeAndRetry}
                disabled={!challengeId || isPending}
                className="rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold transition hover:border-[var(--accent)] disabled:opacity-45"
              >
                2. Authorize and fulfill
              </button>
              <Link
                href={`/tools/${tool.slug}`}
                className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                Tool detail
              </Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-black/10 bg-[var(--background-strong)] p-5">
            <p className="eyebrow">Payment Timeline</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Price</span>
                <strong>{formatUsdc(tool.priceUsdc)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>State</span>
                <StatusChip value={status === "idle" ? "payment_required" : status} />
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/75 p-4 text-[var(--muted)]">
                <p className="font-medium text-[var(--foreground)]">Demo URLs</p>
                <p className="mt-2">Use one of the built-in sources for reliable live demos:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li className="mono">demo://arc/agentic-economy</li>
                  <li className="mono">demo://arc/circle-gateway</li>
                  <li className="mono">demo://arc/policy-check</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl border border-[rgba(140,47,47,0.15)] bg-[rgba(140,47,47,0.07)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}
        {providerStatus.realMissing.length > 0 && paymentMode === "demo" ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Real mode is disabled until these env vars are set: {providerStatus.realMissing.join(", ")}.
          </p>
        ) : null}
      </section>

      {result?.output ? (
        <section className="glass-panel section-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Fulfillment</p>
              <h3 className="mt-2 text-2xl font-semibold">{result.output.title}</h3>
            </div>
            <StatusChip value={result.status} />
          </div>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">{result.output.summary}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[24px] border border-black/10 bg-white/75 p-5">
              <div className="text-sm font-medium">Structured extraction</div>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                {result.output.bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] border border-black/10 bg-white/75 p-5">
              <div className="text-sm font-medium">Settlement evidence</div>
              <div className="mt-3 flex flex-col gap-3 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between gap-3">
                  <span>Status</span>
                  <StatusChip value={settlement?.status || "fulfilled"} />
                </div>
                {settlement?.txHash ? (
                  <div className="flex items-center justify-between gap-3">
                    <span>Reference</span>
                    <span className="mono text-xs">{settlement.txHash.slice(0, 18)}…</span>
                  </div>
                ) : null}
                {settlement?.explorerUrl ? (
                  <Link href={settlement.explorerUrl} target="_blank" className="font-medium text-[var(--accent-strong)]">
                    Open explorer proof
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <InvocationFeed invocations={activity} title="Recent paid invocations" />
    </div>
  );
}
