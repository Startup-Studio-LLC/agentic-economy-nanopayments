import {
  BatchEvmScheme,
  CHAIN_CONFIGS,
  type SupportedChainName,
} from "@circle-fin/x402-batching/client";
import { BatchFacilitatorClient } from "@circle-fin/x402-batching/server";
import { privateKeyToAccount } from "viem/accounts";
import { getExplorerBaseUrl, getRealProviderConfig, getRealProviderReadiness, type PaymentMode } from "@/lib/env";
import { decimalUsdcToAtomic, nowIso } from "@/lib/utils";

export interface PaymentRequirement {
  scheme: string;
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

export interface PaymentRequiredResponse {
  x402Version: 2;
  error?: string;
  resource: {
    url: string;
    description: string;
    mimeType: string;
  };
  accepts: PaymentRequirement[];
  extensions?: Record<string, unknown>;
}

export interface PaymentPayload {
  x402Version: 2;
  resource?: {
    url: string;
    description: string;
    mimeType: string;
  };
  accepted: PaymentRequirement;
  payload: unknown;
  extensions?: Record<string, unknown>;
}

export interface CreateChallengeInput {
  invocationId: string;
  toolId: string;
  toolName: string;
  priceUsdc: string;
  resourceUrl: string;
}

export interface AuthorizationResult {
  authorizationType: string;
  paymentPayload: PaymentPayload;
  payer?: string;
  rawPayload?: Record<string, unknown>;
}

export interface SettlementResult {
  provider: string;
  network: string;
  asset: string;
  amountUsdc: string;
  status: "simulated" | "submitted" | "confirmed" | "failed";
  txHash?: string;
  explorerUrl?: string;
  batchReference?: string;
  payer?: string;
  rawPayload?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly mode: PaymentMode;
  readonly label: string;
  readonly capabilities: {
    real: boolean;
    configured: boolean;
    notes: string[];
  };
  createChallenge(input: CreateChallengeInput): Promise<PaymentRequiredResponse>;
  authorize(challenge: PaymentRequiredResponse): Promise<AuthorizationResult>;
  verifyAndSettle(challenge: PaymentRequiredResponse, paymentPayload: PaymentPayload): Promise<SettlementResult>;
}

function buildDemoRequirement(input: CreateChallengeInput): PaymentRequirement {
  return {
    scheme: "exact",
    network: "eip155:5042002",
    amount: decimalUsdcToAtomic(input.priceUsdc),
    asset: "USDC",
    payTo: "0x1111111111111111111111111111111111111111",
    maxTimeoutSeconds: 345600,
    extra: {
      name: "GatewayWalletBatched",
      version: "1",
      challengeId: input.invocationId,
      mode: "demo",
      note: "Demo mode mirrors the x402 shape but does not settle onchain.",
    },
  };
}

class DemoPaymentProvider implements PaymentProvider {
  readonly mode = "demo" as const;
  readonly label = "Demo x402 Provider";
  readonly capabilities = {
    real: false,
    configured: true,
    notes: [
      "Produces a faithful 402-style challenge and signed payload shape.",
      "Settlement is simulated and clearly labeled in the UI.",
    ],
  };

  async createChallenge(input: CreateChallengeInput): Promise<PaymentRequiredResponse> {
    return {
      x402Version: 2,
      resource: {
        url: input.resourceUrl,
        description: `Pay to execute ${input.toolName}`,
        mimeType: "application/json",
      },
      accepts: [buildDemoRequirement(input)],
      extensions: {
        mode: "demo",
        issuedAt: nowIso(),
      },
    };
  }

  async authorize(challenge: PaymentRequiredResponse): Promise<AuthorizationResult> {
    return {
      authorizationType: "demo-batch-authorization",
      paymentPayload: {
        x402Version: 2,
        resource: challenge.resource,
        accepted: challenge.accepts[0],
        payload: {
          type: "demo-transfer-with-authorization",
          demoAuthorizationId: crypto.randomUUID(),
          validAfter: nowIso(),
          validBefore: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          signature: `demo_sig_${crypto.randomUUID().replaceAll("-", "")}`,
        },
        extensions: {
          mode: "demo",
        },
      },
      payer: "0x2222222222222222222222222222222222222222",
      rawPayload: {
        settledBy: "demo-provider",
      },
    };
  }

  async verifyAndSettle(
    challenge: PaymentRequiredResponse,
    paymentPayload: PaymentPayload,
  ): Promise<SettlementResult> {
    const accepted = challenge.accepts[0];

    if (paymentPayload.accepted.amount !== accepted.amount) {
      throw new Error("The demo payment payload amount does not match the challenge.");
    }

    const txHash = `demo_${crypto.randomUUID().replaceAll("-", "")}`;

    return {
      provider: this.label,
      network: accepted.network,
      asset: accepted.asset,
      amountUsdc: accepted.amount,
      status: "simulated",
      txHash,
      explorerUrl: `${getExplorerBaseUrl()}${txHash}`,
      batchReference: `demo_batch_${crypto.randomUUID().slice(0, 8)}`,
      payer: "0x2222222222222222222222222222222222222222",
      rawPayload: {
        note: "Simulated settlement",
      },
    };
  }
}

class RealPaymentProvider implements PaymentProvider {
  readonly mode = "real" as const;
  readonly label = "Circle Gateway Provider";
  readonly capabilities = (() => {
    const readiness = getRealProviderReadiness();
    return {
      real: true,
      configured: readiness.available,
      notes: readiness.available
        ? ["Uses Circle Gateway batching with a seeded buyer key."]
        : readiness.missing.map((item) => `Missing ${item}`),
    };
  })();

  private readonly config = getRealProviderConfig();
  private readonly facilitator = new BatchFacilitatorClient({
    url: this.config.gatewayUrl,
  });

  private getChainConfig() {
    return CHAIN_CONFIGS[this.config.chain as SupportedChainName];
  }

  private getRequirementBase(input: CreateChallengeInput): PaymentRequirement {
    const chainConfig = this.getChainConfig();
    return {
      scheme: "exact",
      network: `eip155:${chainConfig.chain.id}`,
      amount: decimalUsdcToAtomic(input.priceUsdc),
      asset: chainConfig.usdc,
      payTo: this.config.sellerAddress,
      maxTimeoutSeconds: 345600,
    };
  }

  async createChallenge(input: CreateChallengeInput): Promise<PaymentRequiredResponse> {
    const supported = await this.facilitator.getSupported();
    const requirement = this.getRequirementBase(input);
    const supportedKind = supported.kinds.find(
      (kind) => kind.network === requirement.network && kind.scheme === requirement.scheme,
    );

    if (!supportedKind) {
      throw new Error(`Gateway does not report support for ${requirement.network}.`);
    }

    return {
      x402Version: 2,
      resource: {
        url: input.resourceUrl,
        description: `Pay to execute ${input.toolName}`,
        mimeType: "application/json",
      },
      accepts: [
        {
          ...requirement,
          extra: {
            ...(supportedKind.extra || {}),
            name: "GatewayWalletBatched",
            version: "1",
          },
        },
      ],
      extensions: {
        mode: "real",
        chain: this.config.chain,
      },
    };
  }

  async authorize(challenge: PaymentRequiredResponse): Promise<AuthorizationResult> {
    const account = privateKeyToAccount(this.config.buyerPrivateKey as `0x${string}`);
    const batchScheme = new BatchEvmScheme(account);
    const accepted = challenge.accepts[0];
    const signed = await batchScheme.createPaymentPayload(2, accepted);

    return {
      authorizationType: "gateway-batched-authorization",
      paymentPayload: {
        x402Version: 2,
        resource: challenge.resource,
        accepted,
        payload: signed.payload,
        extensions: challenge.extensions,
      },
      payer: account.address,
      rawPayload: {
        chain: this.config.chain,
      },
    };
  }

  async verifyAndSettle(
    challenge: PaymentRequiredResponse,
    paymentPayload: PaymentPayload,
  ): Promise<SettlementResult> {
    const accepted = challenge.accepts[0];
    const verified = await this.facilitator.verify(
      paymentPayload as unknown as Parameters<BatchFacilitatorClient["verify"]>[0],
      accepted as unknown as Parameters<BatchFacilitatorClient["verify"]>[1],
    );

    if (!verified.isValid) {
      throw new Error(verified.invalidReason || "Gateway rejected the payment authorization.");
    }

    const settled = await this.facilitator.settle(
      paymentPayload as unknown as Parameters<BatchFacilitatorClient["settle"]>[0],
      accepted as unknown as Parameters<BatchFacilitatorClient["settle"]>[1],
    );

    if (!settled.success) {
      throw new Error(settled.errorReason || "Gateway settlement failed.");
    }

    return {
      provider: this.label,
      network: settled.network,
      asset: accepted.asset,
      amountUsdc: accepted.amount,
      status: "confirmed",
      txHash: settled.transaction,
      explorerUrl: `${this.config.explorerBaseUrl}${settled.transaction}`,
      batchReference: settled.transaction,
      payer: settled.payer,
      rawPayload: {
        verified,
        settled,
      },
    };
  }
}

export function getPaymentProvider(mode: PaymentMode): PaymentProvider {
  const readiness = getRealProviderReadiness();

  if (mode === "real" && readiness.available) {
    return new RealPaymentProvider();
  }

  return new DemoPaymentProvider();
}

export function getProviderStatus(mode: PaymentMode) {
  const active = getPaymentProvider(mode);
  const readiness = getRealProviderReadiness();

  return {
    activeMode: active.mode,
    activeLabel: active.label,
    realAvailable: readiness.available,
    realMissing: readiness.missing,
    capabilities: active.capabilities,
  };
}
