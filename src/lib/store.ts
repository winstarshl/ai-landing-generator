import { put, list } from "@vercel/blob";
import { LandingPageSchema, type LandingPage } from "./schema";
import { decodePage } from "./pagecodec";

/**
 * Durable page storage backed by Vercel Blob, keyed by a short id → short URLs (/p/<id>).
 * Reads validate with Zod and fail soft (null). The store is public, so reads are a plain
 * fetch of the blob URL; writes use BLOB_READ_WRITE_TOKEN (injected by Vercel / in .env.local).
 */
const pathFor = (id: string) => `pages/${id}.json`;

export async function savePage(id: string, page: LandingPage): Promise<void> {
  await put(pathFor(id), JSON.stringify(page), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
}

export async function getPage(id: string): Promise<LandingPage | null> {
  try {
    const { blobs } = await list({ prefix: pathFor(id), limit: 1 });
    const blob = blobs.find((b) => b.pathname === pathFor(id));
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return null;
    const parsed = LandingPageSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a published-page slug to a page: short id from the store, or a
 * legacy/self-contained stateless token (gzip+base64url). Lets old long links
 * and offline tests keep working alongside short-id storage.
 */
export async function resolvePage(slug: string): Promise<LandingPage | null> {
  return decodePage(slug) ?? (await getPage(slug));
}
