import { callTool, type AnthropicLike } from "./anthropic";
import {
  ModelPlanSchema,
  ModelSectionSchema,
  type LandingPlan,
  type LandingPage,
  type ModelPlan,
  type Section,
} from "./schema";
import {
  PLAN_SYSTEM,
  buildPlanPrompt,
  FINALIZE_SYSTEM,
  buildFinalizePrompt,
  SECTION_SYSTEM,
  buildSectionPrompt,
} from "./prompts";
import { resolveVisual } from "./visuals";
import { shortId } from "./id";

const PLAN_TOOL = {
  toolName: "emit_landing_plan",
  toolDescription: "Return the full landing page plan.",
};

function withIds(plan: ModelPlan): LandingPlan {
  return { ...plan, sections: plan.sections.map((s) => ({ ...s, id: shortId() })) };
}

/** Step 1: generate a draft landing plan from the user's prompt. */
export async function generatePlan(
  userPrompt: string,
  client?: AnthropicLike,
): Promise<LandingPlan> {
  const draft = await callTool({
    ...PLAN_TOOL,
    system: PLAN_SYSTEM,
    prompt: buildPlanPrompt(userPrompt),
    schema: ModelPlanSchema,
    client,
  });

  return withIds(draft);
}

/** Regenerate a single section in place, preserving its id and the rest of the plan. */
export async function regenerateSection(
  plan: LandingPlan,
  sectionId: string,
  instruction?: string,
  client?: AnthropicLike,
): Promise<LandingPlan> {
  const target = plan.sections.find((s) => s.id === sectionId);
  if (!target) throw new Error(`Section not found: ${sectionId}`);

  const next = await callTool({
    system: SECTION_SYSTEM,
    prompt: buildSectionPrompt(plan, target, instruction),
    schema: ModelSectionSchema,
    toolName: "emit_section",
    toolDescription: "Return the rewritten section.",
    client,
  });

  return {
    ...plan,
    sections: plan.sections.map((s) =>
      s.id === sectionId ? { ...next, id: sectionId } : s,
    ),
  };
}

/** Step 3: polish copy and attach deterministic mock visuals → render-ready page. */
export async function finalizePlan(
  plan: LandingPlan,
  client?: AnthropicLike,
): Promise<LandingPage> {
  const polished = await callTool({
    ...PLAN_TOOL,
    system: FINALIZE_SYSTEM,
    prompt: buildFinalizePrompt(plan),
    schema: ModelPlanSchema,
    client,
  });

  const sections = polished.sections.map((s, i) => {
    const section: Section = { ...s, id: plan.sections[i]?.id ?? shortId() };
    return { ...section, visual: resolveVisual(section, polished.theme) };
  });

  return { product: polished.product, theme: polished.theme, sections };
}
