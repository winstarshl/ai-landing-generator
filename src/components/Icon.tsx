import {
  Sparkles,
  CircleCheck,
  LayoutGrid,
  Star,
  Tag,
  CircleHelp,
  ArrowRight,
  Square,
} from "lucide-react";
import type { ComponentType } from "react";

const MAP: Record<string, ComponentType<{ className?: string }>> = {
  Sparkles,
  CircleCheck,
  LayoutGrid,
  Star,
  Tag,
  CircleHelp,
  ArrowRight,
  Square,
};

/** Render a lucide icon by name (used for deterministic mock visuals). */
export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? Square;
  return <Cmp className={className} />;
}
