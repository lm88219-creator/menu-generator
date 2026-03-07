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
      <div className="uu-admin-container uu-admin-container-narrow uu-dashboard-v6">
        <section className="uu-panel uu-dashboard-topbar-v6">
          <div className="uu-dashboard-topbar-main-v6">
            <div className="uu-kicker">UU MENU ADMIN</div>
            <div>
              <h1 className="uu-dashboard-title">多店菜單控制台</h1>
              <p className="uu-dashboard-copy">以店家管理為主的深色後台，重點保留搜尋、編輯、公開頁與 QR 操作。</p>
            </div>
          </div>

          <div className="uu-dashboard-topbar-actions-v6">
            <Link href="/" className="uu-btn uu-btn-primary">新增菜單</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-panel uu-dashboard-toolbar-v6">
          <form action="/uu/dashboard" method="GET" className="uu-dashboard-searchbar-v6">
            <input
              className="uu-input uu-dashboard-search-input"
              type="text"
              name="q"
              defaultValue={resolved?.q ?? ""}
              placeholder="搜尋店名、slug、電話或地址"
            />
            <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
            <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除</Link>
          </form>

          <div className="uu-dashboard-stats-v6">
            <div className="uu-dashboard-stat-card-v6">
              <span>全部菜單</span>
              <strong>{menus.length}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v6">
              <span>上架中</span>
              <strong>{publishedCount}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v6">
              <span>已下架</span>
              <strong>{hiddenCount}</strong>
            </div>
            <div className="uu-dashboard-stat-card-v6 uu-dashboard-stat-card-wide-v6">
              <span>最後更新</span>
              <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
            </div>
          </div>
        </section>

        <section className="uu-panel uu-dashboard-list-shell-v6">
          <div className="uu-dashboard-list-head-v6">
            <div>
              <h2>店家列表</h2>
              <p>{keyword ? `搜尋「${resolved?.q}」共找到 ${filteredMenus.length} 家` : `目前共 ${menus.length} 家店，可直接在列表完成主要操作。`}</p>
            </div>
            <div className="uu-dashboard-list-meta-v6">
              <span className="uu-chip">顯示 {filteredMenus.length} / {menus.length}</span>
              <span className="uu-chip">上次更新 {latestUpdate ? formatShortDate(latestUpdate) : "尚無資料"}</span>
            </div>
          </div>

          {filteredMenus.length ? (
            <div className="uu-dashboard-list-v6">
              {filteredMenus.map((menu) => {
                const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;

                return (
                  <article key={menu.id} className="uu-dashboard-card-v6">
                    <div className="uu-dashboard-card-head-v6">
                      <div className="uu-dashboard-card-title-wrap-v6">
                        <div className="uu-store-logo uu-dashboard-store-logo-v6">
                          {menu.logoDataUrl ? (
                            <img src={menu.logoDataUrl} alt={`${menu.restaurant} logo`} />
                          ) : (
                            <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>
                          )}
                        </div>

                        <div className="uu-dashboard-card-title-v6">
                          <div className="uu-dashboard-card-name-row-v6">
                            <h3 className="uu-store-name">{menu.restaurant || "未命名店家"}</h3>
                            <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                              {menu.isPublished === false ? "已下架" : "上架中"}
                            </span>
                          </div>
                          <div className="uu-dashboard-card-meta-v6">
                            <code className="uu-table-code">/{menu.slug || menu.id}</code>
                            <span className="uu-dashboard-meta-chip">{getThemeLabel(menu.theme)}</span>
                            <span className="uu-dashboard-meta-chip">更新 {formatShortDate(menu.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="uu-dashboard-card-actions-v6">
                        <Link href={`/uu/dashboard/${menu.id}`} className="uu-btn uu-btn-primary">編輯菜單</Link>
                        <Link href={publicPath} target="_blank" className="uu-btn uu-btn-secondary">公開頁</Link>
                        <CopyUrlButton url={publicUrl} />
                        <DeskCardButton restaurant={menu.restaurant} publicUrl={publicPath} />
                        <DeleteMenuButton id={menu.id} />
                      </div>
                    </div>

                    <div className="uu-dashboard-card-body-v6">
                      <div className="uu-dashboard-info-grid-v6">
                        <div className="uu-dashboard-info-item-v6">
                          <span>電話</span>
                          <strong>{menu.phone || "未填電話"}</strong>
                        </div>
                        <div className="uu-dashboard-info-item-v6">
                          <span>地址</span>
                          <strong>{menu.address || "未填地址"}</strong>
                        </div>
                        <div className="uu-dashboard-info-item-v6 uu-dashboard-info-item-url-v6">
                          <span>公開網址</span>
                          <strong>{publicUrl}</strong>
                        </div>
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
