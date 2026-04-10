import { ProofRunner } from "@/components/proof-runner";
import { getRequestedModeFromCookies, resolvePaymentMode } from "@/lib/env";
import { getFeaturedTool, getLatestProofRun, listProofRunInvocations } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProofPage() {
  const mode = resolvePaymentMode(await getRequestedModeFromCookies());
  const tool = await getFeaturedTool();
  const latestProofRun = await getLatestProofRun();
  const invocations = latestProofRun ? await listProofRunInvocations(latestProofRun.id) : [];

  if (!tool) {
    return <div>No tool available for proof generation.</div>;
  }

  return (
    <ProofRunner
      tool={tool}
      paymentMode={mode}
      initialProofRun={latestProofRun}
      initialInvocations={invocations}
    />
  );
}
