export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getMenu } from "@/lib/store";
import EditMenuForm from "@/components/admin/forms/EditMenuForm";
import CopyUrlButton from "@/components/admin/CopyUrlButton";
import { getConfiguredSiteUrl } from "@/lib/site";
import { normalizeTheme } from "@/lib/theme";

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

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow uu-editor-page-v4">
        <section className="uu-panel uu-editor-page-hero uu-editor-page-hero-v5">
          <div className="uu-editor-page-hero-layout-v6">
            <div className="uu-editor-page-hero-copy-v5">
              <div className="uu-kicker">UU MENU EDITOR</div>
              <h1 className="uu-dashboard-title">編輯菜單</h1>

              <div className="uu-editor-page-actions uu-editor-page-actions-v6">
                <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">返回後台</Link>
                <Link href={publicPath} target="_blank" className="uu-btn uu-btn-primary">打開公開頁</Link>
                <CopyUrlButton url={publicUrl} />
              </div>
            </div>

            <div className="uu-editor-page-anchor-card uu-editor-page-anchor-card-v6">
              <div className="uu-editor-page-anchor-card-head">
                <span>快速導覽</span>
              </div>
              <div className="uu-editor-v4-anchor-nav uu-editor-v4-anchor-nav-refined uu-editor-page-anchor-nav uu-editor-page-anchor-nav-v6">
                <a href="#shop-info" className="uu-editor-v4-anchor-link is-primary">
                  <span>01</span>
                  <strong>店家資訊</strong>
                </a>
                <a href="#menu-items" className="uu-editor-v4-anchor-link is-primary">
                  <span>02</span>
                  <strong>菜單品項</strong>
                </a>
                <a href="#appearance-settings" className="uu-editor-v4-anchor-link is-primary">
                  <span>03</span>
                  <strong>外觀設定</strong>
                </a>
                <a href="#advanced-tools" className="uu-editor-v4-anchor-link is-primary">
                  <span>04</span>
                  <strong>進階工具</strong>
                </a>
              </div>
            </div>
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
