import { getDefaultBuyerLabel, type PaymentMode } from "@/lib/env";
import { proofRunInputs } from "@/lib/demo-documents";
import { getPaymentProvider, type PaymentPayload } from "@/lib/payment";
import {
  createInvocationRecord,
  createPaymentAuthorizationRecord,
  createPaymentChallengeRecord,
  createProofRun,
  createSettlementEventRecord,
  getChallengeForInvocation,
  getInvocationById,
  getPaymentChallengeById,
  getToolByIdOrSlug,
  listProofRunInvocations,
  listRecentInvocations,
  markPaymentChallengeConsumed,
  updateInvocationStatus,
  updateProofRun,
} from "@/lib/store";
import { executePremiumWebFetch, type ToolInput } from "@/lib/tool-executor";
import { atomicUsdcToDecimal } from "@/lib/utils";

export async function beginPaidInvocation(input: {
  toolId: string;
  payload: ToolInput;
  paymentMode: PaymentMode;
  buyerLabel?: string;
  proofRunId?: string | null;
}) {
  const tool = await getToolByIdOrSlug(input.toolId);
  if (!tool) {
    throw new Error("Tool not found.");
  }

  const invocation = await createInvocationRecord({
    toolId: tool.id,
    buyerLabel: input.buyerLabel || getDefaultBuyerLabel(),
    inputPayload: input.payload,
    priceUsdc: tool.priceUsdc,
    paymentMode: input.paymentMode,
    proofRunId: input.proofRunId ?? null,
  });

  const provider = getPaymentProvider(input.paymentMode);
  const paymentRequired = await provider.createChallenge({
    invocationId: invocation.id,
    toolId: tool.id,
    toolName: tool.name,
    priceUsdc: tool.priceUsdc,
    resourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tools/${tool.id}/invoke`,
  });

  const challenge = await createPaymentChallengeRecord({
    toolId: tool.id,
    invocationId: invocation.id,
    amountUsdc: tool.priceUsdc,
    paymentRequired,
  });

  return {
    tool,
    invocation,
    challenge,
    paymentRequired,
    providerLabel: provider.label,
  };
}

export async function authorizeChallenge(input: {
  challengeId: string;
  paymentMode: PaymentMode;
}) {
  const challenge = await getPaymentChallengeById(input.challengeId);
  if (!challenge) {
    throw new Error("Payment challenge not found.");
  }

  const invocation = await getInvocationById(challenge.invocationId);
  if (!invocation) {
    throw new Error("Invocation not found.");
  }

  await updateInvocationStatus(invocation.id, "authorizing");

  const provider = getPaymentProvider(input.paymentMode);
  const authorization = await provider.authorize(challenge.paymentRequired);
  const authorizationRecord = await createPaymentAuthorizationRecord({
    challengeId: challenge.id,
    authorizationType: authorization.authorizationType,
    paymentPayload: authorization.paymentPayload,
    status: "verified",
  });

  const updatedInvocation = await updateInvocationStatus(invocation.id, "paid", {
    paymentAuthorizationId: authorizationRecord.id,
  });

  return {
    challenge,
    invocation: updatedInvocation,
    authorization: authorizationRecord,
    payer: authorization.payer,
  };
}

export async function fulfillPaidInvocation(input: {
  toolId: string;
  invocationId: string;
  challengeId: string;
  paymentPayload: PaymentPayload;
  paymentMode: PaymentMode;
}) {
  const tool = await getToolByIdOrSlug(input.toolId);
  if (!tool) {
    throw new Error("Tool not found.");
  }

  const invocation = await getInvocationById(input.invocationId);
  if (!invocation) {
    throw new Error("Invocation not found.");
  }

  const challenge =
    (await getPaymentChallengeById(input.challengeId)) || (await getChallengeForInvocation(invocation.id));
  if (!challenge) {
    throw new Error("No payment challenge was found for this invocation.");
  }

  const provider = getPaymentProvider(input.paymentMode);

  try {
    const settlement = await provider.verifyAndSettle(challenge.paymentRequired, input.paymentPayload);
    const settlementRecord = await createSettlementEventRecord({
      invocationId: invocation.id,
      provider: settlement.provider,
      network: settlement.network,
      asset: settlement.asset,
      amountUsdc: atomicUsdcToDecimal(settlement.amountUsdc),
      status: settlement.status,
      txHash: settlement.txHash,
      explorerUrl: settlement.explorerUrl,
      batchReference: settlement.batchReference,
      rawPayload: settlement.rawPayload,
    });

    await updateInvocationStatus(invocation.id, "executing", {
      settlementEventId: settlementRecord.id,
    });

    const output = await executePremiumWebFetch(invocation.input);
    const finalInvocation = await updateInvocationStatus(invocation.id, "fulfilled", {
      settlementEventId: settlementRecord.id,
      output,
      errorMessage: null,
    });

    await markPaymentChallengeConsumed(challenge.id);

    return {
      tool,
      invocation: finalInvocation,
      challenge,
      output,
      settlement: settlementRecord,
      recentInvocations: await listRecentInvocations(8),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown settlement failure.";
    const failedInvocation = await updateInvocationStatus(invocation.id, "failed", {
      errorMessage: message,
    });

    return {
      tool,
      invocation: failedInvocation,
      challenge,
      output: null,
      settlement: null,
      recentInvocations: await listRecentInvocations(8),
      error: message,
    };
  }
}

export async function runProofBatch(input: {
  toolId: string;
  count: number;
  paymentMode: PaymentMode;
}) {
  const proofRun = await createProofRun({
    toolId: input.toolId,
    targetCount: input.count,
    mode: input.paymentMode,
  });

  let successCount = 0;
  let failureCount = 0;

  for (let index = 0; index < input.count; index += 1) {
    const payload = proofRunInputs[index % proofRunInputs.length];

    try {
      const started = await beginPaidInvocation({
        toolId: input.toolId,
        payload,
        paymentMode: input.paymentMode,
        buyerLabel: `Proof Runner ${index + 1}`,
        proofRunId: proofRun.id,
      });

      const authorized = await authorizeChallenge({
        challengeId: started.challenge.id,
        paymentMode: input.paymentMode,
      });

      const fulfilled = await fulfillPaidInvocation({
        toolId: input.toolId,
        invocationId: started.invocation.id,
        challengeId: started.challenge.id,
        paymentPayload: authorized.authorization.paymentPayload,
        paymentMode: input.paymentMode,
      });

      if (fulfilled.error) {
        failureCount += 1;
      } else {
        successCount += 1;
      }
    } catch {
      failureCount += 1;
    }

    await updateProofRun(proofRun.id, {
      successCount,
      failureCount,
      status: "running",
    });
  }

  const completed = await updateProofRun(proofRun.id, {
    successCount,
    failureCount,
    status: failureCount > 0 ? "completed_with_errors" : "completed",
  });

  return {
    proofRun: completed,
    invocations: await listProofRunInvocations(proofRun.id),
  };
}
