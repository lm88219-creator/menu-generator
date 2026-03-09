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

type SearchShape = {
  q?: string;
  status?: string;
  sort?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<SearchShape> | SearchShape;
}) {
  await requireAdmin();
  const resolved = searchParams ? await searchParams : {};
  const keyword = String(resolved?.q ?? "").trim().toLowerCase();
  const status = String(resolved?.status ?? "all").trim();
  const sort = String(resolved?.sort ?? "updated").trim();

  const menus = await listMenuSummaries();
  const baseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus
    .filter((menu) => {
      const haystack = [menu.restaurant, menu.slug, menu.id]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");
      const passKeyword = !keyword || haystack.includes(keyword);
      const passStatus =
        status === "published"
          ? menu.isPublished !== false
          : status === "hidden"
            ? menu.isPublished === false
            : status === "needs-work"
              ? (menu.missingInfoCount ?? 0) > 0
              : true;
      return passKeyword && passStatus;
    })
    .sort((a, b) => {
      if (sort === "name") return String(a.restaurant).localeCompare(String(b.restaurant), "zh-Hant");
      if (sort === "items") return (b.itemCount ?? 0) - (a.itemCount ?? 0);
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    });

  const publishedCount = menus.filter((menu) => menu.isPublished !== false).length;
  const hiddenCount = menus.length - publishedCount;
  const latestUpdate = menus.reduce<number>((latest, menu) => Math.max(latest, Number(menu.updatedAt ?? 0)), 0);
  const needAttention = menus.filter((menu) => (menu.missingInfoCount ?? 0) > 0 || menu.isPublished === false).slice(0, 3);

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow uu-dashboard-v7 uu-dashboard-v9">
        <section className="uu-panel uu-dashboard-hero-v7 uu-dashboard-hero-v9">
          <div className="uu-dashboard-hero-main-v7">
            <span className="uu-kicker">UU MENU ADMIN</span>
            <div>
              <h1 className="uu-dashboard-title">多店菜單控制台</h1>
              <p className="uu-dashboard-copy">先找到店家，再進入編輯。列表現在多了篩選、排序與待整理提醒，方便你先處理最重要的店。</p>
            </div>
          </div>

          <div className="uu-dashboard-hero-actions-v7">
            <Link href={ROUTES.home} className="uu-btn uu-btn-primary">新增菜單</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-panel uu-dashboard-overview-v7 uu-dashboard-overview-v9">
          <form action={ROUTES.dashboard} method="GET" className="uu-dashboard-searchbar-v7 uu-dashboard-searchbar-v9 uu-dashboard-searchbar-v10">
            <input
              className="uu-input uu-dashboard-search-input"
              type="text"
              name="q"
              defaultValue={resolved?.q ?? ""}
              placeholder="搜尋店名或 slug，例如：友愛、you-ai"
            />
            <select className="uu-input" name="status" defaultValue={status}>
              <option value="all">全部狀態</option>
              <option value="published">只看上架</option>
              <option value="hidden">只看下架</option>
              <option value="needs-work">待補資料</option>
            </select>
            <select className="uu-input" name="sort" defaultValue={sort}>
              <option value="updated">依最近更新</option>
              <option value="name">依店名</option>
              <option value="items">依品項數量</option>
            </select>
            <button type="submit" className="uu-btn uu-btn-primary">套用</button>
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
              <span>待整理</span>
              <strong>{menus.filter((menu) => (menu.missingInfoCount ?? 0) > 0).length}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v7 uu-dashboard-stat-card-wide-v7">
              <span>最後更新</span>
              <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
            </div>
          </div>

          {needAttention.length ? (
            <div className="uu-dashboard-focus-panel">
              <div className="uu-dashboard-focus-copy">
                <strong>優先處理</strong>
                <span>先把缺資料或已下架的店整理好，公開頁會更完整。</span>
              </div>
              <div className="uu-dashboard-focus-list">
                {needAttention.map((menu) => (
                  <Link key={menu.id} href={getDashboardEditPath(menu.id)} className="uu-dashboard-focus-chip">
                    <span>{menu.restaurant || "未命名店家"}</span>
                    <small>
                      {menu.isPublished === false ? "已下架" : `缺 ${menu.missingInfoCount ?? 0} 項資料`}
                    </small>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
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
              <span className="uu-chip">已下架 {hiddenCount}</span>
            </div>
          </div>

          {filteredMenus.length ? (
            <div className="uu-dashboard-list-v7 uu-dashboard-list-v8 uu-dashboard-list-v9">
              {filteredMenus.map((menu) => {
                const publicPath = getPublicMenuPath(menu.slug || menu.id);
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
                const missingInfoCount = menu.missingInfoCount ?? 0;
                const healthScore = Math.max(0, 100 - missingInfoCount * 15 - (menu.isPublished === false ? 20 : 0));

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
                          <div className="uu-dashboard-status-stack">
                            <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                              {menu.isPublished === false ? "已下架" : "上架中"}
                            </span>
                            {missingInfoCount ? <span className="uu-status is-warn">待補 {missingInfoCount} 項</span> : null}
                          </div>
                        </div>

                        <div className="uu-dashboard-store-meta-v7 uu-dashboard-store-meta-v8">
                          <span className="uu-dashboard-meta-chip">{getThemeLabel(menu.theme)}</span>
                          <span className="uu-dashboard-meta-chip">{menu.itemCount} 項菜單</span>
                          <span className="uu-dashboard-meta-chip">更新 {formatShortDate(menu.updatedAt)}</span>
                          <span className="uu-dashboard-meta-chip">{menu.hasLogo ? "含 Logo" : "純文字版"}</span>
                        </div>

                        <div className="uu-dashboard-row-health">
                          <div>
                            <span>整理度</span>
                            <strong>{healthScore}%</strong>
                          </div>
                          <div>
                            <span>公開網址</span>
                            <strong>{publicPath}</strong>
                          </div>
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
