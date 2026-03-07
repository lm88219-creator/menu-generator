export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMenu } from "@/lib/store";
import EditMenuForm from "./EditMenuForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DashboardEditPage({ params }: PageProps) {
  const { id } = await params;
  const menu = await getMenu(id);

  if (!menu) {
    return (
      <main className="admin-shell">
        <div className="admin-container">
          <section className="admin-list-card">
            <span className="admin-badge">Menu Editor</span>
            <h1 className="admin-page-title" style={{ marginTop: 16 }}>找不到這份菜單</h1>
            <p className="admin-page-subtitle">這份菜單可能已被刪除，或網址 ID 不存在。</p>
            <div className="admin-actions-row" style={{ marginTop: 24 }}>
              <Link href="/dashboard" className="admin-btn admin-btn-secondary">← 返回後台</Link>
              <Link href="/" className="admin-btn admin-btn-primary">＋ 新增菜單</Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const publicPath = menu.slug ? `/menu/${encodeURIComponent(menu.slug)}` : `/m/${id}`;

  return (
    <main className="admin-shell">
      <div className="admin-container">
        <section className="admin-hero-card" style={{ marginBottom: 24 }}>
          <div className="admin-hero-copy">
            <span className="admin-badge">Menu Editor Pro</span>
            <h1 className="admin-page-title">編輯菜單</h1>
            <p className="admin-page-subtitle">
              修改餐廳資訊、菜單內容、Logo 與主題風格，並即時預覽公開頁效果。
            </p>
          </div>

          <div className="admin-actions-row" style={{ alignSelf: "flex-start" }}>
            <Link href="/dashboard" className="admin-btn admin-btn-secondary">← 返回後台</Link>
            <Link href={publicPath} target="_blank" className="admin-btn admin-btn-primary">查看公開頁</Link>
          </div>
        </section>

        <EditMenuForm
          id={id}
          initialData={{
            restaurant: menu.restaurant ?? "",
            phone: menu.phone ?? "",
            address: menu.address ?? "",
            hours: menu.hours ?? "",
            menuText: menu.menuText ?? "",
            theme: menu.theme ?? "dark",
            logoDataUrl: menu.logoDataUrl ?? "",
            slug: menu.slug ?? "",
          }}
        />
      </div>
    </main>
  );
}
