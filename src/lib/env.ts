import type { SupportedChainName } from "@circle-fin/x402-batching/client";

export type PaymentMode = "demo" | "real";

export const PAYMENT_MODE_COOKIE = "toolmarket-mode";

export function getDefaultBuyerLabel() {
  return process.env.TOOLMARKET_DEFAULT_BUYER_LABEL || "Seeded Buyer Agent";
}

export function getConfiguredSellerAddress() {
  return process.env.TOOLMARKET_SELLER_ADDRESS || "0x1111111111111111111111111111111111111111";
}

export function getExplorerBaseUrl() {
  return process.env.ARC_EXPLORER_TX_BASE || "https://testnet.arcscan.app/tx/";
}

export function getRealProviderConfig() {
  return {
    gatewayUrl: process.env.CIRCLE_GATEWAY_URL || "https://gateway.circle.com",
    chain: (process.env.CIRCLE_CHAIN || "arcTestnet") as SupportedChainName,
    rpcUrl: process.env.CIRCLE_RPC_URL || undefined,
    buyerPrivateKey: process.env.CIRCLE_BUYER_PRIVATE_KEY || "",
    sellerAddress: getConfiguredSellerAddress(),
    explorerBaseUrl: getExplorerBaseUrl(),
  };
}

export function getRealProviderReadiness() {
  const config = getRealProviderConfig();
  const missing: string[] = [];

  if (!config.buyerPrivateKey) {
    missing.push("CIRCLE_BUYER_PRIVATE_KEY");
  }

  if (!config.sellerAddress) {
    missing.push("TOOLMARKET_SELLER_ADDRESS");
  }

  return {
    available: missing.length === 0,
    missing,
    config,
  };
}

export async function getRequestedModeFromCookies() {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return store.get(PAYMENT_MODE_COOKIE)?.value;
}

export function resolvePaymentMode(requestedMode?: string | null): PaymentMode {
  const defaultMode = process.env.DEFAULT_PAYMENT_MODE === "real" ? "real" : "demo";
  const readiness = getRealProviderReadiness();

  if (requestedMode === "real" && readiness.available) {
    return "real";
  }

  if (requestedMode === "demo") {
    return "demo";
  }

  if (defaultMode === "real" && readiness.available) {
    return "real";
  }

  return "demo";
}
