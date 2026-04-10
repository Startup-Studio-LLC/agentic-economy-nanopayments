import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invocations,
  paymentAuthorizations,
  paymentChallenges,
  proofRuns,
  sellers,
  settlementEvents,
  tools,
} from "@/db/schema";
import { demoDocuments } from "@/lib/demo-documents";
import { getConfiguredSellerAddress, type PaymentMode } from "@/lib/env";
import type { PaymentPayload, PaymentRequiredResponse } from "@/lib/payment";
import type { ToolInput, ToolOutput } from "@/lib/tool-executor";
import { nowIso, safeJsonParse, serializeJson } from "@/lib/utils";

export const INVOCATION_STATUSES = [
  "payment_required",
  "authorizing",
  "paid",
  "executing",
  "fulfilled",
  "failed",
] as const;

export type InvocationStatus = (typeof INVOCATION_STATUSES)[number];

export interface ToolRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  status: string;
  priceUsdc: string;
  sellerId: string;
  sampleInput: ToolInput;
  sampleOutput: ToolOutput;
  isFeatured: boolean;
  createdAt: string;
}

export interface SellerRecord {
  id: string;
  name: string;
  tagline: string;
  walletLabel: string;
  walletAddress: string;
  createdAt: string;
}

export interface InvocationRecord {
  id: string;
  toolId: string;
  buyerLabel: string;
  input: ToolInput;
  output: ToolOutput | null;
  priceUsdc: string;
  status: InvocationStatus;
  paymentMode: PaymentMode;
  paymentChallengeId: string | null;
  paymentAuthorizationId: string | null;
  settlementEventId: string | null;
  proofRunId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentChallengeRecord {
  id: string;
  toolId: string;
  invocationId: string;
  amountUsdc: string;
  currency: string;
  paymentRequired: PaymentRequiredResponse;
  expiresAt: string;
  status: string;
  createdAt: string;
}

export interface PaymentAuthorizationRecord {
  id: string;
  challengeId: string;
  authorizationType: string;
  paymentPayload: PaymentPayload;
  status: string;
  createdAt: string;
}

export interface SettlementEventRecord {
  id: string;
  invocationId: string;
  provider: string;
  network: string;
  asset: string;
  amountUsdc: string;
  status: string;
  txHash: string | null;
  explorerUrl: string | null;
  batchReference: string | null;
  rawPayload: Record<string, unknown> | null;
  createdAt: string;
}

export interface ProofRunRecord {
  id: string;
  toolId: string;
  mode: PaymentMode;
  targetCount: number;
  successCount: number;
  failureCount: number;
  status: string;
  notes: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SellerSummary {
  seller: SellerRecord;
  totalRevenueUsdc: string;
  totalInvocations: number;
  fulfilledInvocations: number;
  latestSettlementStatus: string;
  byTool: Array<{
    toolId: string;
    toolName: string;
    revenueUsdc: string;
    invocationCount: number;
  }>;
}

function mapTool(row: typeof tools.$inferSelect): ToolRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    status: row.status,
    priceUsdc: row.priceUsdc,
    sellerId: row.sellerId,
    sampleInput: safeJsonParse<ToolInput>(row.sampleInput, { url: "demo://arc/agentic-economy" }),
    sampleOutput: safeJsonParse<ToolOutput>(row.sampleOutput, {
      title: "Demo output",
      summary: "Seed data missing",
      bullets: [],
      excerpt: "",
      entities: [],
      sourceType: "demo",
      canonicalUrl: "demo://arc/agentic-economy",
      fetchedAt: row.createdAt,
    }),
    isFeatured: row.isFeatured,
    createdAt: row.createdAt,
  };
}

function mapSeller(row: typeof sellers.$inferSelect): SellerRecord {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    walletLabel: row.walletLabel,
    walletAddress: row.walletAddress,
    createdAt: row.createdAt,
  };
}

function mapInvocation(row: typeof invocations.$inferSelect): InvocationRecord {
  return {
    id: row.id,
    toolId: row.toolId,
    buyerLabel: row.buyerLabel,
    input: safeJsonParse<ToolInput>(row.inputPayload, { url: "demo://arc/agentic-economy" }),
    output: safeJsonParse<ToolOutput | null>(row.outputPayload, null),
    priceUsdc: row.priceUsdc,
    status: row.status as InvocationStatus,
    paymentMode: row.paymentMode as PaymentMode,
    paymentChallengeId: row.paymentChallengeId,
    paymentAuthorizationId: row.paymentAuthorizationId,
    settlementEventId: row.settlementEventId,
    proofRunId: row.proofRunId,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapChallenge(row: typeof paymentChallenges.$inferSelect): PaymentChallengeRecord {
  return {
    id: row.id,
    toolId: row.toolId,
    invocationId: row.invocationId,
    amountUsdc: row.amountUsdc,
    currency: row.currency,
    paymentRequired: safeJsonParse<PaymentRequiredResponse>(row.x402Payload, {
      x402Version: 2,
      resource: {
        url: "",
        description: "",
        mimeType: "application/json",
      },
      accepts: [],
    }),
    expiresAt: row.expiresAt,
    status: row.status,
    createdAt: row.createdAt,
  };
}

function mapAuthorization(row: typeof paymentAuthorizations.$inferSelect): PaymentAuthorizationRecord {
  return {
    id: row.id,
    challengeId: row.challengeId,
    authorizationType: row.authorizationType,
    paymentPayload: safeJsonParse<PaymentPayload>(row.proofPayload, {
      x402Version: 2,
      accepted: {
        scheme: "exact",
        network: "eip155:5042002",
        amount: "0",
        asset: "USDC",
        payTo: getConfiguredSellerAddress(),
        maxTimeoutSeconds: 345600,
      },
      payload: {},
    }),
    status: row.status,
    createdAt: row.createdAt,
  };
}

function mapSettlement(row: typeof settlementEvents.$inferSelect): SettlementEventRecord {
  return {
    id: row.id,
    invocationId: row.invocationId,
    provider: row.provider,
    network: row.network,
    asset: row.asset,
    amountUsdc: row.amountUsdc,
    status: row.status,
    txHash: row.txHash,
    explorerUrl: row.explorerUrl,
    batchReference: row.batchReference,
    rawPayload: safeJsonParse<Record<string, unknown> | null>(row.rawPayload, null),
    createdAt: row.createdAt,
  };
}

function mapProofRun(row: typeof proofRuns.$inferSelect): ProofRunRecord {
  return {
    id: row.id,
    toolId: row.toolId,
    mode: row.mode as PaymentMode,
    targetCount: row.targetCount,
    successCount: row.successCount,
    failureCount: row.failureCount,
    status: row.status,
    notes: safeJsonParse<Record<string, unknown> | null>(row.notes, null),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function ensureSeedData() {
  const existing = db.select({ count: sql<number>`count(*)` }).from(tools).get();
  if ((existing?.count || 0) > 0) {
    return;
  }

  const createdAt = nowIso();
  const sellerId = "seller_arc_relay";

  db.insert(sellers)
    .values({
      id: sellerId,
      name: "Arc Relay Labs",
      tagline: "Micro-monetized tool access for agents.",
      walletLabel: "Seller treasury",
      walletAddress: getConfiguredSellerAddress(),
      createdAt,
    })
    .onConflictDoNothing()
    .run();

  db.insert(tools)
    .values({
      id: "tool_premium_web_fetch",
      slug: "premium-web-fetch",
      name: "Premium Web Fetch",
      description:
        "Fetch a page and return a concise, structured extraction that is useful to an agent or power user.",
      category: "Research",
      status: "active",
      priceUsdc: "0.004",
      sellerId,
      sampleInput: serializeJson({
        url: "demo://arc/agentic-economy",
        goal: "Summarize why per-call pricing matters.",
      }),
      sampleOutput: serializeJson({
        title: demoDocuments["demo://arc/agentic-economy"].title,
        summary: demoDocuments["demo://arc/agentic-economy"].summary,
        bullets: demoDocuments["demo://arc/agentic-economy"].bullets,
        excerpt: demoDocuments["demo://arc/agentic-economy"].excerpt,
        entities: demoDocuments["demo://arc/agentic-economy"].entities,
        sourceType: "demo",
        canonicalUrl: "demo://arc/agentic-economy",
        fetchedAt: createdAt,
      }),
      isFeatured: true,
      createdAt,
    })
    .onConflictDoNothing()
    .run();
}

ensureSeedData();

export async function listTools() {
  return db.select().from(tools).orderBy(desc(tools.isFeatured), tools.name).all().map(mapTool);
}

export async function getFeaturedTool() {
  const row = db.select().from(tools).where(eq(tools.isFeatured, true)).limit(1).get();
  return row ? mapTool(row) : null;
}

export async function getToolByIdOrSlug(value: string) {
  const row =
    db.select().from(tools).where(eq(tools.id, value)).limit(1).get() ||
    db.select().from(tools).where(eq(tools.slug, value)).limit(1).get();
  return row ? mapTool(row) : null;
}

export async function getSeller() {
  const row = db.select().from(sellers).limit(1).get();
  return row ? mapSeller(row) : null;
}

export async function createInvocationRecord(input: {
  toolId: string;
  buyerLabel: string;
  inputPayload: ToolInput;
  priceUsdc: string;
  paymentMode: PaymentMode;
  proofRunId?: string | null;
}) {
  const createdAt = nowIso();
  const row = {
    id: crypto.randomUUID(),
    toolId: input.toolId,
    buyerLabel: input.buyerLabel,
    inputPayload: serializeJson(input.inputPayload),
    outputPayload: null,
    priceUsdc: input.priceUsdc,
    status: "payment_required",
    paymentMode: input.paymentMode,
    paymentChallengeId: null,
    paymentAuthorizationId: null,
    settlementEventId: null,
    proofRunId: input.proofRunId ?? null,
    errorMessage: null,
    createdAt,
    updatedAt: createdAt,
  };

  db.insert(invocations).values(row).run();
  return mapInvocation(row);
}

export async function updateInvocationStatus(
  invocationId: string,
  status: InvocationStatus,
  updates?: Partial<{
    paymentChallengeId: string | null;
    paymentAuthorizationId: string | null;
    settlementEventId: string | null;
    output: ToolOutput | null;
    errorMessage: string | null;
  }>,
) {
  db.update(invocations)
    .set({
      status,
      updatedAt: nowIso(),
      paymentChallengeId: updates?.paymentChallengeId,
      paymentAuthorizationId: updates?.paymentAuthorizationId,
      settlementEventId: updates?.settlementEventId,
      outputPayload: updates?.output ? serializeJson(updates.output) : undefined,
      errorMessage: updates?.errorMessage,
    })
    .where(eq(invocations.id, invocationId))
    .run();

  return getInvocationById(invocationId);
}

export async function getInvocationById(invocationId: string) {
  const row = db.select().from(invocations).where(eq(invocations.id, invocationId)).limit(1).get();
  return row ? mapInvocation(row) : null;
}

export async function listRecentInvocations(limit = 8) {
  return db.select().from(invocations).orderBy(desc(invocations.createdAt)).limit(limit).all().map(mapInvocation);
}

export async function createPaymentChallengeRecord(input: {
  toolId: string;
  invocationId: string;
  amountUsdc: string;
  paymentRequired: PaymentRequiredResponse;
}) {
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 345600 * 1000).toISOString();
  const row = {
    id: crypto.randomUUID(),
    toolId: input.toolId,
    invocationId: input.invocationId,
    amountUsdc: input.amountUsdc,
    currency: "USDC",
    x402Payload: serializeJson(input.paymentRequired),
    expiresAt,
    status: "issued",
    createdAt,
  };

  db.insert(paymentChallenges).values(row).run();
  db.update(invocations)
    .set({
      paymentChallengeId: row.id,
      updatedAt: nowIso(),
    })
    .where(eq(invocations.id, input.invocationId))
    .run();

  return mapChallenge(row);
}

export async function getPaymentChallengeById(challengeId: string) {
  const row = db.select().from(paymentChallenges).where(eq(paymentChallenges.id, challengeId)).limit(1).get();
  return row ? mapChallenge(row) : null;
}

export async function markPaymentChallengeConsumed(challengeId: string) {
  db.update(paymentChallenges).set({ status: "consumed" }).where(eq(paymentChallenges.id, challengeId)).run();
}

export async function createPaymentAuthorizationRecord(input: {
  challengeId: string;
  authorizationType: string;
  paymentPayload: PaymentPayload;
  status: string;
}) {
  const row = {
    id: crypto.randomUUID(),
    challengeId: input.challengeId,
    authorizationType: input.authorizationType,
    proofPayload: serializeJson(input.paymentPayload),
    status: input.status,
    createdAt: nowIso(),
  };

  db.insert(paymentAuthorizations).values(row).run();
  return mapAuthorization(row);
}

export async function createSettlementEventRecord(input: {
  invocationId: string;
  provider: string;
  network: string;
  asset: string;
  amountUsdc: string;
  status: string;
  txHash?: string | null;
  explorerUrl?: string | null;
  batchReference?: string | null;
  rawPayload?: Record<string, unknown>;
}) {
  const row = {
    id: crypto.randomUUID(),
    invocationId: input.invocationId,
    provider: input.provider,
    network: input.network,
    asset: input.asset,
    amountUsdc: input.amountUsdc,
    status: input.status,
    txHash: input.txHash ?? null,
    explorerUrl: input.explorerUrl ?? null,
    batchReference: input.batchReference ?? null,
    rawPayload: input.rawPayload ? serializeJson(input.rawPayload) : null,
    createdAt: nowIso(),
  };

  db.insert(settlementEvents).values(row).run();
  return mapSettlement(row);
}

export async function getSettlementById(settlementId: string) {
  const row = db.select().from(settlementEvents).where(eq(settlementEvents.id, settlementId)).limit(1).get();
  return row ? mapSettlement(row) : null;
}

export async function createProofRun(input: {
  toolId: string;
  mode: PaymentMode;
  targetCount: number;
}) {
  const createdAt = nowIso();
  const row = {
    id: crypto.randomUUID(),
    toolId: input.toolId,
    mode: input.mode,
    targetCount: input.targetCount,
    successCount: 0,
    failureCount: 0,
    status: "running",
    notes: null,
    createdAt,
    updatedAt: createdAt,
  };

  db.insert(proofRuns).values(row).run();
  return mapProofRun(row);
}

export async function updateProofRun(
  proofRunId: string,
  updates: Partial<{
    successCount: number;
    failureCount: number;
    status: string;
    notes: Record<string, unknown> | null;
  }>,
) {
  db.update(proofRuns)
    .set({
      successCount: updates.successCount,
      failureCount: updates.failureCount,
      status: updates.status,
      notes: updates.notes ? serializeJson(updates.notes) : undefined,
      updatedAt: nowIso(),
    })
    .where(eq(proofRuns.id, proofRunId))
    .run();

  const row = db.select().from(proofRuns).where(eq(proofRuns.id, proofRunId)).limit(1).get();
  return row ? mapProofRun(row) : null;
}

export async function listProofRunInvocations(proofRunId: string) {
  return db.select().from(invocations).where(eq(invocations.proofRunId, proofRunId)).orderBy(desc(invocations.createdAt)).all().map(mapInvocation);
}

export async function getLatestProofRun() {
  const row = db.select().from(proofRuns).orderBy(desc(proofRuns.createdAt)).limit(1).get();
  return row ? mapProofRun(row) : null;
}

export async function getSellerSummary(): Promise<SellerSummary | null> {
  const seller = await getSeller();
  if (!seller) {
    return null;
  }

  const allTools = await listTools();
  const allInvocations = await listRecentInvocations(100);
  const byTool = allTools.map((tool) => {
    const matching = allInvocations.filter(
      (invocation) => invocation.toolId === tool.id && invocation.status === "fulfilled",
    );
    const revenue = matching.reduce((sum, invocation) => sum + Number(invocation.priceUsdc), 0);

    return {
      toolId: tool.id,
      toolName: tool.name,
      revenueUsdc: revenue.toFixed(3),
      invocationCount: matching.length,
    };
  });

  const totalRevenue = byTool.reduce((sum, item) => sum + Number(item.revenueUsdc), 0);
  const latestSettlement = db.select().from(settlementEvents).orderBy(desc(settlementEvents.createdAt)).limit(1).get();

  return {
    seller,
    totalRevenueUsdc: totalRevenue.toFixed(3),
    totalInvocations: allInvocations.length,
    fulfilledInvocations: allInvocations.filter((invocation) => invocation.status === "fulfilled").length,
    latestSettlementStatus: latestSettlement?.status || "none",
    byTool,
  };
}

export async function getSellerActivity(limit = 12) {
  const rows = db.select().from(invocations).orderBy(desc(invocations.createdAt)).limit(limit).all();
  return Promise.all(
    rows.map(async (row) => {
      const invocation = mapInvocation(row);
      const tool = await getToolByIdOrSlug(invocation.toolId);
      const settlement = invocation.settlementEventId
        ? await getSettlementById(invocation.settlementEventId)
        : null;

      return {
        invocation,
        tool,
        settlement,
      };
    }),
  );
}

export async function getChallengeForInvocation(invocationId: string) {
  const row = db
    .select()
    .from(paymentChallenges)
    .where(and(eq(paymentChallenges.invocationId, invocationId), eq(paymentChallenges.status, "issued")))
    .orderBy(desc(paymentChallenges.createdAt))
    .limit(1)
    .get();

  return row ? mapChallenge(row) : null;
}
