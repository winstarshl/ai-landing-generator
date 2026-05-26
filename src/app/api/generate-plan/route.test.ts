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

/** Read an NDJSON streaming response into parsed event objects. */
async function readEvents(res: Response): Promise<Array<Record<string, unknown>>> {
  const text = await res.text();
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

beforeEach(() => mock.mockReset());

describe("POST /api/generate-plan", () => {
  it("400s on a too-short prompt", async () => {
    const res = await post({ prompt: "x" });
    expect(res.status).toBe(400);
    expect(mock).not.toHaveBeenCalled();
  });

  it("streams a done event carrying the generated plan", async () => {
    mock.mockResolvedValueOnce(validPlan);
    const res = await post({ prompt: "a focus timer for students" });
    expect(res.headers.get("content-type")).toContain("application/x-ndjson");
    const events = await readEvents(res);
    const done = events.find((e) => e.stage === "done");
    expect(done?.plan).toEqual(validPlan);
  });

  it("streams an error event when the pipeline throws", async () => {
    mock.mockRejectedValueOnce(new Error("ANTHROPIC_API_KEY is not set"));
    const res = await post({ prompt: "a focus timer for students" });
    const events = await readEvents(res);
    expect(events.some((e) => typeof e.error === "string" && (e.error as string).includes("ANTHROPIC_API_KEY"))).toBe(true);
  });
});
