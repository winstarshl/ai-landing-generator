import { NextResponse } from "next/server";
import { z } from "zod";
import { finalizePlan } from "@/lib/pipeline";
import { LandingPlanSchema } from "@/lib/schema";
import { encodePage } from "@/lib/pagecodec";
import { errorMessage } from "@/lib/errors";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 120;

const BodySchema = z.object({ plan: LandingPlanSchema });

export async function POST(req: Request) {
  const limit = rateLimit(`finalize:${clientIp(req)}`, 12, 60_000);
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
    return NextResponse.json({ error: "A valid approved plan is required." }, { status: 400 });
  }

  try {
    const page = await finalizePlan(body.plan);
    return NextResponse.json({ token: encodePage(page) });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
