import { z } from "zod";

/**
 * Single source of truth for the landing-plan data model.
 * - `ModelPlanSchema`  — what the LLM is asked to return (no ids, no visuals).
 * - `LandingPlanSchema` — internal draft (server assigns section ids).
 * - `LandingPageSchema` — finalized, render-ready (ids + resolved visuals).
 */

export const SECTION_TYPES = [
  "hero",
  "benefits",
  "features",
  "socialProof",
  "pricing",
  "faq",
  "cta",
] as const;

export const SectionTypeSchema = z.enum(SECTION_TYPES);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const CtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().optional(),
});
export type Cta = z.infer<typeof CtaSchema>;

export const PaletteSchema = z.object({
  primary: z.string().min(1),
  bg: z.string().min(1),
  fg: z.string().min(1),
  accent: z.string().min(1),
});

export const ThemeSchema = z.object({
  palette: PaletteSchema,
  font: z.string().min(1),
  mood: z.string().min(1),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const ProductSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  audience: z.string().min(1),
});

/** Section as produced by the model (no id / no resolved visual). */
export const ModelSectionSchema = z.object({
  type: SectionTypeSchema,
  headline: z.string().min(1),
  subcopy: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  cta: CtaSchema.optional(),
  visual_direction: z.string().min(1),
});
export type ModelSection = z.infer<typeof ModelSectionSchema>;

export const ModelPlanSchema = z.object({
  product: ProductSchema,
  theme: ThemeSchema,
  sections: z.array(ModelSectionSchema).min(1),
});
export type ModelPlan = z.infer<typeof ModelPlanSchema>;

/** Draft section: model section + server-assigned id. */
export const SectionSchema = ModelSectionSchema.extend({
  id: z.string().min(1),
});
export type Section = z.infer<typeof SectionSchema>;

export const LandingPlanSchema = z.object({
  product: ProductSchema,
  theme: ThemeSchema,
  sections: z.array(SectionSchema).min(1),
});
export type LandingPlan = z.infer<typeof LandingPlanSchema>;

/** Deterministic mock visual attached at finalize time. */
export const VisualSchema = z.object({
  kind: z.literal("gradient"),
  gradient: z.string().min(1),
  icon: z.string().min(1),
});
export type Visual = z.infer<typeof VisualSchema>;

export const RenderableSectionSchema = SectionSchema.extend({
  visual: VisualSchema,
});
export type RenderableSection = z.infer<typeof RenderableSectionSchema>;

export const LandingPageSchema = z.object({
  product: ProductSchema,
  theme: ThemeSchema,
  sections: z.array(RenderableSectionSchema).min(1),
});
export type LandingPage = z.infer<typeof LandingPageSchema>;
