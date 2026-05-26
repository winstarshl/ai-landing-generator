import type { LandingPage, RenderableSection } from "@/lib/schema";
import { themeToCssVars } from "@/lib/theme";
import { googleFontHref } from "@/lib/fonts";
import { SECTION_COMPONENTS } from "./sections";

/** Render one section by looking up its type in the component registry. */
export function RenderSection({ section }: { section: RenderableSection }) {
  const Cmp = SECTION_COMPONENTS[section.type];
  if (!Cmp) return null;
  return <Cmp section={section} />;
}

/** Render a full finalized landing page with its theme applied via CSS variables. */
export function RenderLanding({ page }: { page: LandingPage }) {
  const style = {
    ...themeToCssVars(page.theme),
    background: "var(--lp-bg)",
    color: "var(--lp-fg)",
    fontFamily: "var(--lp-font), ui-sans-serif, system-ui, sans-serif",
  } as React.CSSProperties;

  return (
    <div data-testid="landing-root" style={style}>
      {/* Load the theme's web font (hoisted to <head> by React; harmless 404 + system fallback if not on Google Fonts). */}
      <link rel="stylesheet" href={googleFontHref(page.theme.font)} />
      {page.sections.map((section) => (
        <RenderSection key={section.id} section={section} />
      ))}
    </div>
  );
}
