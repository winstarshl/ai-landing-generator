import { NextResponse } from "next/server";
import { z } from "zod";
import { regenerateSection } from "@/lib/pipeline";
import { LandingPlanSchema } from "@/lib/schema";
import { errorMessage } from "@/lib/errors";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 120;

const BodySchema = z.object({
  plan: LandingPlanSchema,
  sectionId: z.string().min(1),
  instruction: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const limit = rateLimit(`regenerate:${clientIp(req)}`, 20, 60_000);
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
    return NextResponse.json({ error: "Invalid plan or section id." }, { status: 400 });
  }

  try {
    const plan = await regenerateSection(body.plan, body.sectionId, body.instruction);
    return NextResponse.json({ plan });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
