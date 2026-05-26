import { ImageResponse } from "next/og";
import { resolvePage } from "@/lib/store";

export const runtime = "nodejs";
export const alt = "Landing page preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamic share-card image: the product name + summary on the landing's own theme gradient. */
export default async function OgImage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const page = await resolvePage(token);

  const name = page?.product.name ?? "LandingForge";
  const summary = page?.product.summary ?? "Describe a product, get a polished landing page.";
  const primary = page?.theme.palette.primary ?? "#4f46e5";
  const accent = page?.theme.palette.accent ?? "#22d3ee";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, opacity: 0.9 }}>
          LandingForge · by winstarshl
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 800, lineHeight: 1.05 }}>
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 24, opacity: 0.92, maxWidth: 1040 }}>
            {summary.length > 150 ? summary.slice(0, 150) + "…" : summary}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>
          Generated landing page
        </div>
      </div>
    ),
    size,
  );
}
