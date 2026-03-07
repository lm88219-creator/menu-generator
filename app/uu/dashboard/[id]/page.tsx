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
        <div className="uu-admin-container">
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

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container">
        <section className="uu-admin-subhero uu-admin-subhero-simple">
          <div>
            <div className="uu-kicker">UU MENU EDITOR</div>
            <h1 className="uu-admin-title">編輯菜單</h1>
            <p className="uu-admin-copy">已改成簡單型後台：移除右側大預覽，保留最常用的編輯功能。</p>
          </div>
          <div className="uu-form-actions">
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
