"use client";

import { useMemo } from "react";
import type { LandingPage, LandingPlan } from "@/lib/schema";
import { resolveVisual } from "@/lib/visuals";
import { RenderLanding } from "@/components/registry";

/**
 * Live, in-frame mobile preview of the current draft. Mock visuals are resolved
 * client-side (same deterministic logic as finalize) so the user sees exactly
 * what the published page will look like — before approving.
 */
export function LivePreview({ plan }: { plan: LandingPlan }) {
  const page: LandingPage = useMemo(
    () => ({
      product: plan.product,
      theme: plan.theme,
      sections: plan.sections.map((s) => ({ ...s, visual: resolveVisual(s, plan.theme) })),
    }),
    [plan],
  );

  return (
    <div
      className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[2.2rem] border-[8px] border-zinc-800 bg-zinc-800 shadow-2xl"
      data-testid="live-preview"
    >
      <div className="max-h-[68vh] overflow-y-auto rounded-[1.5rem] bg-white">
        <RenderLanding page={page} />
      </div>
    </div>
  );
}
