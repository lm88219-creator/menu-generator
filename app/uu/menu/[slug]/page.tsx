export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getPublicMenuPath } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ table?: string }>;
};

export default async function LegacyUuMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = (searchParams ? await searchParams : {}) ?? {};
  const table = String(query.table ?? "").trim();
  const suffix = table ? `?table=${encodeURIComponent(table)}` : "";
  redirect(`${getPublicMenuPath(slug)}${suffix}`);
}
