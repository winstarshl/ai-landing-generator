import type { Section, Theme, Visual, SectionType } from "./schema";
import { hashString } from "./theme";

/** Lucide icon name per section type (mock visual accent). */
const ICON_BY_TYPE: Record<SectionType, string> = {
  hero: "Sparkles",
  benefits: "CircleCheck",
  features: "LayoutGrid",
  socialProof: "Star",
  pricing: "Tag",
  faq: "CircleHelp",
  cta: "ArrowRight",
};

/**
 * Deterministically derive a mock visual (themed gradient + icon) for a section.
 * No external image service and no LLM call — fast, free, reproducible.
 */
export function resolveVisual(section: Section, theme: Theme): Visual {
  const { primary, accent } = theme.palette;
  const angle = hashString(section.id + section.headline) % 360;
  const gradient = `linear-gradient(${angle}deg, ${primary}, ${accent})`;
  return {
    kind: "gradient",
    gradient,
    icon: ICON_BY_TYPE[section.type] ?? "Square",
  };
}
