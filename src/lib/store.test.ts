import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@vercel/blob", () => ({ put: vi.fn(), list: vi.fn() }));

import { put, list } from "@vercel/blob";
import { savePage, getPage, resolvePage } from "./store";
import { encodePage } from "./pagecodec";
import { validPage } from "@/test/fixtures";

const mockPut = vi.mocked(put);
const mockList = vi.mocked(list);

beforeEach(() => {
  mockPut.mockReset();
  mockList.mockReset();
  vi.unstubAllGlobals();
});

describe("savePage", () => {
  it("writes page JSON to pages/<id>.json with a stable (no random suffix) path", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPut.mockResolvedValueOnce({} as any);
    await savePage("abc123", validPage);
    const [pathname, body, opts] = mockPut.mock.calls[0];
    expect(pathname).toBe("pages/abc123.json");
    expect(JSON.parse(body as string).product.name).toBe(validPage.product.name);
    expect(opts).toMatchObject({ access: "public", addRandomSuffix: false, allowOverwrite: true });
  });
});

describe("getPage", () => {
  it("returns null when no matching blob exists", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockList.mockResolvedValueOnce({ blobs: [] } as any);
    expect(await getPage("missing")).toBeNull();
  });

  it("fetches the blob url and returns the validated page", async () => {
    mockList.mockResolvedValueOnce({
      blobs: [{ pathname: "pages/abc123.json", url: "https://blob/x" }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => validPage }));
    const page = await getPage("abc123");
    expect(page?.product.name).toBe(validPage.product.name);
  });

  it("returns null when the stored payload fails validation", async () => {
    mockList.mockResolvedValueOnce({
      blobs: [{ pathname: "pages/x.json", url: "https://blob/x" }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ bad: true }) }));
    expect(await getPage("x")).toBeNull();
  });
});

describe("resolvePage", () => {
  it("decodes a stateless token without touching the store", async () => {
    const token = encodePage(validPage);
    const page = await resolvePage(token);
    expect(page?.product.name).toBe(validPage.product.name);
    expect(mockList).not.toHaveBeenCalled();
  });

  it("falls back to the store for a short id", async () => {
    mockList.mockResolvedValueOnce({
      blobs: [{ pathname: "pages/sid.json", url: "https://blob/x" }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => validPage }));
    const page = await resolvePage("sid");
    expect(page?.product.name).toBe(validPage.product.name);
  });
});
