import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/pipeline", () => ({ finalizePlan: vi.fn() }));

import { POST } from "./route";
import { finalizePlan } from "@/lib/pipeline";
import { decodePage } from "@/lib/pagecodec";
import { validPlan, validPage } from "@/test/fixtures";

const mock = vi.mocked(finalizePlan);

function post(body: unknown) {
  return POST(
    new Request("http://t/api/finalize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => mock.mockReset());

describe("POST /api/finalize", () => {
  it("400s when no valid plan is provided", async () => {
    const res = await post({ plan: {} });
    expect(res.status).toBe(400);
    expect(mock).not.toHaveBeenCalled();
  });

  it("returns a token that decodes back to the finalized page", async () => {
    mock.mockResolvedValueOnce(validPage);
    const res = await post({ plan: validPlan });
    expect(res.status).toBe(200);
    const { token } = await res.json();
    expect(typeof token).toBe("string");
    expect(decodePage(token)).toEqual(validPage);
  });

  it("500s when finalize throws", async () => {
    mock.mockRejectedValueOnce(new Error("boom"));
    const res = await post({ plan: validPlan });
    expect(res.status).toBe(500);
  });
});
