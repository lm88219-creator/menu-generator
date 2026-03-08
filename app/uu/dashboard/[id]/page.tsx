export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getMenu } from "@/lib/store";
import EditMenuForm from "./EditMenuForm";
import CopyUrlButton from "@/components/admin/CopyUrlButton";
import { getConfiguredSiteUrl } from "@/lib/site";
import { normalizeTheme } from "@/lib/theme";

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
  const baseUrl = getConfiguredSiteUrl();
  const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
  const itemCount = String(menu.menuText || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /\d/.test(line)).length;
  const isPublished = menu.isPublished !== false;

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow uu-editor-page-v6">
        <section className="uu-editor-topbar-v6">
          <div className="uu-editor-topbar-copy">
            <span className="uu-editor-kicker-v6">UU MENU EDITOR</span>
            <h1>編輯菜單</h1>
            <p>重新整理桌機版與手機版排版，讓主要操作集中、資訊層次更清楚。</p>
          </div>

          <div className="uu-editor-topbar-meta">
            <div className="uu-editor-topbar-badges">
              <span>{isPublished ? "公開中" : "未公開"}</span>
              <span>{itemCount} 項品項</span>
              <span>{normalizeTheme(menu.theme)}</span>
            </div>
            <div className="uu-editor-topbar-actions">
              <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">返回後台</Link>
              <Link href={publicPath} target="_blank" className="uu-btn uu-btn-primary">打開公開頁</Link>
              <CopyUrlButton url={publicUrl} />
            </div>
          </div>
        </section>

        <nav className="uu-editor-anchor-v6" aria-label="編輯頁導覽">
          <a href="#shop-info">店家資訊</a>
          <a href="#menu-items">菜單品項</a>
          <a href="#appearance-settings">外觀設定</a>
          <a href="#advanced-tools">進階工具</a>
        </nav>

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
            isPublished,
          }}
        />
      </div>

    </main>
  );
}
