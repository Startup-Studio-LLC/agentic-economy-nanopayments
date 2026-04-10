import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sellers = sqliteTable("sellers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  walletLabel: text("wallet_label").notNull(),
  walletAddress: text("wallet_address").notNull(),
  createdAt: text("created_at").notNull(),
});

export const tools = sqliteTable("tools", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  priceUsdc: text("price_usdc").notNull(),
  sellerId: text("seller_id")
    .notNull()
    .references(() => sellers.id),
  sampleInput: text("sample_input").notNull(),
  sampleOutput: text("sample_output").notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const proofRuns = sqliteTable("proof_runs", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => tools.id),
  mode: text("mode").notNull(),
  targetCount: integer("target_count").notNull(),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const invocations = sqliteTable("invocations", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => tools.id),
  buyerLabel: text("buyer_label").notNull(),
  inputPayload: text("input_payload").notNull(),
  outputPayload: text("output_payload"),
  priceUsdc: text("price_usdc").notNull(),
  status: text("status").notNull(),
  paymentMode: text("payment_mode").notNull(),
  paymentChallengeId: text("payment_challenge_id"),
  paymentAuthorizationId: text("payment_authorization_id"),
  settlementEventId: text("settlement_event_id"),
  proofRunId: text("proof_run_id").references(() => proofRuns.id),
  errorMessage: text("error_message"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const paymentChallenges = sqliteTable("payment_challenges", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => tools.id),
  invocationId: text("invocation_id")
    .notNull()
    .references(() => invocations.id),
  amountUsdc: text("amount_usdc").notNull(),
  currency: text("currency").notNull(),
  x402Payload: text("x402_payload").notNull(),
  expiresAt: text("expires_at").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const paymentAuthorizations = sqliteTable("payment_authorizations", {
  id: text("id").primaryKey(),
  challengeId: text("challenge_id")
    .notNull()
    .references(() => paymentChallenges.id),
  authorizationType: text("authorization_type").notNull(),
  proofPayload: text("proof_payload").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const settlementEvents = sqliteTable("settlement_events", {
  id: text("id").primaryKey(),
  invocationId: text("invocation_id")
    .notNull()
    .references(() => invocations.id),
  provider: text("provider").notNull(),
  network: text("network").notNull(),
  asset: text("asset").notNull(),
  amountUsdc: text("amount_usdc").notNull(),
  status: text("status").notNull(),
  txHash: text("tx_hash"),
  explorerUrl: text("explorer_url"),
  batchReference: text("batch_reference"),
  rawPayload: text("raw_payload"),
  createdAt: text("created_at").notNull(),
});
