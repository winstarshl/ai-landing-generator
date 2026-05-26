import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RenderSection, RenderLanding } from "./registry";
import { SECTION_COMPONENTS } from "./sections";
import type { LandingPage, RenderableSection, SectionType } from "@/lib/schema";

const visual = {
  kind: "gradient" as const,
  gradient: "linear-gradient(10deg,#4f46e5,#22d3ee)",
  icon: "Sparkles",
};

function section(type: SectionType, headline: string): RenderableSection {
  return {
    id: `id-${type}`,
    type,
    headline,
    subcopy: "Sub copy",
    bullets: ["Point one", "Point two"],
    cta: { label: "Go" },
    visual_direction: "x",
    visual,
  };
}

describe("RenderSection", () => {
  it("renders the headline for every section type", () => {
    for (const type of Object.keys(SECTION_COMPONENTS) as SectionType[]) {
      const { unmount } = render(<RenderSection section={section(type, `H-${type}`)} />);
      expect(screen.getByText(`H-${type}`)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders nothing for an unknown type", () => {
    const { container } = render(
      <RenderSection section={{ ...section("hero", "x"), type: "mystery" as SectionType }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RenderLanding", () => {
  const page: LandingPage = {
    product: { name: "P", summary: "S", audience: "A" },
    theme: {
      palette: { primary: "#4f46e5", bg: "#0b1020", fg: "#f8fafc", accent: "#22d3ee" },
      font: "Poppins",
      mood: "bold",
    },
    sections: [section("hero", "First"), section("features", "Second"), section("cta", "Third")],
  };

  it("applies theme CSS variables on the root", () => {
    render(<RenderLanding page={page} />);
    const root = screen.getByTestId("landing-root");
    expect(root.style.getPropertyValue("--lp-primary")).toBe("#4f46e5");
    expect(root.style.getPropertyValue("--lp-bg")).toBe("#0b1020");
    expect(root.style.getPropertyValue("--lp-font")).toBe("Poppins");
  });

  it("renders all sections in order", () => {
    render(<RenderLanding page={page} />);
    const headings = screen.getAllByRole("heading");
    const texts = headings.map((h) => h.textContent);
    expect(texts.indexOf("First")).toBeLessThan(texts.indexOf("Second"));
    expect(texts.indexOf("Second")).toBeLessThan(texts.indexOf("Third"));
  });
});
