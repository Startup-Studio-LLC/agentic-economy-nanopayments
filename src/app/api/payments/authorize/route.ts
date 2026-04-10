import { NextResponse } from "next/server";
import { z } from "zod";
import { PAYMENT_MODE_COOKIE, resolvePaymentMode } from "@/lib/env";
import { authorizeChallenge } from "@/lib/toolmarket";

export const runtime = "nodejs";

const schema = z.object({
  challengeId: z.string().uuid(),
});

export async function POST(request: Request) {
  const mode = resolvePaymentMode((request as Request & { cookies?: { get(name: string): { value: string } | undefined } }).cookies?.get?.(PAYMENT_MODE_COOKIE)?.value);
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid challenge payload.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const authorization = await authorizeChallenge({
      challengeId: parsed.data.challengeId,
      paymentMode: mode,
    });
    return NextResponse.json(authorization);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Authorization failed.",
      },
      { status: 400 },
    );
  }
}
