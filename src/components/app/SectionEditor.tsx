"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Section } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const FIELD =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white";

export function SectionEditor({
  section,
  index,
  onChange,
  onRegenerate,
  regenerating,
}: {
  section: Section;
  index: number;
  onChange: (next: Section) => void;
  onRegenerate: (instruction: string) => void;
  regenerating: boolean;
}) {
  const [instruction, setInstruction] = useState("");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {index + 1}. {section.type}
        </span>
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
