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

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container uu-admin-container-narrow">
        <section className="uu-panel uu-admin-topbar">
          <div>
            <div className="uu-kicker">UU MENU ADMIN</div>
            <h1 className="uu-admin-title uu-admin-title-sm">多店菜單控制台</h1>
            <p className="uu-admin-copy">表格式管理，先求整齊、好找、好操作。</p>
          </div>
          <div className="uu-form-actions">
            <Link href="/" className="uu-btn uu-btn-primary">建立新菜單</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-panel uu-summary-row">
          <div className="uu-summary-item">
            <span>全部菜單</span>
            <strong>{menus.length}</strong>
          </div>
          <div className="uu-summary-item">
            <span>上架中</span>
            <strong>{publishedCount}</strong>
          </div>
          <div className="uu-summary-item uu-summary-item-grow">
            <form action="/uu/dashboard" method="GET" className="uu-dashboard-search">
              <input className="uu-input" type="text" name="q" defaultValue={resolved?.q ?? ""} placeholder="搜尋店名 / slug / 電話 / 地址" />
              <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
              <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除</Link>
            </form>
          </div>
        </section>

        <section className="uu-panel uu-table-panel">
          <div className="uu-section-head uu-section-head-tight">
            <div>
              <h2>店家列表</h2>
              <p>一列一間，操作集中在最右側。</p>
            </div>
            <div className="uu-chip">共 {filteredMenus.length} 間</div>
          </div>

          {filteredMenus.length ? (
            <>
              <div className="uu-table-wrap uu-desktop-only">
                <table className="uu-admin-table">
                  <thead>
                    <tr>
                      <th>店家</th>
                      <th>slug</th>
                      <th>主題</th>
                      <th>電話</th>
                      <th>更新時間</th>
                      <th>狀態</th>
                      <th className="is-actions">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMenus.map((menu) => {
                      const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                      const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
                      return (
                        <tr key={menu.id}>
                          <td>
                            <div className="uu-store-cell">
                              <div className="uu-store-logo uu-store-logo-table">
                                {menu.logoDataUrl ? <img src={menu.logoDataUrl} alt={`${menu.restaurant} logo`} /> : <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>}
                              </div>
                              <div>
                                <div className="uu-store-name">{menu.restaurant || "未命名店家"}</div>
                                <div className="uu-table-sub">{menu.address || "未填地址"}</div>
                              </div>
                            </div>
                          </td>
                          <td><code className="uu-table-code">{menu.slug || menu.id}</code></td>
                          <td>{getThemeLabel(menu.theme)}</td>
                          <td>{menu.phone || "—"}</td>
                          <td>{formatDateTime(menu.updatedAt)}</td>
                          <td>
                            <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                              {menu.isPublished === false ? "已下架" : "上架中"}
                            </span>
                          </td>
                          <td className="is-actions">
                            <div className="uu-table-actions uu-table-actions-main">
                              <Link href={`/uu/dashboard/${menu.id}`} className="uu-btn uu-btn-primary">編輯</Link>
                              <details className="uu-action-menu">
                                <summary className="uu-btn uu-btn-secondary">更多</summary>
                                <div className="uu-action-popover">
                                  <Link href={publicPath} target="_blank" className="uu-btn uu-btn-secondary">公開頁</Link>
                                  <CopyUrlButton url={publicUrl} />
                                  <DeskCardButton restaurant={menu.restaurant} publicUrl={publicPath} />
                                  <DeleteMenuButton id={menu.id} />
                                </div>
                              </details>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="uu-mobile-store-list uu-mobile-only">
                {filteredMenus.map((menu) => {
                  const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                  const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
                  return (
                    <article key={menu.id} className="uu-mobile-store-card">
                      <div className="uu-mobile-store-head">
                        <div className="uu-store-cell">
                          <div className="uu-store-logo uu-store-logo-table">
                            {menu.logoDataUrl ? <img src={menu.logoDataUrl} alt={`${menu.restaurant} logo`} /> : <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>}
                          </div>
                          <div>
                            <div className="uu-store-name">{menu.restaurant || "未命名店家"}</div>
                            <div className="uu-table-sub">{menu.address || "未填地址"}</div>
                          </div>
                        </div>
                        <span className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                          {menu.isPublished === false ? "已下架" : "上架中"}
                        </span>
                      </div>
                      <div className="uu-mobile-store-meta">
                        <div><span>slug</span><code className="uu-table-code">{menu.slug || menu.id}</code></div>
                        <div><span>主題</span><strong>{getThemeLabel(menu.theme)}</strong></div>
                        <div><span>電話</span><strong>{menu.phone || "—"}</strong></div>
                        <div><span>更新</span><strong>{formatDateTime(menu.updatedAt)}</strong></div>
                      </div>
                      <div className="uu-mobile-store-actions">
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
