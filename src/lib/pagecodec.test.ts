import { describe, it, expect } from "vitest";
import { encodePage, decodePage } from "./pagecodec";
import type { LandingPage } from "./schema";

const page: LandingPage = {
  product: { name: "FocusFlow", summary: "Focus timer", audience: "Students" },
  theme: {
    palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
    font: "Inter",
    mood: "calm",
  },
  sections: [
    {
      id: "s0",
      type: "hero",
      headline: "Focus, finally",
      visual_direction: "calm gradient",
      visual: { kind: "gradient", gradient: "linear-gradient(10deg,#4f46e5,#22d3ee)", icon: "Sparkles" },
    },
  ],
};

describe("pagecodec", () => {
  it("round-trips a page through encode/decode", () => {
    const token = encodePage(page);
    expect(typeof token).toBe("string");
    expect(token).not.toContain("/");
    expect(decodePage(token)).toEqual(page);
  });

  it("returns null for a malformed token", () => {
    expect(decodePage("not-a-real-token")).toBeNull();
  });

  it("returns null when the decoded payload fails schema validation", () => {
    const bad = encodePage({ ...page, sections: [] } as unknown as LandingPage);
    expect(decodePage(bad)).toBeNull();
  });
});
