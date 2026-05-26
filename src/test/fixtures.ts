import type { LandingPlan, LandingPage } from "@/lib/schema";

export const validPlan: LandingPlan = {
  product: { name: "FocusFlow", summary: "A focus timer", audience: "Students" },
  theme: {
    palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
    font: "Inter",
    mood: "calm",
  },
  sections: [
    { id: "s0", type: "hero", headline: "Focus, finally", visual_direction: "calm gradient" },
    { id: "s1", type: "cta", headline: "Start free", cta: { label: "Start" }, visual_direction: "bold button" },
  ],
};

export const validPage: LandingPage = {
  ...validPlan,
  sections: validPlan.sections.map((s) => ({
    ...s,
    visual: { kind: "gradient", gradient: "linear-gradient(10deg,#4f46e5,#22d3ee)", icon: "Sparkles" },
  })),
};
