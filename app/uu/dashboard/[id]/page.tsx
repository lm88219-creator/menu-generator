export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getMenu } from "@/lib/store";
import EditMenuForm from "@/app/dashboard/[id]/EditMenuForm";

export default async function UUDashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const menu = await getMenu(id);

  if (!menu) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#fff", background: "#000" }}><div>找不到菜單</div></main>;
  }

  const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || id)}`;

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #1a1a1a 0%, #0b0b0b 45%, #000 100%)", color: "#fff", padding: "32px 16px 60px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "#bdbdbd", fontSize: 13, marginBottom: 12 }}>UU Menu Editor</div>
            <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.2, fontWeight: 800 }}>編輯菜單</h1>
            <p style={{ marginTop: 10, marginBottom: 0, color: "#a9a9a9", fontSize: 15, lineHeight: 1.8 }}>可切換文字輸入與表單輸入，並設定上架狀態與桌號 QR。</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/uu/dashboard" style={ghostButtonStyle}>← 返回後台</Link>
            <Link href={publicPath} target="_blank" style={primaryButtonStyle}>查看公開頁</Link>
          </div>
        </div>
        <EditMenuForm id={id} initialData={{ restaurant: menu.restaurant ?? "", phone: menu.phone ?? "", address: menu.address ?? "", hours: menu.hours ?? "", menuText: menu.menuText ?? "", theme: menu.theme ?? "dark", logoDataUrl: menu.logoDataUrl ?? "", slug: menu.slug ?? "", isPublished: menu.isPublished !== false }} />
      </div>
    </main>
  );
}

const ghostButtonStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderRadius: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontWeight: 700 };
const primaryButtonStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderRadius: 14, textDecoration: "none", background: "#fff", color: "#000", fontSize: 14, fontWeight: 800, boxShadow: "0 10px 24px rgba(0,0,0,0.16)" };
