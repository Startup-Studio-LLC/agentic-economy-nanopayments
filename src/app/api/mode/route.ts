import { NextResponse } from "next/server";
import { PAYMENT_MODE_COOKIE } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { mode?: "demo" | "real" };
  const mode = body.mode === "real" ? "real" : "demo";

  const response = NextResponse.json({ mode });
  response.cookies.set(PAYMENT_MODE_COOKIE, mode, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
