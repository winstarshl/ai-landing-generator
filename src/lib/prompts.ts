import { SECTION_TYPES, type LandingPlan, type Section } from "./schema";

const TYPE_LIST = SECTION_TYPES.join(", ");

export const PLAN_SYSTEM = `You are a senior conversion copywriter and landing-page strategist.
Given a product or offer, design a complete, high-converting landing page PLAN.

Rules:
- Choose 4 to 7 sections from these allowed types only: ${TYPE_LIST}.
- Always include exactly one "hero" (first) and at least one "cta".
- Write concrete, benefit-driven copy — no lorem ipsum, no placeholders. Headlines are punchy and specific to the product.
- "bullets" (when used) are short, scannable value points.
- Derive a cohesive theme: a palette of 4 HEX colors (primary, bg, fg, accent) with strong contrast between bg and fg, a real web font family name (e.g. "Inter", "Poppins"), and a one-line mood.
- "visual_direction" describes the imagery/illustration intent for that section in one sentence.
- Always respond by calling the provided tool. Never write prose.`;

export function buildPlanPrompt(userPrompt: string): string {
  return `Product / offer description:\n"""\n${userPrompt.trim()}\n"""\n\nProduce the landing page plan.`;
}

export const FINALIZE_SYSTEM = `You are an editor preparing landing-page copy for publication.
Tighten and polish the copy: sharpen headlines, ensure a consistent confident voice, fix grammar and punctuation.
Do NOT add, remove, or reorder sections, and do NOT change any section "type". Keep the theme unless a color is clearly broken.
Return the full polished plan via the tool.`;

export function buildFinalizePrompt(plan: LandingPlan): string {
  return `Plan to polish for publication:\n${JSON.stringify(stripIds(plan), null, 2)}`;
}

export const SECTION_SYSTEM = `You are a senior conversion copywriter.
Rewrite a SINGLE landing-page section. Keep the same section "type".
Write concrete, benefit-driven copy consistent with the overall product. Return the single section via the tool.`;

export function buildSectionPrompt(
  plan: LandingPlan,
  section: Section,
  instruction?: string,
): string {
  const ctx = `Product: ${plan.product.name} — ${plan.product.summary} (audience: ${plan.product.audience}).`;
  const target = `Section to rewrite (type "${section.type}"):\n${JSON.stringify(stripIds({ ...plan, sections: [section] }).sections[0], null, 2)}`;
  const ask = instruction?.trim()
    ? `\n\nApply this instruction: "${instruction.trim()}".`
    : "";
  return `${ctx}\n\n${target}${ask}`;
}

/** Remove server-only ids before showing a plan to the model. */
function stripIds(plan: LandingPlan) {
  return {
    product: plan.product,
    theme: plan.theme,
    sections: plan.sections.map((s) => ({
      type: s.type,
      headline: s.headline,
      subcopy: s.subcopy,
      bullets: s.bullets,
      cta: s.cta,
      visual_direction: s.visual_direction,
    })),
  };
}
