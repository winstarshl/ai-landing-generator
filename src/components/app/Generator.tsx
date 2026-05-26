"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wand, RefreshCw } from "lucide-react";
import { LandingPlanSchema, type LandingPlan, type Section } from "@/lib/schema";
import { postJSON } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemePreview } from "./ThemePreview";
import { SectionEditor } from "./SectionEditor";

const STORAGE_KEY = "landingforge:plan";

const EXAMPLES = [
  "An online course that teaches busy professionals to cook in 15 minutes",
  "A SaaS tool that turns meeting recordings into action items",
  "A specialty coffee subscription for remote workers",
  "A mobile app that helps runners train for their first marathon",
];

type Step = "input" | "review";

export function Generator() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<LandingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const { plan } = await postJSON<{ plan: LandingPlan }>("/api/generate-plan", {
        prompt: prompt.trim(),
      });
      setPlan(plan);
      persist(plan);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
      const { token } = await postJSON<{ token: string }>("/api/finalize", { plan });
      persist(null);
      router.push(`/p/${token}`);
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
          <p className="text-xs text-zinc-500">AI landing page generator</p>
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
                  <RefreshCw className="h-4 w-4 animate-spin" /> Drafting your plan…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate plan
                </>
              )}
            </Button>
          </div>

          {loading && <DraftSkeleton />}
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
            <ThemePreview theme={plan.theme} />
          </div>

          <div className="space-y-4">
            {plan.sections.map((section, i) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={i}
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

function DraftSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="h-3 w-24 rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-3/4 rounded bg-zinc-100" />
          <div className="mt-2 h-4 w-1/2 rounded bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}
