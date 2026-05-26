import { describe, it, expect } from "vitest";
import { themeToCssVars, hashString } from "./theme";
import { resolveVisual } from "./visuals";
import { shortId } from "./id";
import type { Section, Theme } from "./schema";

const theme: Theme = {
  palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
  font: "Inter",
  mood: "calm",
};

describe("themeToCssVars", () => {
  it("maps palette and font to CSS custom properties", () => {
    const vars = themeToCssVars(theme);
    expect(vars["--lp-primary"]).toBe("#4f46e5");
    expect(vars["--lp-bg"]).toBe("#ffffff");
    expect(vars["--lp-fg"]).toBe("#111827");
    expect(vars["--lp-accent"]).toBe("#22d3ee");
    expect(vars["--lp-font"]).toBe("Inter");
  });
});

describe("hashString", () => {
  it("is deterministic and non-negative", () => {
    expect(hashString("abc")).toBe(hashString("abc"));
    expect(hashString("abc")).toBeGreaterThanOrEqual(0);
  });
});

describe("resolveVisual", () => {
  const section: Section = {
    id: "s0",
    type: "hero",
    headline: "Focus, finally",
    visual_direction: "calm gradient",
  };

  it("produces a deterministic themed gradient + icon", () => {
    const a = resolveVisual(section, theme);
    const b = resolveVisual(section, theme);
    expect(a).toEqual(b);
    expect(a.kind).toBe("gradient");
    expect(a.gradient).toContain("#4f46e5");
    expect(a.gradient).toContain("#22d3ee");
    expect(a.icon).toBe("Sparkles");
  });

  it("maps each section type to a known icon", () => {
    expect(resolveVisual({ ...section, type: "pricing" }, theme).icon).toBe("Tag");
    expect(resolveVisual({ ...section, type: "faq" }, theme).icon).toBe("CircleHelp");
  });
});

describe("shortId", () => {
  it("returns lowercase alphanumeric ids of the requested length", () => {
    const id = shortId(8);
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("is highly likely to be unique", () => {
    const ids = new Set(Array.from({ length: 500 }, () => shortId()));
    expect(ids.size).toBe(500);
  });
});
