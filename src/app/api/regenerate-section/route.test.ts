import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/pipeline", () => ({ regenerateSection: vi.fn() }));

import { POST } from "./route";
import { regenerateSection } from "@/lib/pipeline";
import { validPlan } from "@/test/fixtures";

const mock = vi.mocked(regenerateSection);

function post(body: unknown) {
  return POST(
    new Request("http://t/api/regenerate-section", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => mock.mockReset());

describe("POST /api/regenerate-section", () => {
  it("400s when the plan is invalid", async () => {
    const res = await post({ plan: { nope: true }, sectionId: "s0" });
    expect(res.status).toBe(400);
    expect(mock).not.toHaveBeenCalled();
  });

  it("returns the updated plan", async () => {
    const updated = { ...validPlan };
    mock.mockResolvedValueOnce(updated);
    const res = await post({ plan: validPlan, sectionId: "s0", instruction: "bolder" });
    expect(res.status).toBe(200);
    expect((await res.json()).plan).toEqual(updated);
    expect(mock).toHaveBeenCalledWith(validPlan, "s0", "bolder");
  });

  it("500s when the pipeline throws", async () => {
    mock.mockRejectedValueOnce(new Error("Section not found: zzz"));
    const res = await post({ plan: validPlan, sectionId: "zzz" });
    expect(res.status).toBe(500);
  });
});
