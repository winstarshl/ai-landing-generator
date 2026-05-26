const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** URL-safe short id backed by the Web Crypto API (available in Node 19+ and edge). */
export function shortId(length = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
