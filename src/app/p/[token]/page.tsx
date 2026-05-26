import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodePage } from "@/lib/pagecodec";
import { RenderLanding } from "@/components/registry";
import { PublishedBar } from "@/components/app/PublishedBar";

export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const page = decodePage(token);
  return {
    title: page ? `${page.product.name} — Landing page` : "Landing page",
    description: page?.product.summary,
  };
}

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const page = decodePage(token);
  if (!page) notFound();

  return (
    <div className="pb-12">
      <RenderLanding page={page} />
      <PublishedBar />
    </div>
  );
}
