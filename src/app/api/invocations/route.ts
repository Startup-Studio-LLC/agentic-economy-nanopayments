import { NextResponse } from "next/server";
import { listRecentInvocations } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    invocations: await listRecentInvocations(12),
  });
}
