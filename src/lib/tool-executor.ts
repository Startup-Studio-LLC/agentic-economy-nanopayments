import { demoDocuments } from "@/lib/demo-documents";
import { isValidUrl, truncate } from "@/lib/utils";

export interface ToolInput {
  url: string;
  goal?: string;
}

export interface ToolOutput {
  title: string;
  summary: string;
  bullets: string[];
  excerpt: string;
  entities: string[];
  sourceType: "demo" | "live";
  canonicalUrl: string;
  fetchedAt: string;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 24);
}

function extractEntities(text: string) {
  const matches = text.match(/\b[A-Z][a-zA-Z0-9-]{2,}\b/g) || [];
  return Array.from(new Set(matches)).slice(0, 6);
}

function getTitleFromHtml(html: string) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match?.[1]?.trim() || "Untitled page";
}

export async function executePremiumWebFetch(input: ToolInput): Promise<ToolOutput> {
  const fetchedAt = new Date().toISOString();
  const demoDoc = demoDocuments[input.url];

  if (demoDoc) {
    return {
      title: demoDoc.title,
      summary: demoDoc.summary,
      bullets: demoDoc.bullets,
      excerpt: demoDoc.excerpt,
      entities: demoDoc.entities,
      sourceType: "demo",
      canonicalUrl: input.url,
      fetchedAt,
    };
  }

  if (!isValidUrl(input.url)) {
    throw new Error("Enter a valid http or https URL, or use one of the built-in demo URLs.");
  }

  const response = await fetch(input.url, {
    headers: {
      "user-agent": "ToolMarket Lite/0.1 (+https://example.com)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`The upstream page returned ${response.status}.`);
  }

  const html = await response.text();
  const text = stripHtml(html);
  const sentences = extractSentences(text);
  const title = getTitleFromHtml(html);
  const summary =
    sentences.slice(0, 2).join(" ") ||
    "This page returned very little readable text, but the fetch completed successfully.";

  const bullets = sentences.slice(0, 3).map((sentence) => truncate(sentence, 140));
  const excerpt = truncate(text, 260);
  const entities = extractEntities(text);

  return {
    title,
    summary,
    bullets: bullets.length > 0 ? bullets : ["Readable content was limited on this page."],
    excerpt,
    entities,
    sourceType: "live",
    canonicalUrl: input.url,
    fetchedAt,
  };
}
