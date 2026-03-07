export const dynamic = "force-dynamic";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import CopyUrlButton from "@/components/admin/CopyUrlButton";
import DeleteMenuButton from "@/components/admin/DeleteMenuButton";
import DeskCardButton from "@/components/admin/DeskCardButton";
import { requireAdmin } from "@/lib/auth";
import { listMenus } from "@/lib/store";
import { getConfiguredSiteUrl } from "@/lib/site";

function getThemeLabel(theme?: string) {
  if (theme === "light") return "簡約白";
  if (theme === "warm") return "暖木咖啡";
  if (theme === "ocean") return "海洋清新";
  if (theme === "forest") return "森林自然";
  if (theme === "rose") return "玫瑰奶茶";
  return "深色經典";
}

function formatDateTime(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-TW", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function UUDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}) {
  await requireAdmin();
  const resolved = searchParams ? await searchParams : {};
  const keyword = String(resolved?.q ?? "").trim().toLowerCase();
  const menus = await listMenus();
  const baseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus.filter((menu) => {
    const haystack = [menu.restaurant, menu.slug, menu.id, menu.phone, menu.address]
      .map((value) => String(value ?? "").toLowerCase())
      .join(" ");
    return !keyword || haystack.includes(keyword);
  });

  const publishedCount = menus.filter((menu) => menu.isPublished !== false).length;
  const hiddenCount = menus.length - publishedCount;
  const latestUpdate = menus.reduce<number>((latest, menu) => Math.max(latest, Number(menu.updatedAt ?? 0)), 0);

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow">
        <section className="uu-panel uu-dashboard-hero-v2">
          <div className="uu-dashboard-topbar">
            <div>
              <div className="uu-kicker">UU MENU ADMIN</div>
              <h1 className="uu-admin-title uu-admin-title-sm">多店菜單控制台</h1>
              <p className="uu-admin-copy">
                以 10～50 家店為目標重新整理成清楚的管理後台：先搜尋，再快速編輯、拿公開網址、下載 QR。
              </p>
            </div>
            <div className="uu-form-actions uu-dashboard-topbar-actions">
              <Link href="/" className="uu-btn uu-btn-primary">新增菜單</Link>
              <LogoutButton />
            </div>
          </div>

          <div className="uu-dashboard-stat-grid uu-dashboard-stat-grid-v2">
            <div className="uu-dashboard-stat-card">
              <span>全部菜單</span>
              <strong>{menus.length}</strong>
              <small>目前管理中的店家數量</small>
            </div>
            <div className="uu-dashboard-stat-card">
              <span>上架中</span>
              <strong>{publishedCount}</strong>
              <small>客人現在可以直接看到</small>
            </div>
            <div className="uu-dashboard-stat-card">
              <span>已下架</span>
              <strong>{hiddenCount}</strong>
              <small>暫時不顯示的店家</small>
            </div>
            <div className="uu-dashboard-stat-card is-accent">
              <span>最後更新</span>
              <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
              <small>方便你快速確認最近有沒有改過</small>
            </div>
          </div>
        </section>

        <section className="uu-panel uu-dashboard-toolbar uu-dashboard-toolbar-v2">
          <div className="uu-section-head uu-section-head-tight">
            <div>
              <h2>店家列表</h2>
              <p>一排一間店，常用操作直接展開，避免再多點一層。</p>
            </div>
            <div className="uu-chip">顯示 {filteredMenus.length} / {menus.length}</div>
          </div>

          <form action="/uu/dashboard" method="GET" className="uu-dashboard-search-card uu-dashboard-search-card-v2">
            <div className="uu-dashboard-search-main">
              <input
                className="uu-input uu-dashboard-search-input"
                type="text"
                name="q"
                defaultValue={resolved?.q ?? ""}
                placeholder="搜尋店名 / slug / 電話 / 地址"
              />
            </div>
            <div className="uu-form-actions uu-dashboard-search-actions">
              <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
              <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除</Link>
            </div>
          </form>
        </section>

        <section className="uu-panel uu-store-list-panel uu-store-list-panel-v2">
          {filteredMenus.length ? (
            <div className="uu-store-list-upgraded uu-store-list-upgraded-v2">
              {filteredMenus.map((menu, index) => {
                const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
                return (
                  <article key={menu.id} className="uu-store-row-card uu-store-row-card-v2">
                    <div className="uu-store-row-main">
                      <div className="uu-store-order-badge">#{index + 1}</div>

                      <div className="uu-store-cell uu-store-cell-top">
                        <div className="uu-store-logo uu-store-logo-table">
                          {menu.logoDataUrl ? (
                            <img src={menu.logoDataUrl} alt={`${menu.restaurant} logo`} />
                          ) : (
                            <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>
                          )}
                        </div>

                        <div className="uu-store-row-copy">
                          <div className="uu-store-row-headline">
                            <h3 className="uu-store-name">{menu.restaurant || "未命名店家"}</h3>
                            <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                              {menu.isPublished === false ? "已下架" : "上架中"}
                            </span>
                          </div>

                          <div className="uu-store-row-meta uu-store-row-meta-v2">
                            <div>
                              <span>slug</span>
                              <code className="uu-table-code">{menu.slug || menu.id}</code>
                            </div>
                            <div>
                              <span>主題</span>
                              <strong>{getThemeLabel(menu.theme)}</strong>
                            </div>
                            <div>
                              <span>電話</span>
                              <strong>{menu.phone || "—"}</strong>
                            </div>
                            <div>
                              <span>更新時間</span>
                              <strong>{formatDateTime(menu.updatedAt)}</strong>
                            </div>
                          </div>

                          <div className="uu-store-row-address">{menu.address || "未填地址"}</div>

                          <div className="uu-store-public-link-box">
                            <span>公開網址</span>
                            <strong>{publicUrl}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="uu-store-row-actions uu-store-row-actions-v2">
                      <Link href={`/uu/dashboard/${menu.id}`} className="uu-btn uu-btn-primary">編輯</Link>
                      <Link href={publicPath} target="_blank" className="uu-btn uu-btn-secondary">公開頁</Link>
                      <CopyUrlButton url={publicUrl} />
                      <DeskCardButton restaurant={menu.restaurant} publicUrl={publicPath} />
                      <DeleteMenuButton id={menu.id} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="uu-empty-state">
              <h3>找不到符合條件的店家</h3>
              <p>清除搜尋後再看一次，或先建立新菜單。</p>
              <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除搜尋</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
