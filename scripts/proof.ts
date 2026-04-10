import { resolvePaymentMode } from "../src/lib/env";
import { getFeaturedTool } from "../src/lib/store";
import { runProofBatch } from "../src/lib/toolmarket";

async function main() {
  const requestedMode = process.argv[2] || "demo";
  const count = Number(process.argv[3] || "10");
  const mode = resolvePaymentMode(requestedMode);
  const tool = await getFeaturedTool();

  if (!tool) {
    throw new Error("No featured tool found.");
  }

  const result = await runProofBatch({
    toolId: tool.id,
    count,
    paymentMode: mode,
  });

  console.log(
    JSON.stringify(
      {
        mode,
        proofRun: result.proofRun,
        invocationCount: result.invocations.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
