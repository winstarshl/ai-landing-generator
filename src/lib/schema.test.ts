import { describe, it, expect } from "vitest";
import {
  LandingPlanSchema,
  ModelPlanSchema,
  RenderableSectionSchema,
  type LandingPlan,
} from "./schema";

const validModelPlan = {
  product: { name: "FocusFlow", summary: "A focus timer", audience: "Students" },
  theme: {
    palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
    font: "Inter",
    mood: "calm and modern",
  },
  sections: [
    {
      type: "hero",
      headline: "Focus, finally",
      subcopy: "Deep work made simple",
      cta: { label: "Start free" },
      visual_direction: "calm gradient with a timer",
    },
  ],
};

const validPlan: LandingPlan = {
  ...validModelPlan,
  sections: validModelPlan.sections.map((s, i) => ({ ...s, id: `s${i}` })),
} as LandingPlan;

describe("ModelPlanSchema", () => {
  it("accepts a valid model plan", () => {
    expect(ModelPlanSchema.parse(validModelPlan)).toBeTruthy();
  });

  it("rejects an unknown section type", () => {
    const bad = {
      ...validModelPlan,
      sections: [{ ...validModelPlan.sections[0], type: "carousel" }],
    };
    expect(ModelPlanSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a section missing headline", () => {
    const bad = {
      ...validModelPlan,
      sections: [{ type: "hero", visual_direction: "x" }],
    };
    expect(ModelPlanSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an empty sections array", () => {
    expect(ModelPlanSchema.safeParse({ ...validModelPlan, sections: [] }).success).toBe(false);
  });

  it("safeParse on garbage returns success:false", () => {
    expect(ModelPlanSchema.safeParse({ foo: "bar" }).success).toBe(false);
  });
});

describe("LandingPlanSchema", () => {
  it("requires section ids", () => {
    expect(LandingPlanSchema.safeParse(validModelPlan).success).toBe(false);
    expect(LandingPlanSchema.parse(validPlan)).toBeTruthy();
  });
});

describe("RenderableSectionSchema", () => {
  it("requires a resolved visual", () => {
    const withVisual = {
      ...validPlan.sections[0],
      visual: { kind: "gradient", gradient: "linear-gradient(0deg,#000,#fff)", icon: "Sparkles" },
    };
    expect(RenderableSectionSchema.parse(withVisual)).toBeTruthy();
    expect(RenderableSectionSchema.safeParse(validPlan.sections[0]).success).toBe(false);
  });
});
