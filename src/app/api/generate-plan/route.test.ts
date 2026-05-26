import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/pipeline", () => ({ generatePlan: vi.fn() }));

import { POST } from "./route";
import { generatePlan } from "@/lib/pipeline";
import { validPlan } from "@/test/fixtures";

const mock = vi.mocked(generatePlan);

function post(body: unknown) {
  return POST(
    new Request("http://t/api/generate-plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => mock.mockReset());

describe("POST /api/generate-plan", () => {
  it("400s on a too-short prompt", async () => {
    const res = await post({ prompt: "x" });
    expect(res.status).toBe(400);
    expect(mock).not.toHaveBeenCalled();
  });

  it("returns the generated plan", async () => {
    mock.mockResolvedValueOnce(validPlan);
    const res = await post({ prompt: "a focus timer for students" });
    expect(res.status).toBe(200);
    expect((await res.json()).plan).toEqual(validPlan);
  });

  it("500s when the pipeline throws", async () => {
    mock.mockRejectedValueOnce(new Error("ANTHROPIC_API_KEY is not set"));
    const res = await post({ prompt: "a focus timer for students" });
    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain("ANTHROPIC_API_KEY");
  });
});
