import { NextResponse } from "next/server";
import { getSellerActivity } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    activity: await getSellerActivity(12),
  });
}
