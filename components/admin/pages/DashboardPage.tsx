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
  const sort = String(resolved?.sort ?? "updated-desc").trim();
  const menus = await listMenuSummaries();
  const baseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus
    .filter((menu) => {
      const haystack = [menu.restaurant, menu.slug, menu.id, getThemeLabel(menu.theme)]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");
      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? menu.isPublished !== false
            : menu.isPublished === false;
      return matchesKeyword && matchesStatus;
    })
    .sort((a, b) => sortMenus(a, b, sort));

  const publishedCount = menus.filter((menu) => menu.isPublished !== false).length;
  const hiddenCount = menus.length - publishedCount;
  const logoCount = menus.filter((menu) => menu.hasLogo).length;
  const latestUpdate = menus.reduce<number>((latest, menu) => Math.max(latest, Number(menu.updatedAt ?? 0)), 0);
  const needsAttentionCount = menus.filter((menu) => menu.isPublished === false || !menu.hasLogo || Number(menu.itemCount ?? 0) < 8).length;
  const recentlyUpdated = filteredMenus.slice(0, 3);

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow uu-dashboard-v7 uu-dashboard-v9 uu-dashboard-v10">
        <section className="uu-panel uu-dashboard-hero-v7 uu-dashboard-hero-v9 uu-dashboard-hero-v10">
          <div className="uu-dashboard-hero-main-v7">
            <span className="uu-kicker">UU MENU ADMIN</span>
            <div>
              <h1 className="uu-dashboard-title">多店菜單控制台</h1>
              <p className="uu-dashboard-copy">先用搜尋、狀態與排序縮小清單，再把最需要處理的店家往前排，管理節奏會更快。</p>
            </div>
          </div>

          <div className="uu-dashboard-hero-actions-v7">
            <Link href={ROUTES.home} className="uu-btn uu-btn-primary">新增菜單</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-panel uu-dashboard-overview-v7 uu-dashboard-overview-v9 uu-dashboard-overview-v10">
          <form action={ROUTES.dashboard} method="GET" className="uu-dashboard-searchbar-v7 uu-dashboard-searchbar-v9 uu-dashboard-searchbar-v10">
            <input
              className="uu-input uu-dashboard-search-input"
              type="text"
              name="q"
              defaultValue={resolved?.q ?? ""}
              placeholder="搜尋店名、slug 或主題，例如：友愛、you-ai、暖色"
            />

            <select className="uu-input uu-dashboard-select" name="status" defaultValue={status}>
              <option value="all">全部狀態</option>
              <option value="published">只看上架</option>
              <option value="hidden">只看下架</option>
            </select>

            <select className="uu-input uu-dashboard-select" name="sort" defaultValue={sort}>
              <option value="updated-desc">最近更新優先</option>
              <option value="updated-asc">最久未更新優先</option>
              <option value="name-asc">店名 A → Z</option>
              <option value="name-desc">店名 Z → A</option>
              <option value="items-desc">品項多 → 少</option>
            </select>

            <button type="submit" className="uu-btn uu-btn-primary">套用</button>
            <Link href={ROUTES.dashboard} className="uu-btn uu-btn-secondary">重設</Link>
          </form>

          <div className="uu-dashboard-stats-v7 uu-dashboard-stats-v9 uu-dashboard-stats-v10">
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
            <div className="uu-dashboard-stat-card-v7">
              <span>含 Logo</span>
              <strong>{logoCount}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v7 uu-dashboard-stat-card-wide-v7">
              <span>最後更新</span>
              <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
            </div>
          </div>

          <div className="uu-dashboard-priority-bar">
            <div className="uu-dashboard-priority-card">
              <strong>目前待整理</strong>
              <p>有 {needsAttentionCount} 家店需要優先確認，通常是下架中、沒有 Logo，或菜單品項偏少。</p>
            </div>
            <div className="uu-dashboard-priority-card">
              <strong>建議工作順序</strong>
              <p>先看最近更新，再確認公開狀態與公開頁連結，最後才處理桌號與 QR 分享。</p>
            </div>
          </div>
        </section>

        {!!recentlyUpdated.length && !keyword && status === "all" ? (
          <section className="uu-panel uu-dashboard-focus-shell">
            <div className="uu-dashboard-list-head-v7 uu-dashboard-list-head-v9 uu-dashboard-list-head-v10">
              <div>
                <span className="uu-dashboard-section-label-v7">優先處理</span>
                <h2>最近更新清單</h2>
                <p>通常這幾家最有可能還在調整中，先從這裡回頭確認公開頁最省時間。</p>
              </div>
            </div>
            <div className="uu-dashboard-focus-grid">
              {recentlyUpdated.map((menu) => {
                const publicPath = getPublicMenuPath(menu.slug || menu.id);
                return (
                  <article key={`focus-${menu.id}`} className="uu-dashboard-focus-card">
                    <div>
                      <strong>{menu.restaurant || "未命名店家"}</strong>
                      <span>/{menu.slug || menu.id}</span>
                    </div>
                    <p>{menu.isPublished === false ? "目前已下架，若要重新公開請進編輯頁確認。" : "公開中，建議順手檢查手機排版與價格。"}</p>
                    <div className="uu-dashboard-focus-actions">
                      <Link href={getDashboardEditPath(menu.id)} className="uu-btn uu-btn-primary">進入編輯</Link>
                      <Link href={publicPath} target="_blank" className="uu-btn uu-btn-secondary">看公開頁</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="uu-panel uu-dashboard-list-shell-v7 uu-dashboard-list-shell-v9 uu-dashboard-list-shell-v10">
          <div className="uu-dashboard-list-head-v7 uu-dashboard-list-head-v9 uu-dashboard-list-head-v10">
            <div>
              <span className="uu-dashboard-section-label-v7">店家管理</span>
              <h2>店家列表</h2>
              <p>
                {keyword || status !== "all"
                  ? `目前顯示 ${filteredMenus.length} 家店，條件會一起套用搜尋、狀態與排序。`
                  : `目前共 ${menus.length} 家店，列表保留你最常會看與最常操作的資訊。`}
              </p>
            </div>
            <div className="uu-dashboard-list-meta-v7 uu-dashboard-list-meta-v10">
              <span className="uu-chip">顯示 {filteredMenus.length} / {menus.length}</span>
              <span className="uu-chip">排序 {getSortLabel(sort)}</span>
              <span className="uu-chip">狀態 {getStatusLabel(status)}</span>
            </div>
          </div>

          {filteredMenus.length ? (
            <div className="uu-dashboard-list-v7 uu-dashboard-list-v8 uu-dashboard-list-v9 uu-dashboard-list-v10">
              {filteredMenus.map((menu) => {
                const publicPath = getPublicMenuPath(menu.slug || menu.id);
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
                const summaryText = menu.isPublished === false
                  ? "目前是下架狀態，公開頁不建議持續印在桌卡或傳給客人。"
                  : menu.hasLogo
                    ? "公開頁已有基本品牌感，可以優先檢查價格與分類。"
                    : "目前是純文字版菜單，若想更完整可以補 Logo。";

                return (
                  <article key={menu.id} className="uu-dashboard-row-v7 uu-dashboard-row-v8 uu-dashboard-row-v9 uu-dashboard-row-v10">
                    <div className="uu-dashboard-row-main-v7 uu-dashboard-row-main-v8">
                      <div className="uu-store-logo uu-dashboard-store-logo-v7 uu-dashboard-store-logo-v8">
                        <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>
                      </div>

                      <div className="uu-dashboard-store-copy-v7 uu-dashboard-store-copy-v8">
                        <div className="uu-dashboard-store-title-v7 uu-dashboard-store-title-v8">
                          <div>
                            <h3 className="uu-store-name">{menu.restaurant || "未命名店家"}</h3>
                            <p className="uu-dashboard-store-subtitle-v8">/{menu.slug || menu.id}</p>
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

                        <p className="uu-dashboard-row-summary">{summaryText}</p>
                        <div className="uu-dashboard-row-link">公開連結：{publicUrl}</div>
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
              <p>你可以先清除條件，再重新搜尋；或直接新增一份新的菜單。</p>
              <div className="uu-form-actions">
                <Link href={ROUTES.dashboard} className="uu-btn uu-btn-secondary">清除條件</Link>
                <Link href={ROUTES.home} className="uu-btn uu-btn-primary">新增菜單</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function sortMenus(
  a: { updatedAt?: number; restaurant: string; itemCount: number },
  b: { updatedAt?: number; restaurant: string; itemCount: number },
  sort: string
) {
  switch (sort) {
    case "updated-asc":
      return Number(a.updatedAt ?? 0) - Number(b.updatedAt ?? 0);
    case "name-asc":
      return String(a.restaurant ?? "").localeCompare(String(b.restaurant ?? ""), "zh-Hant");
    case "name-desc":
      return String(b.restaurant ?? "").localeCompare(String(a.restaurant ?? ""), "zh-Hant");
    case "items-desc":
      return Number(b.itemCount ?? 0) - Number(a.itemCount ?? 0);
    case "updated-desc":
    default:
      return Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0);
  }
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

function getSortLabel(sort: string) {
  switch (sort) {
    case "updated-asc":
      return "最久未更新";
    case "name-asc":
      return "店名 A → Z";
    case "name-desc":
      return "店名 Z → A";
    case "items-desc":
      return "品項多 → 少";
    case "updated-desc":
    default:
      return "最近更新";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "published":
      return "只看上架";
    case "hidden":
      return "只看下架";
    case "all":
    default:
      return "全部";
  }
}
