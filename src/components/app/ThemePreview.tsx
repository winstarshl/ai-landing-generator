import type { Theme } from "@/lib/schema";

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="h-9 w-9 rounded-lg border border-black/10 shadow-sm"
        style={{ background: color }}
        title={`${label}: ${color}`}
      />
      <span className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</span>
    </div>
  );
}

export function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700">Visual theme</h3>
        <span className="text-xs text-zinc-400">{theme.font}</span>
      </div>
      <div className="flex items-center gap-4">
        <Swatch color={theme.palette.primary} label="primary" />
        <Swatch color={theme.palette.accent} label="accent" />
        <Swatch color={theme.palette.bg} label="bg" />
        <Swatch color={theme.palette.fg} label="fg" />
      </div>
      <p className="mt-3 text-xs italic text-zinc-500">{theme.mood}</p>
    </div>
  );
}
