import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePlan } from "@/lib/pipeline";
import { errorMessage } from "@/lib/errors";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 120;

const BodySchema = z.object({ prompt: z.string().min(3).max(2000) });

export async function POST(req: Request) {
  const limit = rateLimit(`generate:${clientIp(req)}`, 8, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "A product description (3-2000 chars) is required." },
      { status: 400 },
    );
  }

  // Stream pipeline progress as newline-delimited JSON: {stage} … then {stage:"done", plan}.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        const plan = await generatePlan(body.prompt, undefined, (stage) => send({ stage }));
        send({ stage: "done", plan });
      } catch (e) {
        send({ error: errorMessage(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
