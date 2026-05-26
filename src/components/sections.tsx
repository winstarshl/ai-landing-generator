import type { ComponentType } from "react";
import type { Cta, RenderableSection, SectionType } from "@/lib/schema";
import { Icon } from "./Icon";

/* ----------------------------- shared bits ----------------------------- */

function CtaButton({ cta, solid = true }: { cta?: Cta; solid?: boolean }) {
  if (!cta) return null;
  return (
    <a
      href={cta.href || "#"}
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition hover:opacity-90"
      style={
        solid
          ? { background: "var(--lp-primary)", color: "#fff" }
          : { background: "#fff", color: "var(--lp-primary)" }
      }
    >
      {cta.label}
      <Icon name="ArrowRight" className="h-4 w-4" />
    </a>
  );
}

function Eyebrow({ section }: { section: RenderableSection }) {
  return (
    <span
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow"
      style={{ background: section.visual.gradient }}
    >
      <Icon name={section.visual.icon} className="h-5 w-5" />
    </span>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-5">{children}</div>;
}

/* ------------------------------- sections ------------------------------- */

function Hero({ section }: { section: RenderableSection }) {
  return (
    <section
      className="relative overflow-hidden px-5 py-20 text-center sm:py-28"
      style={{ background: section.visual.gradient }}
    >
      <div className="mx-auto max-w-3xl text-white">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {section.headline}
        </h1>
        {section.subcopy && (
          <p className="mx-auto mt-5 max-w-xl text-base text-white/90 sm:text-lg">
            {section.subcopy}
          </p>
        )}
        {section.cta && (
          <div className="mt-8">
            <CtaButton cta={section.cta} solid={false} />
          </div>
        )}
      </div>
    </section>
  );
}

function Benefits({ section }: { section: RenderableSection }) {
  return (
    <section className="py-16" style={{ background: "var(--lp-bg)" }}>
      <Container>
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Eyebrow section={section} />
          <h2 className="text-2xl font-bold sm:text-3xl">{section.headline}</h2>
          {section.subcopy && <p className="max-w-2xl opacity-70">{section.subcopy}</p>}
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {(section.bullets ?? []).map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-black/5 bg-black/[0.02] p-5"
            >
              <Icon name="CircleCheck" className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Features({ section }: { section: RenderableSection }) {
  return (
    <section className="py-16" style={{ background: "var(--lp-bg)" }}>
      <Container>
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{section.headline}</h2>
          {section.subcopy && <p className="mt-3 opacity-70">{section.subcopy}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {(section.bullets ?? []).map((b, i) => (
            <div key={i} className="rounded-2xl border border-black/5 p-6">
              <span
                className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white"
                style={{ background: "var(--lp-accent)" }}
              >
                <Icon name="LayoutGrid" className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SocialProof({ section }: { section: RenderableSection }) {
  return (
    <section className="py-16" style={{ background: "var(--lp-bg)" }}>
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl border border-black/5 bg-black/[0.02] p-8 text-center sm:p-12">
          <div className="mb-4 flex justify-center gap-1" style={{ color: "var(--lp-accent)" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} name="Star" className="h-5 w-5" />
            ))}
          </div>
          <h2 className="text-xl font-semibold sm:text-2xl">{section.headline}</h2>
          {section.subcopy && <p className="mt-4 opacity-70">{section.subcopy}</p>}
          <ul className="mt-6 space-y-3">
            {(section.bullets ?? []).map((b, i) => (
              <li key={i} className="text-sm italic opacity-80">
                “{b}”
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function Pricing({ section }: { section: RenderableSection }) {
  return (
    <section className="py-16" style={{ background: "var(--lp-bg)" }}>
      <Container>
        <div className="mx-auto max-w-md rounded-3xl border-2 p-8 text-center" style={{ borderColor: "var(--lp-primary)" }}>
          <Eyebrow section={section} />
          <h2 className="mt-4 text-2xl font-bold">{section.headline}</h2>
          {section.subcopy && <p className="mt-2 opacity-70">{section.subcopy}</p>}
          <ul className="my-6 space-y-2 text-left">
            {(section.bullets ?? []).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Icon name="CircleCheck" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {section.cta && <CtaButton cta={section.cta} />}
        </div>
      </Container>
    </section>
  );
}

function Faq({ section }: { section: RenderableSection }) {
  return (
    <section className="py-16" style={{ background: "var(--lp-bg)" }}>
      <Container>
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">{section.headline}</h2>
        <div className="mx-auto max-w-2xl divide-y divide-black/5">
          {(section.bullets ?? []).map((b, i) => (
            <div key={i} className="flex items-start gap-3 py-4">
              <Icon name="CircleHelp" className="mt-0.5 h-5 w-5 shrink-0 opacity-60" />
              <p className="text-sm leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CallToAction({ section }: { section: RenderableSection }) {
  return (
    <section className="px-5 py-20 text-center text-white" style={{ background: section.visual.gradient }}>
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold sm:text-4xl">{section.headline}</h2>
        {section.subcopy && <p className="mt-4 text-white/90">{section.subcopy}</p>}
        {section.cta && (
          <div className="mt-8">
            <CtaButton cta={section.cta} solid={false} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------- registry ------------------------------- */

export const SECTION_COMPONENTS: Record<
  SectionType,
  ComponentType<{ section: RenderableSection }>
> = {
  hero: Hero,
  benefits: Benefits,
  features: Features,
  socialProof: SocialProof,
  pricing: Pricing,
  faq: Faq,
  cta: CallToAction,
};
