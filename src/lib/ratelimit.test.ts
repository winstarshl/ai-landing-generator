import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "./ratelimit";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const key = "test-allow";
    const now = 1000;
    expect(rateLimit(key, 3, 1000, now).ok).toBe(true);
    expect(rateLimit(key, 3, 1000, now).ok).toBe(true);
    expect(rateLimit(key, 3, 1000, now).ok).toBe(true);
    const blocked = rateLimit(key, 3, 1000, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const key = "test-reset";
    expect(rateLimit(key, 1, 1000, 0).ok).toBe(true);
    expect(rateLimit(key, 1, 1000, 500).ok).toBe(false);
    expect(rateLimit(key, 1, 1000, 1000).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const req = new Request("http://t", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to 'unknown' without proxy headers", () => {
    expect(clientIp(new Request("http://t"))).toBe("unknown");
  });
});
