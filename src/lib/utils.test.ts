import { describe, expect, it } from "vitest";
import { atomicUsdcToDecimal, decimalUsdcToAtomic } from "@/lib/utils";

describe("USDC helpers", () => {
  it("converts decimal USDC to atomic units", () => {
    expect(decimalUsdcToAtomic("0.004")).toBe("4000");
    expect(decimalUsdcToAtomic("1")).toBe("1000000");
  });

  it("converts atomic units back to decimals", () => {
    expect(atomicUsdcToDecimal("4000")).toBe("0.004");
    expect(atomicUsdcToDecimal("1000000")).toBe("1");
  });
});
