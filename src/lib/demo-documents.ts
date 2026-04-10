export const demoDocuments: Record<
  string,
  {
    title: string;
    summary: string;
    bullets: string[];
    excerpt: string;
    entities: string[];
  }
> = {
  "demo://arc/agentic-economy": {
    title: "Agentic Economy on Arc",
    summary:
      "A synthetic demo page describing why AI-native products need per-action payments instead of subscriptions. It focuses on low-overhead settlement, visible payment loops, and API monetization.",
    bullets: [
      "Per-call pricing makes machine-to-machine commerce legible.",
      "Tiny payments are only viable when settlement overhead stays low.",
      "Judges need to see price, authorization, fulfillment, and settlement on one screen.",
    ],
    excerpt:
      "This demo page exists so ToolMarket Lite can prove the payment loop reliably even without reaching external websites during a live presentation.",
    entities: ["Arc", "USDC", "Circle Gateway", "x402"],
  },
  "demo://arc/circle-gateway": {
    title: "Circle Gateway Nanopayments",
    summary:
      "A synthetic explanation of how a paid endpoint can return a payment requirement, accept an authorization, and settle later through Gateway batching.",
    bullets: [
      "The seller exposes a protected resource.",
      "The buyer signs a payment authorization.",
      "Settlement can be deferred while the response stays fast.",
    ],
    excerpt:
      "The point is not just making a payment. The point is reducing latency and preserving margin for sub-cent usage.",
    entities: ["Gateway", "Batched Settlement", "Authorization", "Verification"],
  },
  "demo://arc/policy-check": {
    title: "Policy Check Brief",
    summary:
      "A synthetic report that simulates a premium compliance and policy scan sold one call at a time.",
    bullets: [
      "Small but high-value API calls do not fit monthly plans well.",
      "A visible payment challenge turns billing into product behavior.",
      "A seller dashboard proves the revenue loop instantly.",
    ],
    excerpt:
      "The report is intentionally deterministic so proof runs can generate many transactions quickly without depending on third-party uptime.",
    entities: ["Policy", "Revenue", "Proof Run", "Seller Dashboard"],
  },
};

export const proofRunInputs = Object.keys(demoDocuments).map((url, index) => ({
  url,
  goal: [
    "Summarize the revenue model.",
    "Extract why pay-per-call matters.",
    "Capture settlement-relevant details.",
  ][index % 3],
}));
