import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";

let sqliteInstance: Database.Database | null = null;

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

function initializeSchema(sqlite: Database.Database) {
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      wallet_label TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      price_usdc TEXT NOT NULL,
      seller_id TEXT NOT NULL REFERENCES sellers(id),
      sample_input TEXT NOT NULL,
      sample_output TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS proof_runs (
      id TEXT PRIMARY KEY,
      tool_id TEXT NOT NULL REFERENCES tools(id),
      mode TEXT NOT NULL,
      target_count INTEGER NOT NULL,
      success_count INTEGER NOT NULL DEFAULT 0,
      failure_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invocations (
      id TEXT PRIMARY KEY,
      tool_id TEXT NOT NULL REFERENCES tools(id),
      buyer_label TEXT NOT NULL,
      input_payload TEXT NOT NULL,
      output_payload TEXT,
      price_usdc TEXT NOT NULL,
      status TEXT NOT NULL,
      payment_mode TEXT NOT NULL,
      payment_challenge_id TEXT,
      payment_authorization_id TEXT,
      settlement_event_id TEXT,
      proof_run_id TEXT REFERENCES proof_runs(id),
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_challenges (
      id TEXT PRIMARY KEY,
      tool_id TEXT NOT NULL REFERENCES tools(id),
      invocation_id TEXT NOT NULL REFERENCES invocations(id),
      amount_usdc TEXT NOT NULL,
      currency TEXT NOT NULL,
      x402_payload TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_authorizations (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL REFERENCES payment_challenges(id),
      authorization_type TEXT NOT NULL,
      proof_payload TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settlement_events (
      id TEXT PRIMARY KEY,
      invocation_id TEXT NOT NULL REFERENCES invocations(id),
      provider TEXT NOT NULL,
      network TEXT NOT NULL,
      asset TEXT NOT NULL,
      amount_usdc TEXT NOT NULL,
      status TEXT NOT NULL,
      tx_hash TEXT,
      explorer_url TEXT,
      batch_reference TEXT,
      raw_payload TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

function createSqlite() {
  const dataDir = ensureDataDirectory();
  const sqlite = new Database(path.join(dataDir, "toolmarket.db"));
  initializeSchema(sqlite);
  return sqlite;
}

export function getSqlite() {
  if (!sqliteInstance) {
    sqliteInstance = createSqlite();
  }

  return sqliteInstance;
}

export const sqlite = getSqlite();
export const db = drizzle(sqlite, { schema });
