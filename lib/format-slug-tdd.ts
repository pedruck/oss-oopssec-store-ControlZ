import type { FlagCategory } from "@/lib/types";

const TITLE_OVERRIDES: Record<string, string> = {
  CVE: "CVE",
  NPM: "npm",
  SQL: "SQL",
  XSS: "XSS",
  CSRF: "CSRF",
  SSRF: "SSRF",
  XXE: "XXE",
  IDOR: "IDOR",
  BOLA: "BOLA",
  JWT: "JWT",
  MD5: "MD5",
  AES: "AES",
  CBC: "CBC",
  AI: "AI",
  MCP: "MCP",
  API: "API",
  ENV: "ENV",
  RCE: "RCE",
};

export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => {
      const upper = word.toUpperCase();
      if (TITLE_OVERRIDES[upper]) return TITLE_OVERRIDES[upper];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
