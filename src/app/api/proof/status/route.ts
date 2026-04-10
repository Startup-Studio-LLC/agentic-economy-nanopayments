import { NextResponse } from "next/server";
import { getLatestProofRun, listProofRunInvocations } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const proofRun = await getLatestProofRun();

  return NextResponse.json({
    proofRun,
    invocations: proofRun ? await listProofRunInvocations(proofRun.id) : [],
  });
}
