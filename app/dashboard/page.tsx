export const dynamic = "force-dynamic";

import Link from "next/link";
import DeleteButton from "./DeleteButton";
import DeskCardButton from "./DeskCardButton";
import { listMenus } from "@/lib/store";
import { getConfiguredSiteUrl } from "@/lib/site";

type SearchParamsShape = {
  q?: string;
  theme?: string;
};

type PageProps = {
  searchParams?: Promise<SearchParamsShape> | SearchParamsShape;
};

function getThemeName(theme?: string) {
  if (theme === "light") return "簡約白色";
  if (theme === "warm") return "溫暖咖啡風";
  if (theme === "ocean") return "海洋清新風";
  if (theme === "forest") return "森林自然風";
  if (theme === "rose") return "玫瑰奶茶風";
  return "黑色餐廳風";
}

function formatDateTime(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-TW", {
    hour12: false,
  });
}

function getRelativeText(value?: number) {
  if (!value) return "—";
  const diff = Date.now() - value;
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} 分鐘前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小時前`;
  return `${Math.floor(diff / day)} 天前`;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = String(resolvedSearchParams?.q ?? "").trim().toLowerCase();
  const themeFilter = String(resolvedSearchParams?.theme ?? "").trim();

  const menus = await listMenus();
  const publicBaseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus.filter((menu) => {
    const matchKeyword =
      !q ||
      menu.restaurant?.toLowerCase().includes(q) ||
      menu.id?.toLowerCase().includes(q) ||
      menu.slug?.toLowerCase().includes(q) ||
      menu.phone?.toLowerCase().includes(q) ||
      menu.address?.toLowerCase().includes(q);

    const matchTheme = !themeFilter || menu.theme === themeFilter;
    return matchKeyword && matchTheme;
  });

  const latestUpdated = menus[0]?.updatedAt;
  const totalMenus = menus.length;
  const filteredCount = filteredMenus.length;
  const withLogoCount = menus.filter((menu) => Boolean(menu.logoDataUrl)).length;
  const withSlugCount = menus.filter((menu) => Boolean(menu.slug)).length;

  return (
    <main className="admin-shell">
      <div className="admin-container">
        <section className="admin-hero-card">
          <div className="admin-hero-copy">
            <span className="admin-badge">Restaurant Dashboard Pro</span>
            <h1 className="admin-page-title">後台總覽</h1>
            <p className="admin-page-subtitle">
              一次查看全部菜單、快速搜尋店家、複製公開連結、管理品牌外觀與桌卡輸出。
            </p>

            <div className="admin-actions-row">
              <Link href="/" className="admin-btn admin-btn-primary">
                ＋ 新增菜單
              </Link>
              <Link href="/" className="admin-btn admin-btn-secondary">
                返回首頁
              </Link>
            </div>
          </div>

          <div className="admin-hero-panel">
            <div className="admin-hero-kicker">今日摘要</div>
            <div className="admin-hero-panel-title">你目前的菜單系統狀態</div>
            <div className="admin-hero-list">
              <div>公開菜單：{totalMenus} 份</div>
              <div>有品牌 Logo：{withLogoCount} 份</div>
              <div>自訂網址：{withSlugCount} 份</div>
              <div>最近更新：{latestUpdated ? getRelativeText(latestUpdated) : "尚無資料"}</div>
            </div>
          </div>
        </section>

        <section className="admin-stats-grid">
          <StatCard title="總菜單數" value={String(totalMenus)} sub="已建立的全部菜單" />
          <StatCard title="目前篩選結果" value={String(filteredCount)} sub="依搜尋與主題篩選後" />
          <StatCard title="有 Logo 的菜單" value={String(withLogoCount)} sub="品牌辨識度更高" />
          <StatCard
            title="自訂網址菜單"
            value={String(withSlugCount)}
            sub={latestUpdated ? `最近更新：${getRelativeText(latestUpdated)}` : "尚無資料"}
          />
        </section>

        <form action="/dashboard" method="GET" className="admin-filter-card">
          <div className="admin-section-head">
            <div>
              <div className="admin-section-title">快速搜尋與篩選</div>
              <div className="admin-section-subtitle">輸入店名、slug、電話或地址快速找到目標菜單。</div>
            </div>
            <span className="admin-pill">已升級成卡片式後台</span>
          </div>

          <div className="admin-filter-grid">
            <input
              type="text"
              name="q"
              defaultValue={resolvedSearchParams?.q ?? ""}
              placeholder="搜尋餐廳名稱 / 菜單 ID / 電話 / 地址"
              className="admin-input"
            />

            <select name="theme" defaultValue={resolvedSearchParams?.theme ?? ""} className="admin-input">
              <option value="">全部主題</option>
              <option value="dark">黑色餐廳風</option>
              <option value="light">簡約白色</option>
              <option value="warm">溫暖咖啡風</option>
              <option value="ocean">海洋清新風</option>
              <option value="forest">森林自然風</option>
              <option value="rose">玫瑰奶茶風</option>
            </select>

            <button type="submit" className="admin-btn admin-btn-primary">
              搜尋
            </button>

            <Link href="/dashboard" className="admin-btn admin-btn-secondary">
              清除
            </Link>
          </div>
        </form>

        <section className="admin-list-card">
          <div className="admin-section-head">
            <div>
              <div className="admin-section-title">菜單列表</div>
              <div className="admin-section-subtitle">每張卡片都能直接查看公開頁、編輯、產生桌卡、複製連結與刪除。</div>
            </div>
            <span className="admin-pill">共 {filteredCount} 份</span>
          </div>

          <div className="admin-menu-list">
            {filteredMenus.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-title">找不到符合條件的菜單</div>
                <div className="admin-empty-copy">你可以換個關鍵字，或清除篩選後再試一次。</div>
                <Link href="/dashboard" className="admin-btn admin-btn-secondary">
                  清除篩選
                </Link>
              </div>
            ) : (
              filteredMenus.map((menu) => {
                const publicUrl = menu.slug ? `/menu/${encodeURIComponent(menu.slug)}` : `/m/${menu.id}`;
                const displayPublicUrl = publicBaseUrl ? `${publicBaseUrl}${publicUrl}` : publicUrl;

                return (
                  <article key={menu.id} className="admin-menu-card">
                    <div className="admin-menu-card-main">
                      <div className="admin-menu-avatar">
                        {menu.logoDataUrl ? (
                          <img
                            src={menu.logoDataUrl}
                            alt={`${menu.restaurant} logo`}
                            style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff", padding: 8, boxSizing: "border-box" }}
                          />
                        ) : (
                          <span>NO LOGO</span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className="admin-menu-card-head">
                          <div>
                            <div className="admin-menu-title">{menu.restaurant || "未命名菜單"}</div>
                            <div className="admin-menu-meta-inline">ID：{menu.id}</div>
                          </div>

                          <div className="admin-tag-row">
                            <span className="admin-tag admin-tag-success">已發布</span>
                            <span className="admin-tag">{getThemeName(menu.theme)}</span>
                            {menu.slug ? <span className="admin-tag admin-tag-accent">/{menu.slug}</span> : null}
                          </div>
                        </div>

                        <div className="admin-menu-info-grid">
                          <InfoItem label="公開連結" value={displayPublicUrl} accent />
                          <InfoItem label="建立時間" value={formatDateTime(menu.createdAt)} />
                          <InfoItem label="最後更新" value={formatDateTime(menu.updatedAt)} />
                          {menu.phone ? <InfoItem label="電話" value={menu.phone} /> : null}
                          {menu.address ? <InfoItem label="地址" value={menu.address} /> : null}
                        </div>
                      </div>
                    </div>

                    <div className="admin-menu-card-actions">
                      <ActionButton href={publicUrl} label="查看公開頁" primary />
                      <ActionButton href={`/dashboard/${menu.id}`} label="編輯菜單" />
                      <DeskCardButton
                        restaurant={menu.restaurant || "餐廳菜單"}
                        publicUrl={publicUrl}
                        theme={(menu.theme ?? "dark") as "dark" | "light" | "warm" | "ocean" | "forest" | "rose"}
                        logoDataUrl={menu.logoDataUrl ?? ""}
                        phone={menu.phone ?? ""}
                        hours={menu.hours ?? ""}
                      />
                      <DeleteButton id={menu.id} publicUrl={publicUrl} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-title">{title}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-sub">{sub}</div>
    </div>
  );
}

function InfoItem({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="admin-info-item">
      <div className="admin-info-label">{label}</div>
      <div className={accent ? "admin-info-value admin-info-value-accent" : "admin-info-value"}>{value}</div>
    </div>
  );
}

function ActionButton({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link href={href} target="_blank" className={primary ? "admin-btn admin-btn-primary" : "admin-btn admin-btn-secondary"}>
      {label}
    </Link>
  );
}
