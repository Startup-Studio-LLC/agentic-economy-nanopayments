"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { PaymentMode } from "@/lib/env";
import { cn } from "@/lib/utils";

export function ModeSwitch({
  currentMode,
  realAvailable,
}: {
  currentMode: PaymentMode;
  realAvailable: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setMode = (mode: PaymentMode) => {
    startTransition(async () => {
      await fetch("/api/mode", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ mode }),
      });

      router.refresh();
    });
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 p-1 text-sm shadow-sm">
      {(["demo", "real"] as PaymentMode[]).map((mode) => {
        const disabled = mode === "real" && !realAvailable;
        return (
          <button
            key={mode}
            type="button"
            disabled={disabled || isPending}
            onClick={() => setMode(mode)}
            className={cn(
              "rounded-full px-3 py-1.5 font-medium transition",
              currentMode === mode
                ? "bg-[var(--foreground)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
              disabled && "cursor-not-allowed opacity-45",
            )}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
