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

function formatShortDate(value?: number) {
  if (!value) return "尚未更新";
  return new Date(value).toLocaleString("zh-TW", {
    hour12: false,
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
      <div className="uu-admin-container uu-admin-container-narrow uu-dashboard-v5">
        <section className="uu-panel uu-dashboard-hero-v5">
          <div className="uu-dashboard-hero-main-v5">
            <div className="uu-kicker">UU MENU ADMIN</div>
            <h1 className="uu-dashboard-title">多店菜單控制台</h1>
            <p className="uu-dashboard-copy">
              把最常用的事情集中在同一頁：找店家、看狀態、打開公開頁、複製網址、下載 QR。
            </p>
            <div className="uu-dashboard-inline-stats">
              <div className="uu-dashboard-inline-stat">
                <span>全部菜單</span>
                <strong>{menus.length}</strong>
              </div>
              <div className="uu-dashboard-inline-stat">
                <span>上架中</span>
                <strong>{publishedCount}</strong>
              </div>
              <div className="uu-dashboard-inline-stat">
                <span>已下架</span>
                <strong>{hiddenCount}</strong>
              </div>
              <div className="uu-dashboard-inline-stat uu-dashboard-inline-stat-wide">
                <span>最後更新</span>
                <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
              </div>
            </div>
          </div>

          <div className="uu-dashboard-hero-side-v5">
            <Link href="/" className="uu-btn uu-btn-primary uu-full-width">新增菜單</Link>
            <LogoutButton />
            <div className="uu-dashboard-hero-note">
              <span>目前焦點</span>
              <strong>{keyword ? `搜尋中：${resolved?.q}` : "查看全部店家"}</strong>
              <p>{keyword ? `符合條件 ${filteredMenus.length} 家` : `目前共 ${menus.length} 家店`}</p>
            </div>
          </div>
        </section>

        <section className="uu-panel uu-dashboard-toolbar-v5">
          <form action="/uu/dashboard" method="GET" className="uu-dashboard-searchbar uu-dashboard-searchbar-v5">
            <div className="uu-dashboard-search-field-v5">
              <span className="uu-dashboard-search-label">搜尋</span>
              <input
                className="uu-input uu-dashboard-search-input"
                type="text"
                name="q"
                defaultValue={resolved?.q ?? ""}
                placeholder="輸入店名、slug、電話或地址"
              />
            </div>
            <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
            <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除</Link>
          </form>

          <div className="uu-dashboard-toolbar-meta-v5">
            <div className="uu-chip">顯示 {filteredMenus.length} / {menus.length}</div>
            <div className="uu-chip">上次更新 {latestUpdate ? formatShortDate(latestUpdate) : "尚無資料"}</div>
          </div>
        </section>

        <section className="uu-panel uu-dashboard-list-shell uu-dashboard-list-shell-v5">
          <div className="uu-dashboard-list-head uu-dashboard-list-head-v5">
            <div>
              <h2>店家列表</h2>
              <p>每列直接完成主要操作，不再把常用功能藏進更多選單。</p>
            </div>
          </div>

          {filteredMenus.length ? (
            <div className="uu-dashboard-row-list uu-dashboard-row-list-v5">
              {filteredMenus.map((menu) => {
                const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;

                return (
                  <article key={menu.id} className="uu-dashboard-row-card uu-dashboard-row-card-v5">
                    <div className="uu-dashboard-row-main-v5">
                      <div className="uu-dashboard-store-block">
                        <div className="uu-store-logo uu-dashboard-store-logo">
                          {menu.logoDataUrl ? (
                            <img src={menu.logoDataUrl} alt={`${menu.restaurant} logo`} />
                          ) : (
                            <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>
                          )}
                        </div>
                        <div className="uu-dashboard-store-copy">
                          <div className="uu-dashboard-store-title-row">
                            <h3 className="uu-store-name">{menu.restaurant || "未命名店家"}</h3>
                            <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                              {menu.isPublished === false ? "已下架" : "上架中"}
                            </span>
                          </div>
                          <div className="uu-dashboard-meta-chips">
                            <code className="uu-table-code">/{menu.slug || menu.id}</code>
                            <span className="uu-dashboard-meta-chip">{getThemeLabel(menu.theme)}</span>
                            <span className="uu-dashboard-meta-chip">更新 {formatShortDate(menu.updatedAt)}</span>
                          </div>
                          <div className="uu-dashboard-detail-grid-v5">
                            <div className="uu-dashboard-detail-item-v5">
                              <span>電話</span>
                              <strong>{menu.phone || "未填電話"}</strong>
                            </div>
                            <div className="uu-dashboard-detail-item-v5">
                              <span>地址</span>
                              <strong>{menu.address || "未填地址"}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="uu-dashboard-url-block uu-dashboard-url-block-v5">
                        <span>公開網址</span>
                        <strong>{publicUrl}</strong>
                        <code className="uu-dashboard-url-path-v5">{publicPath}</code>
                      </div>
                    </div>

                    <div className="uu-dashboard-row-side-v5">
                      <Link href={`/uu/dashboard/${menu.id}`} className="uu-btn uu-btn-primary uu-dashboard-primary-action-v5">編輯菜單</Link>
                      <div className="uu-dashboard-action-grid-v5">
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
                <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除搜尋</Link>
                <Link href="/" className="uu-btn uu-btn-primary">新增菜單</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
