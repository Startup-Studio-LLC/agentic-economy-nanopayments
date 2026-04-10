import { NextResponse } from "next/server";
import { z } from "zod";
import { PAYMENT_MODE_COOKIE, resolvePaymentMode } from "@/lib/env";
import { beginPaidInvocation, fulfillPaidInvocation } from "@/lib/toolmarket";

export const runtime = "nodejs";

const beginSchema = z.object({
  url: z.string().min(1),
  goal: z.string().optional(),
});

const fulfillSchema = z.object({
  invocationId: z.string().uuid(),
  challengeId: z.string().uuid(),
  paymentPayload: z.object({
    x402Version: z.literal(2),
    accepted: z.object({
      scheme: z.string(),
      network: z.string(),
      amount: z.string(),
      asset: z.string(),
      payTo: z.string(),
      maxTimeoutSeconds: z.number(),
      extra: z.record(z.string(), z.unknown()).optional(),
    }),
    payload: z.record(z.string(), z.unknown()),
    resource: z
      .object({
        url: z.string(),
        description: z.string(),
        mimeType: z.string(),
      })
      .optional(),
    extensions: z.record(z.string(), z.unknown()).optional(),
  }),
});

export async function POST(
  request: Request,
  context: {
    params: Promise<{ toolId: string }>;
  },
) {
  const { toolId } = await context.params;
  const mode = resolvePaymentMode((request as Request & { cookies?: { get(name: string): { value: string } | undefined } }).cookies?.get?.(PAYMENT_MODE_COOKIE)?.value);
  const body = await request.json();

  const fulfillAttempt = fulfillSchema.safeParse(body);
  if (fulfillAttempt.success) {
    const fulfilled = await fulfillPaidInvocation({
      toolId,
      invocationId: fulfillAttempt.data.invocationId,
      challengeId: fulfillAttempt.data.challengeId,
      paymentPayload: fulfillAttempt.data.paymentPayload,
      paymentMode: mode,
    });

    if (fulfilled.error) {
      return NextResponse.json(fulfilled, { status: 400 });
    }

    return NextResponse.json(fulfilled);
  }

  const beginAttempt = beginSchema.safeParse(body);
  if (!beginAttempt.success) {
    return NextResponse.json(
      {
        error: "Invalid invocation payload.",
        issues: beginAttempt.error.flatten(),
      },
      { status: 400 },
    );
  }

  const started = await beginPaidInvocation({
    toolId,
    payload: {
      url: beginAttempt.data.url,
      goal: beginAttempt.data.goal,
    },
    paymentMode: mode,
  });

  const response = NextResponse.json(started, { status: 402 });
  response.headers.set("PAYMENT-REQUIRED", JSON.stringify(started.paymentRequired));
  return response;
}
