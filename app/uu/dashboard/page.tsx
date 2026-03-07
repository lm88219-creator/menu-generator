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
      <div className="uu-admin-container uu-admin-container-narrow uu-dashboard-v4">
        <section className="uu-panel uu-dashboard-topbar">
          <div>
            <div className="uu-kicker">UU MENU ADMIN</div>
            <h1 className="uu-dashboard-title">多店菜單控制台</h1>
            <p className="uu-dashboard-copy">專注在搜尋、編輯、公開網址與 QR，讓管理 10～50 家店更快更穩。</p>
          </div>
          <div className="uu-dashboard-topbar-actions">
            <Link href="/" className="uu-btn uu-btn-primary">新增菜單</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-dashboard-summary-row">
          <div className="uu-panel uu-dashboard-search-panel">
            <div className="uu-section-head uu-section-head-tight">
              <div>
                <h2>快速搜尋</h2>
                <p>店名、slug、電話、地址都能直接找。</p>
              </div>
            </div>
            <form action="/uu/dashboard" method="GET" className="uu-dashboard-searchbar">
              <input
                className="uu-input uu-dashboard-search-input"
                type="text"
                name="q"
                defaultValue={resolved?.q ?? ""}
                placeholder="搜尋店名 / slug / 電話 / 地址"
              />
              <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
              <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除</Link>
            </form>
          </div>

          <section className="uu-dashboard-stats-grid">
            <article className="uu-panel uu-dashboard-stat-card">
              <span>全部菜單</span>
              <strong>{menus.length}</strong>
            </article>
            <article className="uu-panel uu-dashboard-stat-card">
              <span>上架中</span>
              <strong>{publishedCount}</strong>
            </article>
            <article className="uu-panel uu-dashboard-stat-card">
              <span>已下架</span>
              <strong>{hiddenCount}</strong>
            </article>
            <article className="uu-panel uu-dashboard-stat-card uu-dashboard-stat-card-wide">
              <span>最後更新</span>
              <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
            </article>
          </section>
        </section>

        <section className="uu-panel uu-dashboard-list-shell">
          <div className="uu-dashboard-list-head">
            <div>
              <h2>店家列表</h2>
              <p>左邊看店家資料，中間看公開網址，右邊直接操作。</p>
            </div>
            <div className="uu-chip">顯示 {filteredMenus.length} / {menus.length}</div>
          </div>

          {filteredMenus.length ? (
            <>
              <div className="uu-dashboard-table-head" aria-hidden="true">
                <span>店家</span>
                <span>聯絡資訊</span>
                <span>公開網址</span>
                <span>操作</span>
              </div>

              <div className="uu-dashboard-row-list">
                {filteredMenus.map((menu) => {
                  const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                  const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;

                  return (
                    <article key={menu.id} className="uu-dashboard-row-card">
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
                            <span className="uu-dashboard-meta-chip">更新 {formatDateTime(menu.updatedAt)}</span>
                          </div>
                          <p className="uu-dashboard-address">{menu.address || "未填地址"}</p>
                        </div>
                      </div>

                      <div className="uu-dashboard-contact-block">
                        <div className="uu-dashboard-contact-item">
                          <span>電話</span>
                          <strong>{menu.phone || "未填電話"}</strong>
                        </div>
                        <div className="uu-dashboard-contact-item">
                          <span>主題</span>
                          <strong>{getThemeLabel(menu.theme)}</strong>
                        </div>
                      </div>

                      <div className="uu-dashboard-url-block">
                        <span>公開網址</span>
                        <strong>{publicUrl}</strong>
                      </div>

                      <div className="uu-dashboard-action-block">
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
            </>
          ) : (
            <div className="uu-empty-state uu-empty-state-pro">
              <h3>找不到符合條件的店家</h3>
              <p>請清除搜尋條件，或先新增一份菜單。</p>
              <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除搜尋</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
