"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Section, Theme } from "@/lib/schema";
import { resolveVisual } from "@/lib/visuals";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const FIELD =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white";

export function SectionEditor({
  section,
  index,
  theme,
  onChange,
  onRegenerate,
  regenerating,
}: {
  section: Section;
  index: number;
  theme: Theme;
  onChange: (next: Section) => void;
  onRegenerate: (instruction: string) => void;
  regenerating: boolean;
}) {
  const [instruction, setInstruction] = useState("");
  const visual = resolveVisual(section, theme);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {index + 1}. {section.type}
        </span>
      </div>

      {/* Visual direction + live mock-visual preview (what the final section will use). */}
      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow"
          style={{ background: visual.gradient }}
          data-testid={`visual-preview-${index}`}
          aria-hidden
        >
          <Icon name={visual.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Visual direction</label>
          <input
            aria-label={`Section ${index + 1} visual direction`}
            className={FIELD}
            value={section.visual_direction}
            onChange={(e) => onChange({ ...section, visual_direction: e.target.value })}
          />
        </div>
      </div>

      <label className="mb-1 block text-xs font-medium text-zinc-500">Headline</label>
      <input
        aria-label={`Section ${index + 1} headline`}
        className={FIELD}
        value={section.headline}
        onChange={(e) => onChange({ ...section, headline: e.target.value })}
      />

      <label className="mb-1 mt-3 block text-xs font-medium text-zinc-500">Sub-copy</label>
      <Textarea
        rows={2}
        className="bg-zinc-50 p-3 text-sm"
        value={section.subcopy ?? ""}
        onChange={(e) => onChange({ ...section, subcopy: e.target.value })}
      />

      {section.bullets && (
        <>
          <label className="mb-1 mt-3 block text-xs font-medium text-zinc-500">
            Bullets (one per line)
          </label>
          <Textarea
            rows={Math.max(2, section.bullets.length)}
            className="bg-zinc-50 p-3 text-sm"
            value={section.bullets.join("\n")}
            onChange={(e) =>
              onChange({
                ...section,
                bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </>
      )}

      {section.cta && (
        <>
          <label className="mb-1 mt-3 block text-xs font-medium text-zinc-500">CTA label</label>
          <input
            aria-label={`Section ${index + 1} CTA label`}
            className={FIELD}
            value={section.cta.label}
            onChange={(e) =>
              onChange({ ...section, cta: { ...section.cta!, label: e.target.value } })
            }
          />
        </>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-3 sm:flex-row">
        <input
          className={FIELD}
          placeholder="Optional: how should AI rewrite this section?"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={regenerating}
        />
        <Button
          variant="outline"
          className="shrink-0"
          disabled={regenerating}
          onClick={() => onRegenerate(instruction)}
        >
          <RefreshCw className={regenerating ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {regenerating ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>
    </div>
  );
}
