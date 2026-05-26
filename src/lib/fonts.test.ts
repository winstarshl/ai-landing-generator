import { describe, it, expect } from "vitest";
import { googleFontHref } from "./fonts";

describe("googleFontHref", () => {
  it("builds a Google Fonts URL with + for spaces", () => {
    expect(googleFontHref("Inter")).toContain("family=Inter:");
    expect(googleFontHref("Plus Jakarta Sans")).toContain("family=Plus+Jakarta+Sans:");
  });

  it("requests common weights and swap display", () => {
    const href = googleFontHref("Poppins");
    expect(href).toContain("wght@400;500;600;700;800");
    expect(href).toContain("display=swap");
  });
});
