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
      <div className="uu-admin-container uu-admin-container-narrow">
        <section className="uu-panel uu-pro-edit-hero">
          <div>
            <div className="uu-kicker">UU MENU EDITOR</div>
            <h1 className="uu-admin-title uu-admin-title-sm">編輯菜單</h1>
            <p className="uu-admin-copy">先處理店家資訊與品項，外觀與進階工具保留在下方。</p>
          </div>

          <div className="uu-pro-edit-summary">
            <span className="uu-chip">{menu.restaurant || "未命名店家"}</span>
            <span className={`uu-chip ${menu.isPublished === false ? "" : "is-on"}`}>{menu.isPublished === false ? "已下架" : "上架中"}</span>
            <span className="uu-chip">品項 {itemCount}</span>
          </div>

          <div className="uu-form-actions uu-pro-edit-actions">
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
