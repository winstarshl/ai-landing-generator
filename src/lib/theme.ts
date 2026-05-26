import type { Theme } from "./schema";

/** Map a theme to inline CSS custom properties consumed by section components. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  return {
    "--lp-primary": theme.palette.primary,
    "--lp-bg": theme.palette.bg,
    "--lp-fg": theme.palette.fg,
    "--lp-accent": theme.palette.accent,
    "--lp-font": theme.font,
  } as Record<string, string>;
}

/** Stable non-negative hash for deterministic visuals. */
export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
