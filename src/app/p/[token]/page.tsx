import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePage } from "@/lib/store";
import { RenderLanding } from "@/components/registry";
import { PublishedBar } from "@/components/app/PublishedBar";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const page = await resolvePage(token);
  const title = page ? `${page.product.name} — Landing page` : "Landing page";
  const description = page?.product.summary;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const page = await resolvePage(token);
  if (!page) notFound();

  return (
    <div className="pb-12">
      <RenderLanding page={page} />
      <PublishedBar />
    </div>
  );
}
