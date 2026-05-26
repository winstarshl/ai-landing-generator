"use client";

import type { Theme } from "@/lib/schema";
import { contrastRatio } from "@/lib/theme";

type PaletteKey = keyof Theme["palette"];

const SWATCHES: { key: PaletteKey; label: string }[] = [
  { key: "primary", label: "primary" },
  { key: "accent", label: "accent" },
  { key: "bg", label: "bg" },
  { key: "fg", label: "fg" },
];

/** Coerce any hex to the `#rrggbb` form required by <input type="color">. */
function toHex6(color: string): string {
  const h = color.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(h)) return "#" + h.replace(/(.)/g, "$1$1");
  if (/^[0-9a-fA-F]{6}$/.test(h)) return "#" + h;
  return "#000000";
}

/** Theme card. Read-only by default; pass `onChange` to make the palette editable. */
export function ThemePreview({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange?: (theme: Theme) => void;
}) {
  const editable = !!onChange;
  const lowContrast = contrastRatio(theme.palette.bg, theme.palette.fg) < 4.5;

  function setColor(key: PaletteKey, value: string) {
    onChange?.({ ...theme, palette: { ...theme.palette, [key]: value } });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">
          Visual theme {editable && <span className="font-normal text-zinc-400">· tap a color to tweak</span>}
        </h3>
        <span className="text-xs text-zinc-400">{theme.font}</span>
      </div>

      <div className="flex items-center gap-4">
        {SWATCHES.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            {editable ? (
              <input
                type="color"
                aria-label={`${label} color`}
                value={toHex6(theme.palette[key])}
                onChange={(e) => setColor(key, e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-lg border border-black/10 bg-transparent p-0"
              />
            ) : (
              <span
                className="h-9 w-9 rounded-lg border border-black/10 shadow-sm"
                style={{ background: theme.palette[key] }}
                title={`${label}: ${theme.palette[key]}`}
              />
            )}
            <span className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs italic text-zinc-500">{theme.mood}</p>

      {editable && lowContrast && (
        <p className="mt-2 text-xs text-amber-600">
          Low text contrast — body text will be auto-adjusted on publish for readability.
        </p>
      )}
    </div>
  );
}
