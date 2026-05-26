import { NextResponse } from "next/server";
import { z } from "zod";
import { finalizePlan } from "@/lib/pipeline";
import { LandingPlanSchema } from "@/lib/schema";
import { encodePage } from "@/lib/pagecodec";
import { errorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({ plan: LandingPlanSchema });

export async function POST(req: Request) {
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
