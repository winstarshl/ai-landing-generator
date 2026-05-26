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

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.replace(/(.)/g, "$1$1") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two hex colors (1–21). Returns 1 if either is unparsable. */
export function contrastRatio(a: string, b: string): number {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return 1;
  const la = relativeLuminance(ra);
  const lb = relativeLuminance(rb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const NEAR_BLACK = "#111827";
const NEAR_WHITE = "#f8fafc";

/** Pick a foreground that meets WCAG AA (4.5:1) on the given background. */
export function readableForeground(bg: string, fg: string): string {
  if (contrastRatio(bg, fg) >= 4.5) return fg;
  return contrastRatio(bg, NEAR_BLACK) >= contrastRatio(bg, NEAR_WHITE) ? NEAR_BLACK : NEAR_WHITE;
}

/** Ensure body text is readable on the theme background (auto-fix low-contrast model output). */
export function normalizeTheme(theme: Theme): Theme {
  return {
    ...theme,
    palette: { ...theme.palette, fg: readableForeground(theme.palette.bg, theme.palette.fg) },
  };
}
