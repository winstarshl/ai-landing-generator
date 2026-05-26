import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemePreview } from "./ThemePreview";
import type { Theme } from "@/lib/schema";

const theme: Theme = {
  palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
  font: "Inter",
  mood: "calm and modern",
};

describe("ThemePreview", () => {
  it("is read-only without onChange (no color inputs)", () => {
    render(<ThemePreview theme={theme} />);
    expect(screen.getByText("calm and modern")).toBeInTheDocument();
    expect(screen.queryByLabelText("primary color")).not.toBeInTheDocument();
  });

  it("renders color inputs and emits palette edits when editable", () => {
    const onChange = vi.fn();
    render(<ThemePreview theme={theme} onChange={onChange} />);
    const primary = screen.getByLabelText("primary color") as HTMLInputElement;
    expect(primary.value).toBe("#4f46e5");
    fireEvent.change(primary, { target: { value: "#ff0000" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ palette: expect.objectContaining({ primary: "#ff0000" }) }),
    );
  });

  it("warns about low contrast when editable", () => {
    const dark = { ...theme, palette: { ...theme.palette, bg: "#0b1020", fg: "#10131f" } };
    render(<ThemePreview theme={dark} onChange={() => {}} />);
    expect(screen.getByText(/low text contrast/i)).toBeInTheDocument();
  });
});
