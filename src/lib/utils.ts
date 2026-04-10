export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function nowIso() {
  return new Date().toISOString();
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function serializeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function decimalUsdcToAtomic(value: string) {
  const [wholePart, fractionPart = ""] = value.trim().split(".");
  const normalizedWhole = wholePart === "" ? "0" : wholePart;
  const normalizedFraction = `${fractionPart}000000`.slice(0, 6);

  const whole = BigInt(normalizedWhole) * 1_000_000n;
  const fraction = BigInt(normalizedFraction || "0");
  return (whole + fraction).toString();
}

export function atomicUsdcToDecimal(value: string) {
  const amount = BigInt(value);
  const whole = amount / 1_000_000n;
  const fraction = (amount % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");

  return fraction ? `${whole.toString()}.${fraction}` : whole.toString();
}

export function formatUsdc(value: string) {
  return `${Number(value).toFixed(3)} USDC`;
}

export function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
