import { NextResponse } from "next/server";
import { z } from "zod";
import { PAYMENT_MODE_COOKIE, resolvePaymentMode } from "@/lib/env";
import { runProofBatch } from "@/lib/toolmarket";

export const runtime = "nodejs";

const schema = z.object({
  toolId: z.string().min(1),
  count: z.number().int().min(1).max(100),
});

export async function POST(request: Request) {
  const mode = resolvePaymentMode((request as Request & { cookies?: { get(name: string): { value: string } | undefined } }).cookies?.get?.(PAYMENT_MODE_COOKIE)?.value);
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid proof-run payload.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await runProofBatch({
      toolId: parsed.data.toolId,
      count: parsed.data.count,
      paymentMode: mode,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Proof run failed.",
      },
      { status: 400 },
    );
  }
}
