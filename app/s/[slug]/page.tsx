export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getMenuIdBySlug } from "@/lib/store";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ table?: string }>;
};

export default async function ShortSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = (searchParams ? await searchParams : {}) ?? {};
  const id = await getMenuIdBySlug(slug);

  if (!id) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Arial, sans-serif', background: 'radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 560, width: '100%', borderRadius: 24, padding: 28, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 style={{ margin: 0, fontSize: 30 }}>找不到這個公開網址</h1>
          <p style={{ marginTop: 12, color: '#aaa', lineHeight: 1.8 }}>這個自訂網址可能尚未建立、已被刪除，或輸入錯誤。</p>
          <a href="/" style={{ display: 'inline-block', marginTop: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none' }}>← 返回首頁</a>
        </div>
      </main>
    );
  }

  const tableSuffix = query.table ? `?table=${encodeURIComponent(query.table)}` : "";
  redirect(`/m/${id}${tableSuffix}`);
}
