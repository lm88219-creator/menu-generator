export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getMenu } from "@/lib/store";
import EditMenuForm from "./EditMenuForm";

export default async function UUDashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const menu = await getMenu(id);

  if (!menu) {
    return (
      <main className="uu-admin-shell">
        <div className="uu-admin-container uu-admin-container-narrow">
          <section className="uu-panel uu-empty-state uu-empty-state-pro">
            <h2>找不到這份菜單</h2>
            <p>這份菜單可能已經被刪除，或是網址 ID 不存在。</p>
            <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">返回後台</Link>
          </section>
        </div>
      </main>
    );
  }

  const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || id)}`;
  const itemCount = String(menu.menuText || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /\d/.test(line)).length;

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow uu-editor-page-v4">
        <section className="uu-panel uu-editor-page-hero">
          <div>
            <div className="uu-kicker">UU MENU EDITOR</div>
            <h1 className="uu-dashboard-title">編輯菜單</h1>
            <p className="uu-dashboard-copy">把常用資訊、網址與儲存操作集中在前面，減少來回切換。</p>
          </div>

          <div className="uu-editor-page-meta">
            <span className="uu-chip">{menu.restaurant || "未命名店家"}</span>
            <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
              {menu.isPublished === false ? "已下架" : "上架中"}
            </span>
            <span className="uu-chip">共 {itemCount} 個品項</span>
          </div>

          <div className="uu-editor-page-actions">
            <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">返回後台</Link>
            <Link href={publicPath} target="_blank" className="uu-btn uu-btn-primary">打開公開頁</Link>
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
            theme: (menu.theme ?? "dark") as "dark" | "light" | "warm" | "ocean" | "forest" | "rose" | "market",
            logoDataUrl: menu.logoDataUrl ?? "",
            slug: menu.slug ?? "",
            isPublished: menu.isPublished !== false,
          }}
        />
      </div>
    </main>
  );
}
