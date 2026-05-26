"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wand, RefreshCw, Check, Circle } from "lucide-react";
import { LandingPlanSchema, type LandingPlan, type Section, type Theme } from "@/lib/schema";
import { postJSON } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemePreview } from "./ThemePreview";
import { SectionEditor } from "./SectionEditor";
import { LivePreview } from "./LivePreview";

const STORAGE_KEY = "landingforge:plan";

const EXAMPLES = [
  "An online course that teaches busy professionals to cook in 15 minutes",
  "A SaaS tool that turns meeting recordings into action items",
  "A specialty coffee subscription for remote workers",
  "A mobile app that helps runners train for their first marathon",
];

type Step = "input" | "review";
type Stage = "planning" | "refining";

export function Generator() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<LandingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [stage, setStage] = useState<Stage | null>(null);

  // Restore an in-progress draft so a refresh doesn't lose work.
  // SSR-safe one-time hydration: server + first client paint render "input",
  // then we adopt any stored draft. setState-in-effect is intentional here.
  useEffect(() => {
    const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = LandingPlanSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time SSR-safe hydration
      setPlan(parsed.data);
      setStep("review");
    }
  }, []);

  function persist(next: LandingPlan | null) {
    if (typeof window === "undefined") return;
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }

  async function generate() {
    if (prompt.trim().length < 3) {
      setError("Describe your product in a sentence or two first.");
      return;
    }
    setError(null);
    setLoading(true);
    setStage("planning");
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let received: LandingPlan | null = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          const evt = JSON.parse(line) as { stage?: string; plan?: LandingPlan; error?: string };
          if (evt.error) throw new Error(evt.error);
          if (evt.stage === "done" && evt.plan) received = evt.plan;
          else if (evt.stage === "planning" || evt.stage === "refining") setStage(evt.stage);
        }
      }

      if (!received) throw new Error("No plan was returned.");
      setPlan(received);
      persist(received);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setStage(null);
    }
  }

  function updateTheme(theme: Theme) {
    setPlan((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, theme };
      persist(updated);
      return updated;
    });
  }

  function updateSection(id: string, next: Section) {
    setPlan((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, sections: prev.sections.map((s) => (s.id === id ? next : s)) };
      persist(updated);
      return updated;
    });
  }

  async function regenerate(id: string, instruction: string) {
    if (!plan) return;
    setError(null);
    setRegeneratingId(id);
    try {
      const { plan: next } = await postJSON<{ plan: LandingPlan }>("/api/regenerate-section", {
        plan,
        sectionId: id,
        instruction: instruction.trim() || undefined,
      });
      setPlan(next);
      persist(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not regenerate that section.");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function approve() {
    if (!plan) return;
    setError(null);
    setFinalizing(true);
    try {
      const { id } = await postJSON<{ id: string }>("/api/finalize", { plan });
      persist(null);
      router.push(`/p/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the final page.");
      setFinalizing(false);
    }
  }

  function startOver() {
    setPlan(null);
    persist(null);
    setPrompt("");
    setStep("input");
    setError(null);
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <header className="mb-8 flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Wand className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold leading-none">LandingForge</h1>
          <p className="text-xs text-zinc-500">AI landing page generator · by winstarshl</p>
        </div>
      </header>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "input" && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Describe your product. Get a landing page.
          </h2>
          <p className="mt-2 text-zinc-500">
            We draft the structure, copy, and visual direction. You review, tweak, and publish.
          </p>

          <div className="mt-6">
            <Textarea
              rows={4}
              placeholder="e.g. A meal-planning app for families that turns a weekly budget into a shopping list…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  disabled={loading}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
                </button>
              ))}
            </div>

            <Button className="mt-5 w-full sm:w-auto" onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate plan
                </>
              )}
            </Button>
          </div>

          {loading && <GenerationStages stage={stage} />}
        </section>
      )}

      {step === "review" && plan && (
        <section className="pb-28">
          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Draft plan
            </p>
            <h2 className="mt-1 text-xl font-bold">{plan.product.name}</h2>
            <p className="mt-1 text-sm text-zinc-600">{plan.product.summary}</p>
            <p className="mt-2 text-xs text-zinc-400">Audience: {plan.product.audience}</p>
          </div>

          <div className="mb-5">
            <ThemePreview theme={plan.theme} onChange={updateTheme} />
          </div>

          <div className="mb-5">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPreviewOpen((v) => !v)}
            >
              {previewOpen ? "Hide live preview" : "Show live mobile preview"}
            </Button>
            {previewOpen && (
              <div className="mt-4">
                <LivePreview plan={plan} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {plan.sections.map((section, i) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={i}
                theme={plan.theme}
                onChange={(next) => updateSection(section.id, next)}
                onRegenerate={(instruction) => regenerate(section.id, instruction)}
                regenerating={regeneratingId === section.id}
              />
            ))}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3">
              <Button variant="ghost" onClick={startOver} disabled={finalizing}>
                Start over
              </Button>
              <Button onClick={approve} disabled={finalizing}>
                {finalizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Building page…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Approve &amp; generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

const STAGE_STEPS: { key: Stage; label: string }[] = [
  { key: "planning", label: "Drafting structure & copy" },
  { key: "refining", label: "Refining & polishing" },
];

function GenerationStages({ stage }: { stage: Stage | null }) {
  const currentIdx = stage ? STAGE_STEPS.findIndex((s) => s.key === stage) : 0;
  return (
    <div className="mt-8 space-y-3" aria-label="Generation progress">
      {STAGE_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div
            key={s.key}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <span
              className={
                done
                  ? "flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"
                  : active
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white"
                    : "flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-400"
              }
            >
              {done ? (
                <Check className="h-3.5 w-3.5" />
              ) : active ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </span>
            <span
              className={
                done ? "text-sm text-zinc-500" : active ? "text-sm font-medium" : "text-sm text-zinc-400"
              }
            >
              {s.label}
              {active ? "…" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
