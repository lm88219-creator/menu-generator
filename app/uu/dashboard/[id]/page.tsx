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

      <style jsx>{`
        .uu-editor-page-v6 {
          display: grid;
          gap: 18px;
        }
        .uu-editor-topbar-v6 {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          padding: 24px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(135deg, rgba(12,19,31,0.92), rgba(18,28,46,0.88));
          box-shadow: 0 24px 48px rgba(0,0,0,0.24);
        }
        .uu-editor-kicker-v6 {
          display: inline-block;
          margin-bottom: 10px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
          color: #7fb0ff;
        }
        .uu-editor-topbar-copy h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
          color: #f8fbff;
        }
        .uu-editor-topbar-copy p {
          margin: 10px 0 0;
          max-width: 680px;
          color: #9fb0c7;
          line-height: 1.65;
        }
        .uu-editor-topbar-meta {
          display: grid;
          gap: 14px;
          align-content: space-between;
          justify-items: end;
        }
        .uu-editor-topbar-badges,
        .uu-editor-topbar-actions,
        .uu-editor-anchor-v6 {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .uu-editor-topbar-badges span,
        .uu-editor-anchor-v6 a {
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.06);
          color: #e9f1fc;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
        .uu-editor-anchor-v6 {
          padding: 2px 4px;
        }
        .uu-editor-anchor-v6 a:hover {
          border-color: rgba(96,165,250,0.26);
          background: rgba(59,130,246,0.1);
        }
        @media (max-width: 860px) {
          .uu-editor-topbar-v6 {
            grid-template-columns: 1fr;
            padding: 18px;
            border-radius: 22px;
          }
          .uu-editor-topbar-copy h1 {
            font-size: 28px;
          }
          .uu-editor-topbar-meta {
            justify-items: stretch;
          }
          .uu-editor-topbar-actions :global(.uu-btn) {
            flex: 1 1 0;
            justify-content: center;
          }
          .uu-editor-anchor-v6 a {
            flex: 1 1 calc(50% - 10px);
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
