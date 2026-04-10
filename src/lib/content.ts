import { getConfiguredSellerAddress } from "@/lib/env";

export const siteCopy = {
  productName: "ToolMarket Lite",
  heroTitle: "Premium tools, sold one call at a time.",
  heroSubtitle:
    "Agents and power users pay sub-cent USDC prices only when a tool runs. The payment loop is visible, immediate, and built for Arc.",
  whyItMatters:
    "Subscriptions are clumsy for sporadic, high-value actions. Per-call pricing lets a seller monetize one useful capability without forcing prepaid bundles or monthly plans.",
  whyArc:
    "Arc keeps the payment story clean for judges: USDC-native fees, deterministic finality, and stable economics for tiny transactions.",
  sellerNarrative:
    "The seller gets paid when the tool delivers value, not when a user commits to a plan.",
  sellerAddress: getConfiguredSellerAddress(),
};

export const primaryNav = [
  { href: "/", label: "Buyer" },
  { href: "/seller", label: "Seller" },
  { href: "/proof", label: "Proof" },
  { href: "/about", label: "About" },
];
