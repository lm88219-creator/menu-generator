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
  return new Date(value).toLocaleString("zh-TW", { hour12: false });
}

export default async function UUDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; theme?: string }> | { q?: string; theme?: string };
}) {
  await requireAdmin();
  const resolved = searchParams ? await searchParams : {};
  const keyword = String(resolved?.q ?? "").trim().toLowerCase();
  const theme = String(resolved?.theme ?? "").trim();
  const menus = await listMenus();
  const baseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus.filter((menu) => {
    const haystack = [menu.restaurant, menu.slug, menu.id, menu.phone, menu.address]
      .map((value) => String(value ?? "").toLowerCase())
      .join(" ");
    const matchesKeyword = !keyword || haystack.includes(keyword);
    const matchesTheme = !theme || menu.theme === theme;
    return matchesKeyword && matchesTheme;
  });

  const publishedCount = menus.filter((menu) => menu.isPublished !== false).length;
  const logoCount = menus.filter((menu) => Boolean(menu.logoDataUrl)).length;
  const latestUpdate = menus[0]?.updatedAt;

  return (
    <main className="uu-admin-shell">
      <div className="uu-admin-container">
        <section className="uu-admin-subhero uu-admin-subhero-simple">
          <div>
            <div className="uu-kicker">UU MENU ADMIN</div>
            <h1 className="uu-admin-title">多店菜單控制台</h1>
            <p className="uu-admin-copy">
              改成簡單明瞭的深色後台，重點放在店家管理，不再用太多裝飾色。
            </p>
          </div>
          <div className="uu-form-actions">
            <Link href="/" className="uu-btn uu-btn-primary">建立新菜單</Link>
            <Link href="/uu/login" className="uu-btn uu-btn-secondary">登入頁</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-panel uu-stats-strip">
          <div className="uu-admin-hero-grid">
            <StatCard label="全部菜單" value={String(menus.length)} sub="目前可管理的餐廳數" />
            <StatCard label="上架中" value={String(publishedCount)} sub="公開客人可看的菜單" />
            <StatCard label="有 Logo" value={String(logoCount)} sub="品牌識別更完整" />
            <StatCard label="最近更新" value={latestUpdate ? formatDateTime(latestUpdate) : "—"} sub="最後異動時間" compact />
          </div>
        </section>

        <section className="uu-panel uu-filter-panel">
          <div className="uu-section-head">
            <div>
              <h2>快速搜尋</h2>
              <p>可搜尋店名、slug、電話與地址。</p>
            </div>
          </div>
          <form action="/uu/dashboard" method="GET" className="uu-filter-grid">
            <input className="uu-input" type="text" name="q" defaultValue={resolved?.q ?? ""} placeholder="搜尋店名 / slug / 電話 / 地址" />
            <select className="uu-input" name="theme" defaultValue={resolved?.theme ?? ""}>
              <option value="">全部主題</option>
              <option value="dark">深色經典</option>
              <option value="light">簡約白</option>
              <option value="warm">暖木咖啡</option>
              <option value="ocean">海洋清新</option>
              <option value="forest">森林自然</option>
              <option value="rose">玫瑰奶茶</option>
            </select>
            <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
            <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除</Link>
          </form>
        </section>

        <section className="uu-panel">
          <div className="uu-section-head">
            <div>
              <h2>店家列表</h2>
              <p>一排一間，讓你快速編輯、複製網址與下載 QR。</p>
            </div>
            <div className="uu-chip">共 {filteredMenus.length} 間</div>
          </div>

          <div className="uu-store-grid">
            {filteredMenus.length ? (
              filteredMenus.map((menu) => {
                const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;
                return (
                  <article key={menu.id} className="uu-store-card uu-store-card-clean">
                    <div className="uu-store-status-wrap">
                      <div className={`uu-status ${menu.isPublished === false ? "is-off" : "is-on"}`}>
                        {menu.isPublished === false ? "已下架" : "上架中"}
                      </div>
                    </div>
                    <div className="uu-store-main-row">
                      <div className="uu-store-identity">
                        <div className="uu-store-logo">
                          {menu.logoDataUrl ? <img src={menu.logoDataUrl} alt={`${menu.restaurant} logo`} /> : <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>}
                        </div>
                        <div className="uu-store-title-block">
                          <h3>{menu.restaurant || "未命名店家"}</h3>
                          <div className="uu-store-sub">slug：{menu.slug || menu.id}</div>
                        </div>
                      </div>
                      <div className="uu-store-meta-grid">
                        <div><span>主題</span><strong>{getThemeLabel(menu.theme)}</strong></div>
                        <div><span>最後更新</span><strong>{formatDateTime(menu.updatedAt)}</strong></div>
                        <div><span>電話</span><strong>{menu.phone || "未填寫"}</strong></div>
                      </div>
                    </div>
                    <div className="uu-card-actions uu-card-actions-end">
                      <Link href={`/uu/dashboard/${menu.id}`} className="uu-btn uu-btn-primary">編輯</Link>
                      <CopyUrlButton url={publicUrl} />
                      <DeskCardButton restaurant={menu.restaurant} publicUrl={publicPath} />
                      <DeleteMenuButton id={menu.id} />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="uu-empty-state">
                <h3>找不到符合條件的店家</h3>
                <p>你可以清除篩選後再試一次，或回首頁新增新的菜單。</p>
                <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除篩選</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, sub, compact = false }: { label: string; value: string; sub: string; compact?: boolean }) {
  return (
    <div className={`uu-stat-card ${compact ? "is-compact" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}
