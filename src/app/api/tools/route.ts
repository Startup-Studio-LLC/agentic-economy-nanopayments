import { NextResponse } from "next/server";
import { listTools } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    tools: await listTools(),
  });
}
