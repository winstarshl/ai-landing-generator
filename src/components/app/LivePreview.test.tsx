import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LivePreview } from "./LivePreview";
import type { LandingPlan } from "@/lib/schema";

const plan: LandingPlan = {
  product: { name: "P", summary: "S", audience: "A" },
  theme: {
    palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
    font: "Inter",
    mood: "calm",
  },
  sections: [
    { id: "s0", type: "hero", headline: "Hello preview", visual_direction: "x" },
    { id: "s1", type: "cta", headline: "Act now", cta: { label: "Go" }, visual_direction: "y" },
  ],
};

describe("LivePreview", () => {
  it("renders the landing (with resolved visuals) inside a preview frame", () => {
    render(<LivePreview plan={plan} />);
    expect(screen.getByTestId("live-preview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hello preview" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Act now" })).toBeInTheDocument();
  });
});
