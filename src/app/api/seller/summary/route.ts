import { NextResponse } from "next/server";
import { getSellerSummary } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    summary: await getSellerSummary(),
  });
}
