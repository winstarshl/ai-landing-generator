import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePlan } from "@/lib/pipeline";
import { errorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({ prompt: z.string().min(3).max(2000) });

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "A product description (3-2000 chars) is required." }, { status: 400 });
  }

  try {
    const plan = await generatePlan(body.prompt);
    return NextResponse.json({ plan });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
