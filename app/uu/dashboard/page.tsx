export const dynamic = "force-dynamic";

import Link from "next/link";
import DeleteButton from "@/app/dashboard/DeleteButton";
import DeskCardButton from "@/app/dashboard/DeskCardButton";
import LogoutButton from "@/components/LogoutButton";
import { requireAdmin } from "@/lib/auth";
import { listMenus } from "@/lib/store";
import { getConfiguredSiteUrl } from "@/lib/site";

type SearchParamsShape = { q?: string; theme?: string };

function getThemeName(theme?: string) {
  if (theme === "light") return "簡約白色";
  if (theme === "warm") return "溫暖咖啡風";
  if (theme === "ocean") return "海洋清新風";
  if (theme === "forest") return "森林自然風";
  if (theme === "rose") return "玫瑰奶茶風";
  return "黑色餐廳風";
}

export default async function UUDashboardPage({ searchParams }: { searchParams?: Promise<SearchParamsShape> | SearchParamsShape }) {
  await requireAdmin();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = String(resolvedSearchParams?.q ?? "").trim().toLowerCase();
  const themeFilter = String(resolvedSearchParams?.theme ?? "").trim();
  const menus = await listMenus();
  const publicBaseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus.filter((menu) => {
    const matchKeyword = !q || [menu.restaurant, menu.id, menu.slug, menu.phone, menu.address].some((v) => String(v ?? "").toLowerCase().includes(q));
    const matchTheme = !themeFilter || menu.theme === themeFilter;
    return matchKeyword && matchTheme;
  });

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #1a1a1a 0%, #0b0b0b 45%, #000 100%)", color: "#fff", padding: "32px 16px 60px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "#bdbdbd", fontSize: 13, marginBottom: 12 }}>UU Menu SaaS Dashboard</div>
            <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.2, fontWeight: 800 }}>我的菜單後台</h1>
            <p style={{ marginTop: 10, marginBottom: 0, color: "#a9a9a9", fontSize: 15, lineHeight: 1.8 }}>管理公開菜單、複製連結、下載 QR 與維護上架狀態。</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" style={ghostButtonStyle}>＋ 新增菜單</Link>
            <LogoutButton />
          </div>
        </div>

        <form action="/uu/dashboard" method="GET" style={{ borderRadius: 24, padding: 18, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr auto auto", gap: 12, alignItems: "center" }}>
            <input type="text" name="q" defaultValue={resolvedSearchParams?.q ?? ""} placeholder="搜尋餐廳名稱 / 菜單 ID / 電話 / 地址" style={inputStyle} />
            <select name="theme" defaultValue={resolvedSearchParams?.theme ?? ""} style={inputStyle}>
              <option value="">全部主題</option>
              <option value="dark">黑色餐廳風</option><option value="light">簡約白色</option><option value="warm">溫暖咖啡風</option><option value="ocean">海洋清新風</option><option value="forest">森林自然風</option><option value="rose">玫瑰奶茶風</option>
            </select>
            <button type="submit" style={primaryButtonStyle}>搜尋</button>
            <Link href="/uu/dashboard" style={ghostButtonStyle}>清除</Link>
          </div>
        </form>

        <div style={{ display: "grid", gap: 18 }}>
          {filteredMenus.map((menu) => {
            const publicPath = `/uu/menu/${encodeURIComponent(menu.slug || menu.id)}`;
            return (
              <div key={menu.id} style={{ borderRadius: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      <span style={pillStyle}>#{menu.id}</span>
                      <span style={pillStyle}>slug：{menu.slug || menu.id}</span>
                      <span style={pillStyle}>{getThemeName(menu.theme)}</span>
                      <span style={{ ...pillStyle, color: menu.isPublished === false ? "#ffd7a8" : "#b6f5c8", background: menu.isPublished === false ? "rgba(255,180,80,0.12)" : "rgba(80,255,160,0.1)" }}>{menu.isPublished === false ? "已下架" : "上架中"}</span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: 28 }}>{menu.restaurant}</h2>
                    <div style={{ color: "#a9a9a9", marginTop: 8, lineHeight: 1.8 }}>{menu.phone || "—"} {menu.address ? `｜ ${menu.address}` : ""}</div>
                    <div style={{ color: "#d0d0d0", marginTop: 10, fontSize: 14 }}>{publicBaseUrl ? `${publicBaseUrl}${publicPath}` : publicPath}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Link href={`/uu/dashboard/${menu.id}`} style={primaryButtonStyle}>編輯</Link>
                    <Link href={publicPath} target="_blank" style={ghostButtonStyle}>查看公開頁</Link>
                    <DeskCardButton restaurant={menu.restaurant} publicUrl={publicPath} theme={menu.theme} logoDataUrl={menu.logoDataUrl} phone={menu.phone} hours={menu.hours} />
                    <DeleteButton id={menu.id} publicUrl={publicPath} />
                  </div>
                </div>
              </div>
            );
          })}
          {!filteredMenus.length ? <div style={{ padding: 28, textAlign: "center", color: "#aaa", borderRadius: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>目前沒有符合條件的菜單。</div> : null}
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" };
const primaryButtonStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderRadius: 14, textDecoration: "none", background: "#fff", color: "#000", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer" };
const ghostButtonStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderRadius: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const pillStyle: React.CSSProperties = { display: "inline-flex", padding: "6px 10px", borderRadius: 999, fontSize: 12, background: "rgba(255,255,255,0.08)", color: "#ddd" };
