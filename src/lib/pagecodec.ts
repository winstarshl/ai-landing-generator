import { gzipSync, gunzipSync } from "node:zlib";
import { LandingPageSchema, type LandingPage } from "./schema";

/**
 * Stateless share links: a finalized page is gzip + base64url encoded into the URL.
 * No database to provision; the link is fully self-contained. A KV-backed short id
 * is a drop-in replacement (swap encode/decode for save/get).
 */
export function encodePage(page: LandingPage): string {
  const json = JSON.stringify(page);
  return gzipSync(Buffer.from(json, "utf8")).toString("base64url");
}

export function decodePage(token: string): LandingPage | null {
  try {
    const json = gunzipSync(Buffer.from(token, "base64url")).toString("utf8");
    const parsed = LandingPageSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
