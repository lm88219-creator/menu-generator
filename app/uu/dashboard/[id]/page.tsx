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
          <section className="uu-panel uu-empty-state">
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
      <div className="uu-admin-container uu-admin-container-narrow">
        <section className="uu-panel uu-edit-page-hero-v2">
          <div className="uu-edit-page-hero-copy">
            <div className="uu-kicker">UU MENU EDITOR</div>
            <h1 className="uu-admin-title uu-admin-title-sm">編輯菜單</h1>
            <p className="uu-admin-copy">把最常用的操作固定在上面，表單改成更乾淨的區塊式，下面直接編輯品項。</p>
          </div>

          <div className="uu-edit-hero-stats">
            <div className="uu-chip">{menu.restaurant || "未命名店家"}</div>
            <div className={`uu-chip ${menu.isPublished === false ? "" : "is-on"}`}>{menu.isPublished === false ? "已下架" : "上架中"}</div>
            <div className="uu-chip">品項約 {itemCount} 筆</div>
          </div>

          <div className="uu-form-actions uu-edit-page-hero-actions">
            <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">返回後台</Link>
            <Link href={publicPath} target="_blank" className="uu-btn uu-btn-primary">查看公開頁</Link>
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
            theme: (menu.theme ?? "dark") as "dark" | "light" | "warm" | "ocean" | "forest" | "rose",
            logoDataUrl: menu.logoDataUrl ?? "",
            slug: menu.slug ?? "",
            isPublished: menu.isPublished !== false,
          }}
        />
      </div>
    </main>
  );
}
