import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

/** Minimal surface of the Anthropic client we depend on (injectable for tests). */
export interface AnthropicLike {
  messages: {
    create(body: unknown): Promise<{ content: Array<{ type: string; input?: unknown }> }>;
  };
}

let cached: AnthropicLike | null = null;

export function getClient(): AnthropicLike {
  if (!cached) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    cached = new Anthropic({ apiKey }) as unknown as AnthropicLike;
  }
  return cached;
}

/** Thrown when the model output cannot be validated after a retry. */
export class ModelOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelOutputError";
  }
}

function toToolSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12" }) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

export interface CallToolOptions<T> {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  toolName: string;
  toolDescription: string;
  maxTokens?: number;
  model?: string;
  client?: AnthropicLike;
}

/**
 * Single structured-output call: forces the model to return data matching `schema`
 * via tool use, validates with Zod, and retries once (feeding the error back) before failing.
 */
export async function callTool<T>(opts: CallToolOptions<T>): Promise<T> {
  const client = opts.client ?? getClient();
  const inputSchema = toToolSchema(opts.schema);
  const tool = {
    name: opts.toolName,
    description: opts.toolDescription,
    input_schema: inputSchema,
  };

  let prompt = opts.prompt;

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.messages.create({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      tools: [tool],
      tool_choice: { type: "tool", name: opts.toolName },
      messages: [{ role: "user", content: prompt }],
    });

    const block = res.content.find((b) => b.type === "tool_use");
    const parsed = opts.schema.safeParse(block?.input);
    if (parsed.success) return parsed.data;

    if (attempt === 0) {
      prompt = `${opts.prompt}\n\nYour previous response was invalid (${parsed.error.message}). Return a corrected result using the ${opts.toolName} tool.`;
      continue;
    }
    throw new ModelOutputError(`Model output failed validation: ${parsed.error.message}`);
  }

  /* istanbul ignore next */
  throw new ModelOutputError("callTool exhausted retries");
}
