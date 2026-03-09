export const dynamic = "force-dynamic";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import CopyUrlButton from "@/components/admin/CopyUrlButton";
import DeleteMenuButton from "@/components/admin/DeleteMenuButton";
import DeskCardButton from "@/components/admin/DeskCardButton";
import { requireAdmin } from "@/lib/auth";
import { getDashboardEditPath, getPublicMenuPath, ROUTES } from "@/lib/routes";
import { listMenuSummaries } from "@/lib/store";
import { getConfiguredSiteUrl } from "@/lib/site";
import { getThemeLabel } from "@/lib/theme";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}) {
  await requireAdmin();
  const resolved = searchParams ? await searchParams : {};
  const keyword = String(resolved?.q ?? "").trim().toLowerCase();
  const menus = await listMenuSummaries();
  const baseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus.filter((menu) => {
    const haystack = [menu.restaurant, menu.slug, menu.id]
      .map((value) => String(value ?? "").toLowerCase())
      .join(" ");
    return !keyword || haystack.includes(keyword);
  });

  const publishedCount = menus.filter((menu) => menu.isPublished !== false).length;
  const hiddenCount = menus.length - publishedCount;
  const latestUpdate = menus.reduce<number>((latest, menu) => Math.max(latest, Number(menu.updatedAt ?? 0)), 0);

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow uu-dashboard-v7 uu-dashboard-v9">
        <section className="uu-panel uu-dashboard-hero-v7 uu-dashboard-hero-v9">
          <div className="uu-dashboard-hero-main-v7">
            <span className="uu-kicker">UU MENU ADMIN</span>
            <div>
              <h1 className="uu-dashboard-title">多店菜單控制台</h1>
              <p className="uu-dashboard-copy">先找到店家，再進入編輯。列表只保留真正常看的重點資訊。</p>
            </div>
          </div>

          <div className="uu-dashboard-hero-actions-v7">
            <Link href={ROUTES.home} className="uu-btn uu-btn-primary">新增菜單</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-panel uu-dashboard-overview-v7 uu-dashboard-overview-v9">
          <form action={ROUTES.dashboard} method="GET" className="uu-dashboard-searchbar-v7 uu-dashboard-searchbar-v9">
            <input
              className="uu-input uu-dashboard-search-input"
              type="text"
              name="q"
              defaultValue={resolved?.q ?? ""}
              placeholder="搜尋店名或 slug，例如：友愛、you-ai"
            />
            <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
            <Link href={ROUTES.dashboard} className="uu-btn uu-btn-secondary">清除</Link>
          </form>

          <div className="uu-dashboard-stats-v7 uu-dashboard-stats-v9">
            <div className="uu-dashboard-stat-card-v7">
              <span>全部菜單</span>
              <strong>{menus.length}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v7">
              <span>上架中</span>
              <strong>{publishedCount}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v7">
              <span>已下架</span>
              <strong>{hiddenCount}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v7 uu-dashboard-stat-card-wide-v7">
              <span>最後更新</span>
              <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
            </div>
          </div>
        </section>

        <section className="uu-panel uu-dashboard-list-shell-v7 uu-dashboard-list-shell-v9">
          <div className="uu-dashboard-list-head-v7 uu-dashboard-list-head-v9">
            <div>
              <span className="uu-dashboard-section-label-v7">店家管理</span>
              <h2>店家列表</h2>
              <p>{keyword ? `搜尋「${resolved?.q}」共找到 ${filteredMenus.length} 家` : `目前共 ${menus.length} 家店，列表保留編輯時最常看的資訊。`}</p>
            </div>
            <div className="uu-dashboard-list-meta-v7">
              <span className="uu-chip">顯示 {filteredMenus.length} / {menus.length}</span>
              <span className="uu-chip">最新更新 {latestUpdate ? formatShortDate(latestUpdate) : "尚無資料"}</span>
            </div>
          </div>

          {filteredMenus.length ? (
            <div className="uu-dashboard-list-v7 uu-dashboard-list-v8 uu-dashboard-list-v9">
              {filteredMenus.map((menu) => {
                const publicPath = getPublicMenuPath(menu.slug || menu.id);
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;

                return (
                  <article key={menu.id} className="uu-dashboard-row-v7 uu-dashboard-row-v8 uu-dashboard-row-v9">
                    <div className="uu-dashboard-row-main-v7 uu-dashboard-row-main-v8">
                      <div className="uu-store-logo uu-dashboard-store-logo-v7 uu-dashboard-store-logo-v8">
                        <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>
                      </div>

                      <div className="uu-dashboard-store-copy-v7 uu-dashboard-store-copy-v8">
                        <div className="uu-dashboard-store-title-v7 uu-dashboard-store-title-v8">
                          <div>
                            <h3 className="uu-store-name">{menu.restaurant || "未命名店家"}</h3>
                            <p className="uu-dashboard-store-subtitle-v8">{menu.slug || menu.id}</p>
                          </div>
                          <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                            {menu.isPublished === false ? "已下架" : "上架中"}
                          </span>
                        </div>

                        <div className="uu-dashboard-store-meta-v7 uu-dashboard-store-meta-v8">
                          <span className="uu-dashboard-meta-chip">{getThemeLabel(menu.theme)}</span>
                          <span className="uu-dashboard-meta-chip">{menu.itemCount} 項菜單</span>
                          <span className="uu-dashboard-meta-chip">更新 {formatShortDate(menu.updatedAt)}</span>
                          <span className="uu-dashboard-meta-chip">{menu.hasLogo ? "含 Logo" : "純文字版"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="uu-dashboard-row-actions-wrap-v8 uu-dashboard-row-actions-wrap-v9 uu-dashboard-row-actions-wrap-compact">
                      <div className="uu-dashboard-row-actions-v7 uu-dashboard-row-actions-v8 uu-dashboard-row-actions-v10">
                        <Link href={getDashboardEditPath(menu.id)} className="uu-btn uu-btn-primary">編輯</Link>
                        <Link href={publicPath} target="_blank" className="uu-btn uu-btn-secondary">公開頁</Link>
                        <CopyUrlButton url={publicUrl} />
                        <DeskCardButton restaurant={menu.restaurant} publicUrl={publicPath} />
                        <DeleteMenuButton id={menu.id} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="uu-empty-state uu-empty-state-pro">
              <h3>找不到符合條件的店家</h3>
              <p>試著清除搜尋條件，或先新增一份菜單。</p>
              <div className="uu-form-actions">
                <Link href={ROUTES.dashboard} className="uu-btn uu-btn-secondary">清除搜尋</Link>
                <Link href={ROUTES.home} className="uu-btn uu-btn-primary">新增菜單</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function formatDateTime(value?: string | number | null) {
  const timestamp = Number(value ?? 0);
  if (!timestamp) return "尚無資料";

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function formatShortDate(value?: string | number | null) {
  const timestamp = Number(value ?? 0);
  if (!timestamp) return "尚無資料";

  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}
