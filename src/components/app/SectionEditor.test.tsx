import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionEditor } from "./SectionEditor";
import type { Section, Theme } from "@/lib/schema";

const theme: Theme = {
  palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
  font: "Inter",
  mood: "calm",
};

const section: Section = {
  id: "s0",
  type: "hero",
  headline: "Hi there",
  subcopy: "sub",
  cta: { label: "Go" },
  visual_direction: "calm gradient",
};

function noop() {}

describe("SectionEditor", () => {
  it("shows the editable visual direction and a live visual preview", () => {
    render(
      <SectionEditor
        section={section}
        index={0}
        theme={theme}
        onChange={noop}
        onRegenerate={noop}
        regenerating={false}
      />,
    );
    expect(screen.getByLabelText("Section 1 visual direction")).toHaveValue("calm gradient");
    expect(screen.getByTestId("visual-preview-0")).toBeInTheDocument();
  });

  it("emits visual_direction edits", () => {
    const onChange = vi.fn();
    render(
      <SectionEditor
        section={section}
        index={0}
        theme={theme}
        onChange={onChange}
        onRegenerate={noop}
        regenerating={false}
      />,
    );
    fireEvent.change(screen.getByLabelText("Section 1 visual direction"), {
      target: { value: "bold neon" },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ visual_direction: "bold neon" }));
  });
});
