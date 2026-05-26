import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { callTool, ModelOutputError, type AnthropicLike } from "./anthropic";

const schema = z.object({ name: z.string().min(1) });

function clientReturning(...inputs: unknown[]): AnthropicLike {
  const create = vi.fn();
  for (const input of inputs) {
    create.mockResolvedValueOnce({ content: [{ type: "tool_use", input }] });
  }
  return { messages: { create } } as unknown as AnthropicLike;
}

const baseOpts = {
  system: "sys",
  prompt: "do it",
  schema,
  toolName: "emit",
  toolDescription: "emit an object",
};

describe("callTool", () => {
  it("returns the validated tool input on first success", async () => {
    const client = clientReturning({ name: "ok" });
    const result = await callTool({ ...baseOpts, client });
    expect(result).toEqual({ name: "ok" });
    expect((client.messages.create as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it("retries once with the error fed back, then succeeds", async () => {
    const client = clientReturning({ name: "" }, { name: "fixed" });
    const result = await callTool({ ...baseOpts, client });
    expect(result).toEqual({ name: "fixed" });
    const create = client.messages.create as ReturnType<typeof vi.fn>;
    expect(create).toHaveBeenCalledTimes(2);
    const secondCallPrompt = create.mock.calls[1][0].messages[0].content as string;
    expect(secondCallPrompt).toContain("previous response was invalid");
  });

  it("throws ModelOutputError after the retry also fails", async () => {
    const client = clientReturning({ name: "" }, { name: "" });
    await expect(callTool({ ...baseOpts, client })).rejects.toBeInstanceOf(ModelOutputError);
  });

  it("forces tool_choice to the named tool", async () => {
    const client = clientReturning({ name: "ok" });
    await callTool({ ...baseOpts, client });
    const body = (client.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body.tool_choice).toEqual({ type: "tool", name: "emit" });
    expect(body.tools[0].name).toBe("emit");
    expect(body.tools[0].input_schema.type).toBe("object");
  });
});
