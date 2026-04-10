import { describe, expect, it } from "vitest";
import { getPaymentProvider } from "@/lib/payment";

describe("demo payment provider", () => {
  it("creates a challenge and authorization payload", async () => {
    const provider = getPaymentProvider("demo");
    const challenge = await provider.createChallenge({
      invocationId: "inv_test",
      toolId: "tool_test",
      toolName: "Premium Web Fetch",
      priceUsdc: "0.004",
      resourceUrl: "http://localhost:3000/api/tools/tool_test/invoke",
    });

    expect(challenge.x402Version).toBe(2);
    expect(challenge.accepts[0]?.amount).toBe("4000");

    const authorization = await provider.authorize(challenge);
    expect(authorization.paymentPayload.accepted.amount).toBe("4000");

    const settlement = await provider.verifyAndSettle(challenge, authorization.paymentPayload);
    expect(settlement.status).toBe("simulated");
  });
});
