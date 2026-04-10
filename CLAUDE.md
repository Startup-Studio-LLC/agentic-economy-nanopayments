# CLAUDE.md

You are helping build a hackathon submission for the "Agentic Economy on Arc" event.

## Context

As of April 10, 2026, this repository is being prepared for the Agentic Economy on Arc hackathon running April 20 to April 26, 2026.

The project must demonstrate:
- Real per-action pricing at or below $0.01
- Arc settlement using USDC
- Circle infrastructure relevant to the flow, especially Nanopayments and x402 where available
- A clear reason this business model only works because transaction overhead is low enough for sub-cent economics
- A working demo with visible transaction flow, not just a pitch

The official submission requirements also emphasize:
- A public GitHub repository
- A live demo or hosted app URL
- A short video presentation
- A slide deck
- Clear explanation of which Circle products were used
- A transaction flow demonstration that can be validated through Circle tooling and Arc Explorer
- At least 50 on-chain transactions shown in the demo

## Product Direction

Build a narrow, credible product that makes nanopayments the core primitive rather than decoration.

Working product concept:

ToolMarket Lite: a lightweight marketplace-style app where agents or power users pay per call for premium tools.

Initial focus:
- One buyer flow
- One seller flow
- One fully polished paid tool
- One end-to-end payment loop

Possible first paid tool:
- Premium web fetch and structured extraction

This is a better starting point than a broad platform because it is easy to understand in under 20 seconds and directly demonstrates the economic loop.

## Core Narrative

The app proves that agents and users can buy tool access per action using USDC on Arc through an x402-style payment flow backed by Circle infrastructure.

The narrative must be visible in the product:
1. A buyer selects a useful paid tool
2. The API returns a payment requirement
3. The buyer authorizes payment
4. The tool executes immediately after payment
5. The UI shows fulfillment, seller revenue, and settlement evidence

## Non-Negotiables

- Optimize for demo clarity over architecture purity
- Build one complete loop before adding breadth
- Keep the payment states visible in the UI
- Be explicit about what is real and what is mocked
- Do not make fake claims about production readiness
- Keep copy concrete and business-oriented
- Show why subscriptions or ordinary metering would be worse for this use case

## Technical Direction

Preferred stack:
- Next.js
- TypeScript
- Route handlers for the API
- SQLite for local persistence during the hackathon

Recommended architecture:
- Web app with buyer dashboard and seller dashboard
- Seeded tool catalog instead of full marketplace onboarding
- Payment provider abstraction with two implementations:
  - Demo provider for local development and fallback
  - Circle and Arc provider for real payment flow and settlement evidence
- Persist invocation history, payment state, and settlement references

## Scope Guardrails

Do not spend time on:
- Full authentication
- Complex smart contracts
- DAO, token, or governance mechanics
- Broad marketplace onboarding flows
- Multi-agent orchestration that is not necessary for the demo
- Fancy infra that is invisible to judges

Do spend time on:
- One polished paid action
- A payment log with explicit state transitions
- A seller earnings view
- A simple but sharp UI
- Demo reliability
- Submission assets

## Required UI Language

Use direct labels like:
- Price
- Payment required
- Authorizing
- Paid
- Executing
- Fulfilled
- Settled

Avoid cluttered web3 jargon.

## Working Style

When implementing:
- Keep changes small and testable
- Preserve a working branch at all times
- Prefer shipping over sophistication
- Add demo mode only as a faithful fallback, and label it clearly
- Prioritize visible product behavior over hidden technical complexity

## Expected Deliverables

The repository should end up containing:
- A runnable web app
- A clear README
- A seeded demo flow
- A payment and invocation log
- A seller earnings view
- A script or mechanism to generate repeated paid calls for the 50-plus transaction proof
- Demo notes, video script, and slide outline
