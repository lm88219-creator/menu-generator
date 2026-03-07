export const dynamic = "force-dynamic";

import { getMenu } from "@/lib/store";
import { redirect } from "next/navigation";

export default async function LegacyIdPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ table?: string }> }) {
  const { id } = await params;
  const data = await getMenu(id);
  if (!data?.slug) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif" }}>
        <div>找不到菜單</div>
      </main>
    );
  }
  const query = (searchParams ? await searchParams : {}) ?? {};
  const table = String(query.table ?? "").trim();
  const suffix = table ? `?table=${encodeURIComponent(table)}` : "";
  redirect(`/uu/menu/${encodeURIComponent(data.slug)}${suffix}`);
}
