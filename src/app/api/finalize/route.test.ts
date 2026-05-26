import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/pipeline", () => ({ finalizePlan: vi.fn() }));
vi.mock("@/lib/store", () => ({ savePage: vi.fn() }));

import { POST } from "./route";
import { finalizePlan } from "@/lib/pipeline";
import { savePage } from "@/lib/store";
import { validPlan, validPage } from "@/test/fixtures";

const mockFinalize = vi.mocked(finalizePlan);
const mockSave = vi.mocked(savePage);

function post(body: unknown) {
  return POST(
    new Request("http://t/api/finalize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  mockFinalize.mockReset();
  mockSave.mockReset();
});

describe("POST /api/finalize", () => {
  it("400s when no valid plan is provided", async () => {
    const res = await post({ plan: {} });
    expect(res.status).toBe(400);
    expect(mockFinalize).not.toHaveBeenCalled();
  });

  it("finalizes, saves the page, and returns its short id", async () => {
    mockFinalize.mockResolvedValueOnce(validPage);
    mockSave.mockResolvedValueOnce(undefined);
    const res = await post({ plan: validPlan });
    expect(res.status).toBe(200);
    const { id } = await res.json();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
    expect(mockSave).toHaveBeenCalledWith(id, validPage);
  });

  it("500s when finalize throws", async () => {
    mockFinalize.mockRejectedValueOnce(new Error("boom"));
    const res = await post({ plan: validPlan });
    expect(res.status).toBe(500);
  });
});
