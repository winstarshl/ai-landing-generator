import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./anthropic", () => ({ callTool: vi.fn() }));

import { callTool } from "./anthropic";
import { generatePlan, regenerateSection, finalizePlan } from "./pipeline";
import type { LandingPlan, ModelPlan } from "./schema";

const mockCall = vi.mocked(callTool);

const theme = {
  palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
  font: "Inter",
  mood: "calm",
};

const modelPlan = (heroHeadline: string): ModelPlan => ({
  product: { name: "FocusFlow", summary: "Focus timer", audience: "Students" },
  theme,
  sections: [
    { type: "hero", headline: heroHeadline, visual_direction: "calm gradient" },
    { type: "cta", headline: "Get started", visual_direction: "bold button" },
  ],
});

beforeEach(() => mockCall.mockReset());

describe("generatePlan", () => {
  it("generates a plan in a single call and assigns unique ids", async () => {
    mockCall.mockResolvedValueOnce(modelPlan("Hero headline"));

    const plan = await generatePlan("a focus timer app");

    expect(mockCall).toHaveBeenCalledTimes(1);
    expect(plan.sections[0].headline).toBe("Hero headline");
    expect(plan.sections.every((s) => typeof s.id === "string" && s.id.length > 0)).toBe(true);
    expect(plan.sections[0].id).not.toBe(plan.sections[1].id);
  });
});

describe("regenerateSection", () => {
  const plan: LandingPlan = {
    product: { name: "P", summary: "S", audience: "A" },
    theme,
    sections: [
      { id: "s0", type: "hero", headline: "Old hero", visual_direction: "x" },
      { id: "s1", type: "cta", headline: "Old cta", visual_direction: "y" },
    ],
  };

  it("replaces only the target section and preserves its id", async () => {
    mockCall.mockResolvedValueOnce({
      type: "hero",
      headline: "New hero",
      visual_direction: "z",
    });

    const next = await regenerateSection(plan, "s0", "make it bolder");

    expect(next.sections[0]).toMatchObject({ id: "s0", headline: "New hero" });
    expect(next.sections[1]).toEqual(plan.sections[1]);
  });

  it("throws when the section id is unknown", async () => {
    await expect(regenerateSection(plan, "missing")).rejects.toThrow("Section not found");
  });
});

describe("finalizePlan", () => {
  const plan: LandingPlan = {
    product: { name: "P", summary: "S", audience: "A" },
    theme,
    sections: [
      { id: "s0", type: "hero", headline: "Hero", visual_direction: "x" },
      { id: "s1", type: "cta", headline: "Cta", visual_direction: "y" },
    ],
  };

  it("polishes copy, preserves ids by index, and attaches visuals", async () => {
    mockCall.mockResolvedValueOnce(modelPlan("Polished hero"));

    const page = await finalizePlan(plan);

    expect(page.sections[0]).toMatchObject({ id: "s0", headline: "Polished hero" });
    expect(page.sections[0].visual.kind).toBe("gradient");
    expect(page.sections[0].visual.gradient).toContain("#4f46e5");
    expect(page.sections[1].id).toBe("s1");
  });
});
