# PLAN.md

## Executive Summary

Build `ToolMarket Lite`, a narrow, demo-first web app that proves agents and power users can pay for premium tools per call using USDC on Arc through an x402-style payment flow backed by Circle infrastructure.

This is not a full marketplace. It is a focused product demo with one undeniable workflow:
- A buyer picks a useful paid tool
- The backend returns a payment requirement
- The buyer authorizes payment
- The tool executes immediately after payment
- The UI shows result, seller revenue, payment state, and settlement evidence

The plan is optimized for the Agentic Economy on Arc hackathon requirements captured in [CLAUDE.md](C:/Users/majin/agentic-economy-nanopayments/CLAUDE.md).

## One-Sentence Pitch

Agents buy premium tool access per call in USDC on Arc, making sub-cent monetization viable for APIs, automation, and machine-to-machine commerce.

## Why This Product

The hackathon is explicitly about economically viable per-action payments. The strongest product is the one where payments are not a billing afterthought but the core economic primitive.

`ToolMarket Lite` is the best wedge because:
- It fits the official agent-to-agent, API monetization, and micro-commerce tracks
- It naturally uses x402-style protected endpoints
- The value exchange is obvious in one screen
- It creates a credible business story judges can repeat
- It can start narrow and still feel investable

## Product Strategy

### Problem

Today, most APIs and AI tools are monetized through subscriptions, prepaid credits, or monthly contracts. That works poorly for:
- infrequent but high-value requests
- agent-to-agent transactions
- automated workflows with variable usage
- small sellers who want to monetize one useful capability

Traditional onchain payment overhead can also destroy the unit economics of very small transactions.

### Core Thesis

If Arc settlement plus Circle infrastructure make sub-cent transactions economically viable, then tool access can be sold per interaction instead of through subscriptions or coarse credit systems.

### Target Users

Primary:
- agent builders who want to buy premium actions on demand
- power users who want to pay for one useful result instead of a plan

Secondary:
- API providers or solo builders who want to monetize one premium tool without building a full billing system

### Product Wedge

First tool:
- premium web fetch and structured extraction

Why this first:
- easy to explain
- easy to demo
- clearly valuable
- naturally priced per request
- fits a protected endpoint well

Potential second tool only after the first is polished:
- OCR and field extraction
- structured data enrichment
- compliance or verification lookup

## What The MVP Includes

- One buyer dashboard
- One seller dashboard
- One seeded seller persona
- One seeded buyer persona
- One premium paid tool
- One visible end-to-end payment loop
- A payment log
- A seller earnings view
- A mode switch that clearly distinguishes `demo` from `real`
- A mechanism to generate repeated paid calls for the 50-plus transaction proof

## What The MVP Excludes

- user accounts
- open seller onboarding
- arbitrary tool publishing
- wallet management for many users
- broad search and discovery
- generic agent frameworks
- custom contracts unless they directly improve the demo
- cross-chain support
- tokenomics or DAO mechanics

## Stretch Goals

Only consider these if the core loop is complete and reliable:
- second paid tool
- usage analytics card
- rate limits or buyer rules
- approval threshold for larger payments
- seller tool detail page
- hosted deployment polish

## Success Criteria

The product is successful when all of the following are true:
- A user can trigger a paid tool call from the UI
- The first request returns a 402-style payment requirement
- The client authorizes payment and retries automatically
- The tool returns a useful result immediately after payment
- Seller revenue updates in the UI
- Payment and invocation history are persisted
- The UI shows explicit payment states
- Demo mode is clearly labeled
- Real mode can show Arc-linked settlement evidence
- The demo can support at least 50 on-chain transactions

## Judge-Facing Story

Judges should understand the app in under 20 seconds:

`This tool is useful.`

`It costs less than a cent per call.`

`You only pay when you use it.`

`That only works because settlement overhead is low enough to preserve margin.`

`Arc and Circle make that viable.`

Everything in the app should reinforce that story.

## User Flows

### Buyer Flow

1. Buyer lands on the main dashboard and sees one featured paid tool.
2. Buyer sees the tool description, per-call price, and why pay-per-use matters.
3. Buyer enters input and clicks the primary CTA.
4. Backend returns a payment requirement with a clear 402-style payload.
5. UI changes to `Payment required`.
6. Buyer authorizes payment.
7. Client retries the request with payment proof.
8. Backend verifies the authorization and executes the tool.
9. UI updates through `Authorizing`, `Paid`, `Executing`, and `Fulfilled`.
10. Buyer sees the result, invocation log entry, and settlement status.

### Seller Flow

1. Seller opens the seller dashboard.
2. Seller sees total revenue, revenue by tool, recent invocations, and payment states.
3. Seller can inspect a recent paid call with price, buyer, status, and settlement reference.
4. Seller can explain the revenue model with one sentence in the UI.

### Judge Flow

1. Open the app.
2. Understand the use case immediately.
3. Run one paid call.
4. See the payment challenge.
5. See successful fulfillment after authorization.
6. Switch to seller view.
7. See revenue and event history update.
8. Open settlement evidence or explorer references.
9. Observe a burst of repeated transactions to prove frequency and economics.

## Screens And Routes

### App Routes

- `/`
  - buyer dashboard
  - featured tool card
  - tool input
  - invoke CTA
  - payment status panel
  - recent invocations

- `/seller`
  - seller overview
  - earnings summary
  - per-tool revenue
  - recent paid calls
  - settlement status table

- `/tools/[slug]`
  - dedicated tool detail page
  - explanation of the use case
  - price and output example
  - invoke panel

- `/proof`
  - transaction burst runner
  - proof summary
  - counts by status
  - links to settlement evidence

- `/about`
  - plain-language explanation of why per-call payments matter
  - why Arc and Circle are used
  - what is real versus demo mode

### API Routes

- `GET /api/tools`
  - return seeded tools

- `GET /api/tools/[toolId]`
  - return one tool

- `POST /api/tools/[toolId]/invoke`
  - first request returns payment requirement if payment proof is missing
  - retried request verifies proof and executes the tool

- `POST /api/payments/authorize`
  - create or simulate payment authorization

- `GET /api/invocations`
  - recent invocation history

- `GET /api/seller/summary`
  - seller totals and charts

- `GET /api/seller/activity`
  - seller event stream

- `POST /api/proof/run`
  - generate repeated paid calls

- `GET /api/proof/status`
  - proof run status and counts

## Functional Requirements

### Core Product Requirements

- The app must show at least one premium tool with a sub-cent price.
- The app must show visible state transitions for payment and execution.
- The app must persist payment attempts and invocation outcomes.
- The app must show a seller-facing earnings view.
- The app must support a demo fallback when real integration is unavailable.
- The app must label mocked behavior honestly.

### Hackathon Requirements Mapped To Product

- Real per-action pricing at or below $0.01
  - every tool must display a per-call price in USDC

- Arc settlement using USDC
  - real provider must persist Arc settlement references

- 50-plus on-chain transactions in the demo
  - proof page or script must generate repeated paid calls and log the results

- Video proof through Circle tooling and Arc Explorer
  - the product must expose transaction identifiers and supporting evidence cleanly

## Non-Functional Requirements

- App must run locally with one command sequence.
- Core flow must be understandable without narration.
- UI copy must avoid vague web3 language.
- Failure states must be visible and graceful.
- Demo mode must be deterministic enough for live presentations.
- The app must remain usable on laptop-size screens and mobile.

## Technical Architecture

### Stack

- Next.js with App Router
- TypeScript everywhere
- SQLite for local persistence
- Drizzle ORM or equivalent lightweight typed ORM
- Tailwind CSS plus custom tokens for a strong visual identity

### Why This Stack

- fast to scaffold
- easy to host
- route handlers can serve both UI and API needs
- SQLite is enough for a hackathon and easy to inspect
- typed schema reduces avoidable bugs

### Runtime Structure

- `app/`
  - pages and layout

- `components/`
  - tool card
  - payment state panel
  - earnings cards
  - activity tables

- `lib/`
  - database
  - payment provider interface
  - demo provider
  - real provider
  - tool execution logic
  - seed data
  - copy constants

- `db/`
  - schema
  - migrations

- `scripts/`
  - seed
  - proof generator

## Data Model

### Tool

Fields:
- `id`
- `slug`
- `name`
- `description`
- `price_usdc`
- `category`
- `status`
- `seller_id`
- `sample_input`
- `sample_output`
- `is_featured`
- `created_at`

### Seller

Fields:
- `id`
- `name`
- `tagline`
- `wallet_label`
- `created_at`

### Invocation

Fields:
- `id`
- `tool_id`
- `buyer_label`
- `input_payload`
- `output_payload`
- `price_usdc`
- `status`
- `payment_mode`
- `payment_challenge_id`
- `payment_authorization_id`
- `settlement_event_id`
- `error_message`
- `created_at`
- `updated_at`

Statuses:
- `payment_required`
- `authorizing`
- `paid`
- `executing`
- `fulfilled`
- `failed`

### PaymentChallenge

Fields:
- `id`
- `tool_id`
- `invocation_id`
- `amount_usdc`
- `currency`
- `x402_payload`
- `expires_at`
- `status`
- `created_at`

Statuses:
- `issued`
- `expired`
- `consumed`

### PaymentAuthorization

Fields:
- `id`
- `challenge_id`
- `authorization_type`
- `proof_payload`
- `status`
- `created_at`

Statuses:
- `pending`
- `verified`
- `rejected`

### SettlementEvent

Fields:
- `id`
- `invocation_id`
- `provider`
- `network`
- `asset`
- `amount_usdc`
- `status`
- `tx_hash`
- `explorer_url`
- `batch_reference`
- `created_at`

Statuses:
- `simulated`
- `submitted`
- `confirmed`
- `failed`

## Payment Architecture

### Core Principle

The payment flow must be abstracted behind a provider interface so the app can ship quickly in demo mode and later swap in a real Circle and Arc implementation without rewriting the UI or core business logic.

### Provider Interface

The payment provider should expose functions equivalent to:
- `createChallenge`
- `authorizePayment`
- `verifyAuthorization`
- `recordSettlement`
- `getSettlementEvidence`

### Demo Provider

Behavior:
- generates a 402-style challenge payload
- simulates authorization
- marks settlement as simulated
- creates deterministic proof objects for the UI

Purpose:
- local development
- live demo fallback
- flow validation before real integration

### Real Provider

Behavior:
- emits a real x402-style payment requirement
- verifies payment authorization using Circle-compatible flow
- records Arc settlement references
- stores transaction hashes and explorer links

Purpose:
- satisfy real proof requirements
- support the hackathon submission video and transaction evidence

## 402-Style Interaction Design

### Initial Request

Client sends tool input to `POST /api/tools/[toolId]/invoke`.

If proof is missing:
- server creates an `Invocation`
- server creates a `PaymentChallenge`
- server returns HTTP `402` or an equivalent structured response if local tooling requires a wrapped response

Response should include:
- tool id
- invocation id
- amount
- currency
- payment method details
- challenge id
- expiration
- message suitable for the UI

### Authorization Step

Client sends the challenge to `POST /api/payments/authorize`.

Server returns:
- authorization id
- proof payload or receipt
- authorization status

### Retry Step

Client retries the original invoke request with the proof payload.

Server:
- verifies the proof
- updates payment status
- executes the tool
- returns the result
- records settlement evidence

## Tool Execution Plan

### MVP Tool: Premium Web Fetch And Structured Extraction

Input:
- URL
- optional extraction goal

Output:
- page title
- summary
- structured bullets
- important entities or metadata

Paid value proposition:
- cleaner result than a raw fetch
- useful for agents
- easy to understand
- easy to compare before and after payment

### Execution Strategy

For MVP:
- use deterministic extraction logic that is stable for demo purposes
- optionally use a fetch-plus-parser pipeline
- cache results when helpful but keep invocation logs distinct

## UI Plan

### Design Direction

The interface should feel like a product, not a generic admin dashboard.

Visual principles:
- bold typography
- clean spacing
- visible pricing
- obvious state changes
- warm, high-contrast palette
- subtle depth and motion

### Home Screen

Must show:
- headline that explains the value in one sentence
- featured tool card
- per-call price
- primary CTA
- economic explanation panel
- recent invocation list

### Seller Screen

Must show:
- total revenue
- revenue per tool
- recent invocations
- payment state chips
- settlement evidence links

### Proof Screen

Must show:
- total transaction count
- confirmed versus simulated
- proof run status
- links to explorer entries when in real mode

## Copy Plan

All copy should answer four questions:
- what is being sold
- who pays
- why pay-per-call matters
- why Arc and Circle are required

Example messaging direction:
- `Pay 0.004 USDC only when the tool runs.`
- `No subscription. No prepaid bundle. One useful result per call.`
- `This pricing works because settlement overhead stays low enough to preserve margin.`

## Build Phases

### Phase 0: Repository Bootstrap

Objective:
- create the app foundation without adding feature noise

Tasks:
- initialize Next.js app
- add TypeScript, linting, formatting, and Tailwind
- add database library and migration setup
- create `.env.example`
- add root README placeholder

Deliverables:
- runnable app shell
- working local dev command

Exit criteria:
- app starts locally
- no broken default pages
- database can be created and seeded

### Phase 1: Data And Seed Layer

Objective:
- lock the schema before UI and route logic spread

Tasks:
- create schema for seller, tool, invocation, payment challenge, payment authorization, settlement event
- add seed script for one seller and one featured tool
- add repository helpers and typed queries

Deliverables:
- seedable database
- typed models

Exit criteria:
- local DB can be reset and re-seeded
- tool catalog returns expected data

### Phase 2: Buyer Experience

Objective:
- make the product understandable and interactive from the landing page

Tasks:
- build buyer dashboard
- build tool card and invoke form
- add recent invocation list
- add payment state panel
- add copy blocks explaining pricing and economics

Deliverables:
- functional buyer-facing UI

Exit criteria:
- a user can discover the tool and attempt a paid call from the main screen

### Phase 3: Paid Endpoint Flow

Objective:
- implement the actual product loop

Tasks:
- implement `POST /api/tools/[toolId]/invoke`
- implement challenge creation
- implement authorization route
- implement retry behavior
- persist all state transitions
- handle failures and expired challenges

Deliverables:
- working 402-style flow in demo mode

Exit criteria:
- one tool completes the full `payment required -> paid -> fulfilled` path

### Phase 4: Seller Dashboard And Activity

Objective:
- make the economic loop visible from the seller side

Tasks:
- build seller summary cards
- build revenue breakdown
- build invocation and settlement table
- expose seller summary APIs

Deliverables:
- seller dashboard

Exit criteria:
- after a paid invocation, seller revenue and activity update immediately

### Phase 5: Real Provider Integration

Objective:
- replace narrative-only settlement with credible evidence

Tasks:
- implement real provider adapter
- store transaction hashes and explorer links
- add environment switch between demo and real mode
- add configuration validation

Deliverables:
- working provider abstraction
- real settlement evidence path

Exit criteria:
- the app can produce verifiable settlement references in real mode

### Phase 6: Proof Generator

Objective:
- support the 50-plus transaction requirement early, not at the end

Tasks:
- add proof page or script to run repeated paid invocations
- persist all results
- display counts by status
- expose transaction evidence cleanly

Deliverables:
- repeatable proof mechanism

Exit criteria:
- a single command or page interaction can generate a large batch of paid calls

### Phase 7: Submission Assets

Objective:
- package the product for judging

Tasks:
- write final README
- write demo notes
- write 90-second video script
- create 6-slide deck outline
- prepare cover image requirements
- prepare Circle product feedback draft

Deliverables:
- submission-ready collateral

Exit criteria:
- the story can be presented clearly without improvisation

## Detailed Task Breakdown

### Immediate Coding Order

1. Bootstrap the Next.js app.
2. Add the database and seed data.
3. Build the buyer dashboard.
4. Implement the demo payment provider.
5. Implement the paid invoke route.
6. Implement the authorize and retry loop.
7. Add seller metrics and activity.
8. Add proof generation.
9. Add real provider integration.
10. Finalize documentation and demo assets.

### Cut Order If Time Gets Tight

If schedule pressure rises, cut in this order:
1. second tool
2. advanced analytics
3. extra pages
4. visual polish beyond clarity
5. anything not visible in the demo

Do not cut:
- payment loop
- seller earnings visibility
- settlement evidence path
- proof generation
- clear business explanation

## Dates And Delivery Schedule

### Pre-Hackathon: April 10 to April 19, 2026

Goals:
- lock scope
- scaffold project
- implement demo provider
- finish the UI and local flow before the event starts
- start exploring real integration constraints early

### Build Window: April 20 to April 25, 2026

#### April 20, 2026
- freeze concept
- ensure app shell and DB are working
- confirm the featured tool and price

#### April 21, 2026
- finish end-to-end demo payment flow
- ensure all payment states render correctly

#### April 22, 2026
- finish seller dashboard
- polish invocation logs and result rendering

#### April 23, 2026
- wire real provider as far as possible
- start collecting settlement evidence
- build proof generation path

#### April 24, 2026
- run transaction batches
- capture screenshots
- write README and draft demo script

#### April 25, 2026
- record video
- prepare slide deck
- rehearse judge flow
- finalize submission copy and product feedback

### Finale: April 25 to April 26, 2026

Goals:
- bug fixing only
- no new features
- stable demo environment
- final polish for live explanation

## Verification Plan

### Manual Verification

Before each demo, verify:
- home page loads cleanly
- tool price is visible
- first invoke returns payment requirement
- authorize step completes
- retry executes the tool
- result is visible and understandable
- seller dashboard updates
- settlement status appears
- proof page runs

### Automated Verification

Keep tests narrow and high value:
- schema and seed tests
- payment provider tests
- invoke route tests
- retry flow tests
- seller summary aggregation tests

### Demo Reliability Measures

- seed deterministic tool data
- keep demo inputs ready
- keep a local fallback mode
- reduce dependence on brittle external services during the live flow

## Deployment Plan

### Local

- SQLite file in repo-local storage
- seeded data script
- environment-based mode switch

### Hosted

Preferred shape:
- Vercel or equivalent for the app
- managed SQLite-compatible or lightweight hosted database if needed

Requirement:
- hosted deployment must preserve the same demo flow as local

## README Plan

The final README must contain:
- problem statement
- product summary
- why per-call pricing matters
- why Arc matters
- how Circle infrastructure fits
- architecture overview
- setup instructions
- environment variables
- demo mode versus real mode explanation
- proof generation instructions
- future work

## Demo Script Plan

### 90-Second Narrative

1. State the problem with subscriptions and billing overhead.
2. Show the featured tool and its sub-cent price.
3. Trigger a paid request and display the payment requirement.
4. Authorize payment and show immediate fulfillment.
5. Switch to seller view and show revenue update.
6. Show settlement evidence and proof volume.
7. Close with why this model is only viable because overhead stays low.

## Slide Deck Plan

Six-slide structure:
- problem
- product
- payment flow
- why Arc and Circle
- business value
- proof and next steps

## Circle Product Feedback Plan

Prepare notes during development so the final submission feedback is detailed:
- which products were used
- why each product was chosen
- where developer experience was strong
- where integration friction appeared
- what would improve builder velocity

## Risk Register

### Risk: Real Integration Takes Too Long

Impact:
- product looks simulated rather than proven

Mitigation:
- build provider abstraction first
- keep demo mode faithful
- start proof integration early

### Risk: Product Scope Bloats

Impact:
- weak demo, unfinished core loop

Mitigation:
- treat every new feature as guilty until justified
- finish one tool completely first

### Risk: UI Looks Generic

Impact:
- weaker judge impression

Mitigation:
- design around one strong hero flow
- emphasize price and state changes visually

### Risk: Demo Breaks Live

Impact:
- loss of judge trust

Mitigation:
- deterministic demo inputs
- local fallback mode
- pre-run sanity checklist

### Risk: Economic Story Is Unclear

Impact:
- judges do not believe nanopayments are necessary

Mitigation:
- include plain-language unit economics explanation on-screen
- show the exact per-call price
- explain why ordinary gas costs break the model

## Definition Of Done

The project is done when:
- the app is runnable locally and in a hosted environment
- one paid tool call works end to end
- payment states are visible and persisted
- seller earnings update after each paid call
- settlement evidence is available in real mode
- proof generation can support the transaction-count requirement
- README and submission materials are ready
- the product can be demoed confidently in under two minutes

## Immediate Next Step

Start implementation at Phase 0 and Phase 1:
- scaffold the Next.js app
- add the database layer
- seed one seller and one paid tool
- create the buyer and seller shells

No additional planning should be needed before coding unless the chosen paid tool changes.
