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
      <div className="uu-admin-container uu-admin-container-narrow uu-dashboard-v7">
        <section className="uu-panel uu-dashboard-hero-v7">
          <div className="uu-dashboard-hero-main-v7">
            <span className="uu-kicker">UU MENU ADMIN</span>
            <div>
              <h1 className="uu-dashboard-title">多店菜單控制台</h1>
              <p className="uu-dashboard-copy">
                把多店管理收斂成搜尋、編輯、公開頁與 QR 四個核心操作，讓畫面更安定、資訊更好找。
              </p>
            </div>
          </div>

          <div className="uu-dashboard-hero-actions-v7">
            <Link href="/" className="uu-btn uu-btn-primary">新增菜單</Link>
            <LogoutButton />
          </div>
        </section>

        <section className="uu-panel uu-dashboard-overview-v7">
          <form action="/uu/dashboard" method="GET" className="uu-dashboard-searchbar-v7">
            <div className="uu-dashboard-search-copy-v7">
              <span className="uu-dashboard-section-label-v7">快速搜尋</span>
              <strong>搜尋店名、網址代稱、電話或地址</strong>
            </div>
            <input
              className="uu-input uu-dashboard-search-input"
              type="text"
              name="q"
              defaultValue={resolved?.q ?? ""}
              placeholder="例如：友愛、you-ai、0912、嘉義市"
            />
            <button type="submit" className="uu-btn uu-btn-primary">搜尋</button>
            <Link href="/uu/dashboard" className="uu-btn uu-btn-secondary">清除</Link>
          </form>

          <div className="uu-dashboard-stats-v7">
            <div className="uu-dashboard-stat-card-v7">
              <span>全部菜單</span>
              <strong>{menus.length}</strong>
              <small>目前可管理的店家數量</small>
            </div>
            <div className="uu-dashboard-stat-card-v7">
              <span>上架中</span>
              <strong>{publishedCount}</strong>
              <small>客人可直接打開的菜單</small>
            </div>
            <div className="uu-dashboard-stat-card-v7">
              <span>已下架</span>
              <strong>{hiddenCount}</strong>
              <small>暫時不公開顯示</small>
            </div>
            <div className="uu-dashboard-stat-card-v7 uu-dashboard-stat-card-wide-v7">
              <span>最後更新</span>
              <strong>{latestUpdate ? formatDateTime(latestUpdate) : "尚無資料"}</strong>
              <small>方便快速確認最近一次有沒有改到</small>
            </div>
          </div>
        </section>

        <section className="uu-panel uu-dashboard-list-shell-v7">
          <div className="uu-dashboard-list-head-v7">
            <div>
              <span className="uu-dashboard-section-label-v7">店家管理</span>
              <h2>店家列表</h2>
              <p>{keyword ? `搜尋「${resolved?.q}」共找到 ${filteredMenus.length} 家` : `目前共 ${menus.length} 家店，主要操作都可以直接在列表完成。`}</p>
            </div>
            <div className="uu-dashboard-list-meta-v7">
              <span className="uu-chip">顯示 {filteredMenus.length} / {menus.length}</span>
              <span className="uu-chip">最新更新 {latestUpdate ? formatShortDate(latestUpdate) : "尚無資料"}</span>
            </div>
          </div>

          <div className="uu-dashboard-list-summary-v7">
            <div className="uu-dashboard-list-summary-card-v7">
              <span>管理重點</span>
              <strong>把店家資訊、狀態與主要操作收在同一張卡片</strong>
              <small>列表閱讀會更乾淨，手機與桌機都比較不雜亂。</small>
            </div>
            <div className="uu-dashboard-list-summary-card-v7 is-soft">
              <span>本次調整</span>
              <strong>已移除店家資訊中的公開網址列</strong>
              <small>公開頁連結保留在操作區，不再佔用列表版面。</small>
            </div>
          </div>

          {filteredMenus.length ? (
            <div className="uu-dashboard-list-v7 uu-dashboard-list-v8">
              <div className="uu-dashboard-column-head-v7 uu-dashboard-column-head-v8" aria-hidden="true">
                <span>店家列表</span>
                <span>狀態與操作</span>
              </div>

              {filteredMenus.map((menu) => {
                const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
                const publicUrl = baseUrl ? `${baseUrl}${publicPath}` : publicPath;

                return (
                  <article key={menu.id} className="uu-dashboard-row-v7 uu-dashboard-row-v8">
                    <div className="uu-dashboard-row-main-v7 uu-dashboard-row-main-v8">
                      <div className="uu-store-logo uu-dashboard-store-logo-v7 uu-dashboard-store-logo-v8">
                        {menu.logoDataUrl ? (
                          <img src={menu.logoDataUrl} alt={`${menu.restaurant} logo`} />
                        ) : (
                          <span>{menu.restaurant?.slice(0, 2) || "菜單"}</span>
                        )}
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
                          <span className="uu-dashboard-meta-chip">更新 {formatShortDate(menu.updatedAt)}</span>
                          <span className="uu-dashboard-meta-chip">{menu.logoDataUrl ? "含 Logo" : "純文字版"}</span>
                        </div>

                        <div className="uu-dashboard-contact-inline-v8 uu-dashboard-contact-inline-v9">
                          <div className="uu-dashboard-info-item-v7 uu-dashboard-info-card-v8">
                            <span>電話</span>
                            <strong>{menu.phone || "未填電話"}</strong>
                          </div>
                          <div className="uu-dashboard-info-item-v7 uu-dashboard-info-card-v8 uu-dashboard-info-card-wide-v8">
                            <span>地址</span>
                            <strong>{menu.address || "未填地址"}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="uu-dashboard-row-actions-wrap-v8 uu-dashboard-row-actions-wrap-v9">
                      <div className="uu-dashboard-row-contact-v7 uu-dashboard-row-contact-v8 uu-dashboard-status-panel-v8">
                        <div className="uu-dashboard-info-item-v7 uu-dashboard-info-item-soft-v8">
                          <span>公開頁狀態</span>
                          <strong>{menu.isPublished === false ? "目前不顯示給客人" : "客人可直接開啟"}</strong>
                        </div>
                        <div className="uu-dashboard-info-item-v7 uu-dashboard-info-item-soft-v8">
                          <span>主要操作</span>
                          <strong>編輯、複製網址、桌卡都集中在下方</strong>
                        </div>
                      </div>

                      <div className="uu-dashboard-row-actions-v7 uu-dashboard-row-actions-v8">
                        <Link href={`/uu/dashboard/${menu.id}`} className="uu-btn uu-btn-primary">編輯</Link>
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
