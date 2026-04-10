# ToolMarket Lite

ToolMarket Lite is a demo-first marketplace-style app for the Agentic Economy on Arc hackathon. It proves that premium tools can be sold one call at a time in USDC using an x402-style payment loop, with Arc settlement evidence and Circle Gateway batching when real mode is configured.

## Product Summary

The app is intentionally narrow:
- one seeded seller
- one seeded buyer
- one premium paid tool
- one visible `402 -> authorize -> fulfill` loop
- one seller earnings dashboard
- one proof runner for repeated paid calls

The current featured tool is `Premium Web Fetch`, which sells structured extraction of a URL on a per-call basis.

## Why Per-Call Pricing Matters

Subscriptions are a poor fit for:
- infrequent but valuable API calls
- agent-to-agent transactions
- niche tools that users only need occasionally
- micro-commerce where billing overhead can erase margin

ToolMarket Lite makes the economic loop explicit in the UI: price, payment requirement, authorization, fulfillment, seller revenue, and settlement evidence.

## Why Arc Matters

This project is framed around Arc because the hackathon is about economically viable micropayments for AI-native products. Arc's USDC-native fee story and deterministic finality make it easier to defend sub-cent usage pricing.

## How Circle Fits

The app supports two payment modes:

- `demo`: generates a faithful x402-style challenge and authorization shape, then labels settlement as simulated
- `real`: uses Circle Gateway batching primitives from `@circle-fin/x402-batching` with a seeded buyer key

Real mode is only enabled when the required environment variables are present.

## Architecture

- `src/app`: pages and API routes
- `src/components`: product UI
- `src/db/schema.ts`: typed SQLite schema
- `src/lib/payment.ts`: demo and real payment providers
- `src/lib/store.ts`: persistence and aggregate queries
- `src/lib/toolmarket.ts`: shared service layer for invocation flow
- `src/lib/tool-executor.ts`: premium tool execution logic
- `scripts/seed.ts`: seed helper
- `scripts/proof.ts`: proof-run script

## Core Flow

1. Buyer submits tool input.
2. `POST /api/tools/[toolId]/invoke` returns a `402`-style payment requirement.
3. Buyer authorizes payment through `POST /api/payments/authorize`.
4. Buyer retries the invoke call with the payment payload.
5. The server verifies, settles, executes the tool, and persists the result.
6. Seller dashboard and logs update immediately.

## Environment Variables

Copy `.env.example` and fill in the values you need.

Required for demo mode:
- `DEFAULT_PAYMENT_MODE`
- `TOOLMARKET_SELLER_ADDRESS`

Required for real mode:
- `CIRCLE_GATEWAY_URL`
- `CIRCLE_CHAIN`
- `CIRCLE_BUYER_PRIVATE_KEY`
- `TOOLMARKET_SELLER_ADDRESS`
- `ARC_EXPLORER_TX_BASE`

## Local Setup

```bash
npm install
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run lint
npm run test
npm run build
npm run proof:run demo 10
```

The proof command runs repeated paid calls against the seeded tool without using the web UI.

## Demo Mode vs Real Mode

### Demo Mode

- default when real credentials are missing
- deterministic and presentation-safe
- uses built-in demo URLs like `demo://arc/agentic-economy`
- settlement is marked `simulated`

### Real Mode

- enabled by selecting `real` in the header when config is present
- uses Circle Gateway batching types and a server-managed seeded buyer
- records explorer links and settlement references
- designed for hackathon proof gathering

## Proof Generation

The hackathon asks for 50-plus transactions in the demo. There are two ways to produce those:

- UI: open `/proof` and run a batch
- CLI: run `npm run proof:run demo 50`

In real mode, make sure the seeded buyer is funded before running large proof batches.

## Manual Verification

Before recording a demo:

1. Open `/` and confirm the tool price is visible.
2. Run a paid invocation with `demo://arc/agentic-economy`.
3. Confirm the payment challenge appears.
4. Authorize and confirm the tool result appears.
5. Open `/seller` and confirm revenue updates.
6. Open `/proof` and run a small batch.

## Submission Assets

See:
- `docs/submission/demo-script.md`
- `docs/submission/slide-deck-outline.md`
- `docs/submission/product-feedback.md`

## Current Scope

This repo intentionally does not include:
- authentication
- open seller onboarding
- multiple tools beyond the core proof point
- custom smart contracts
- generic agent framework plumbing

The goal is a sharp demo, not a broad platform.
