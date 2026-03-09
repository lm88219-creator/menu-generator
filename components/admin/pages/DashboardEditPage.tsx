export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getMenu } from "@/lib/store";
import EditMenuForm from "@/components/admin/forms/EditMenuForm";
import CopyUrlButton from "@/components/admin/CopyUrlButton";
import { getConfiguredSiteUrl } from "@/lib/site";
import { normalizeTheme } from "@/lib/theme";
import { getPublicMenuPath, ROUTES } from "@/lib/routes";

export default async function DashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
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
            <Link href={ROUTES.dashboard} className="uu-btn uu-btn-secondary">返回後台</Link>
          </section>
        </div>
      </main>
    );
  }

  const publicPath = getPublicMenuPath(menu.slug || id);
  const baseUrl = getConfiguredSiteUrl();
  const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
  const itemCount = String(menu.menuText || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /\d/.test(line)).length;

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow uu-editor-page-v4 uu-editor-page-v7">
        <section className="uu-panel uu-editor-page-hero uu-editor-page-hero-v7">
          <div className="uu-editor-page-hero-main-v7">
            <div>
              <div className="uu-kicker">UU MENU EDITOR</div>
              <h1 className="uu-dashboard-title">編輯菜單</h1>
              <p className="uu-dashboard-copy">先更新店家資料與菜單內容，最後再檢查公開頁與桌號工具。</p>
            </div>

            <div className="uu-dashboard-store-meta-v7 uu-editor-page-meta-v7">
              <span className="uu-dashboard-meta-chip">{menu.restaurant || "未命名店家"}</span>
              <span className="uu-dashboard-meta-chip">{itemCount} 項菜單</span>
              <span className="uu-dashboard-meta-chip">{menu.isPublished === false ? "已下架" : "上架中"}</span>
            </div>
          </div>

          <div className="uu-editor-page-actions uu-editor-page-actions-v7">
            <Link href={ROUTES.dashboard} className="uu-btn uu-btn-secondary">返回後台</Link>
            <Link href={publicPath} target="_blank" className="uu-btn uu-btn-primary">打開公開頁</Link>
            <CopyUrlButton url={publicUrl} />
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
            theme: normalizeTheme(menu.theme),
            logoDataUrl: menu.logoDataUrl ?? "",
            slug: menu.slug ?? "",
            isPublished: menu.isPublished !== false,
          }}
        />
      </div>
    </main>
  );
}
