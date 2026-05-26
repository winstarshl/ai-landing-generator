import { test, expect } from "@playwright/test";
import { encodePage } from "../../src/lib/pagecodec";
import type { LandingPage, LandingPlan } from "../../src/lib/schema";

const planFixture: LandingPlan = {
  product: { name: "FocusFlow", summary: "A focus timer for deep work", audience: "Students" },
  theme: {
    palette: { primary: "#4f46e5", bg: "#ffffff", fg: "#111827", accent: "#22d3ee" },
    font: "Inter",
    mood: "calm and focused",
  },
  sections: [
    { id: "s0", type: "hero", headline: "Focus, finally", subcopy: "Deep work made simple", cta: { label: "Start free" }, visual_direction: "calm gradient" },
    { id: "s1", type: "benefits", headline: "Why FocusFlow", bullets: ["Block distractions", "Track your sessions"], visual_direction: "icons" },
    { id: "s2", type: "cta", headline: "Start focusing today", cta: { label: "Get started" }, visual_direction: "bold band" },
  ],
};

const pageFixture: LandingPage = {
  ...planFixture,
  sections: planFixture.sections.map((s) => ({
    ...s,
    visual: { kind: "gradient", gradient: "linear-gradient(10deg,#4f46e5,#22d3ee)", icon: "Sparkles" },
  })),
};

const token = encodePage(pageFixture);

/** Mock the streaming (NDJSON) generate-plan endpoint with a single done event. */
function fulfillPlanStream(plan: typeof planFixture) {
  return {
    contentType: "application/x-ndjson",
    body: JSON.stringify({ stage: "done", plan }) + "\n",
  };
}

test("prompt → review → edit → approve → published page", async ({ page }) => {
  await page.route("**/api/generate-plan", (r) => r.fulfill(fulfillPlanStream(planFixture)));
  // The published route resolves a slug as a short id OR a self-contained token;
  // returning the token keeps this E2E offline (no Blob store needed).
  await page.route("**/api/finalize", (r) => r.fulfill({ json: { id: token } }));

  await page.goto("/");
  await page.getByRole("textbox").fill("a focus timer for students");
  await page.getByRole("button", { name: /generate plan/i }).click();

  // Review screen shows the drafted product + sections.
  await expect(page.getByRole("heading", { name: "FocusFlow" })).toBeVisible();
  const headline = page.getByLabel("Section 1 headline");
  await expect(headline).toHaveValue("Focus, finally");

  // Inline edit works.
  await headline.fill("Focus, at last");
  await expect(headline).toHaveValue("Focus, at last");

  // Approve → navigates to the published, rendered landing page.
  await page.getByRole("button", { name: /approve & generate/i }).click();
  await expect(page).toHaveURL(/\/p\/.+/);
  await expect(page.getByRole("heading", { name: "Focus, finally" })).toBeVisible();
  await expect(page.getByText(/made with landingforge/i)).toBeVisible();
});

test("regenerate a single section updates only that section", async ({ page }) => {
  await page.route("**/api/generate-plan", (r) => r.fulfill(fulfillPlanStream(planFixture)));
  const regenerated: LandingPlan = {
    ...planFixture,
    sections: planFixture.sections.map((s, i) => (i === 0 ? { ...s, headline: "Regenerated hero" } : s)),
  };
  await page.route("**/api/regenerate-section", (r) => r.fulfill({ json: { plan: regenerated } }));

  await page.goto("/");
  await page.getByRole("textbox").fill("a focus timer");
  await page.getByRole("button", { name: /generate plan/i }).click();

  await expect(page.getByLabel("Section 1 headline")).toHaveValue("Focus, finally");
  await page.getByRole("button", { name: /regenerate/i }).first().click();
  await expect(page.getByLabel("Section 1 headline")).toHaveValue("Regenerated hero");
  await expect(page.getByLabel("Section 2 headline")).toHaveValue("Why FocusFlow");
});

test("unknown share token renders a 404", async ({ page }) => {
  const res = await page.goto("/p/not-a-valid-token");
  expect(res?.status()).toBe(404);
});
