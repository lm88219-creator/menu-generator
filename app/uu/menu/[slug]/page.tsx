export const dynamic = "force-dynamic";

import { getMenu, getMenuIdBySlug } from "@/lib/store";
import { groupMenuItems } from "@/lib/menu";
import type { CSSProperties } from "react";

function renderNotFound() {
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)", color: "#fff", padding: "32px 20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", borderRadius: 24, padding: 28, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
        <h1 style={{ fontSize: 30, margin: 0 }}>找不到菜單</h1>
        <p style={{ color: "#aaa", marginTop: 12 }}>這份菜單可能不存在，或網址有誤。</p>
        <a href="/" style={{ display: "inline-block", marginTop: 18, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.08)", color: "#fff", textDecoration: "none" }}>← 返回首頁</a>
      </div>
    </main>
  );
}

function renderUnpublished() {
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)", color: "#fff", padding: "32px 20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", borderRadius: 24, padding: 28, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
        <h1 style={{ fontSize: 30, margin: 0 }}>這份菜單目前暫停公開</h1>
        <p style={{ color: "#aaa", marginTop: 12 }}>店家目前已將這份菜單下架，請稍後再試。</p>
      </div>
    </main>
  );
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ table?: string }>;
};

type ThemeType = "dark" | "light" | "warm" | "ocean" | "forest" | "rose";

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = (searchParams ? await searchParams : {}) ?? {};
  const id = await getMenuIdBySlug(decodeURIComponent(slug));
  const data = id ? await getMenu(id) : null;

  if (!data) return renderNotFound();
  if (data.isPublished === false) return renderUnpublished();

  const theme = (data.theme ?? "dark") as ThemeType;
  const grouped = groupMenuItems(data.menuText);
  const table = String(query.table ?? "").trim();

  const themeStyles = {
    dark: { pageBackground: "radial-gradient(circle at top, #1d1d1d 0%, #050505 50%, #000 100%)", pageTextColor: "#fff", cardBackground: "rgba(255,255,255,0.04)", cardBorder: "1px solid rgba(255,255,255,0.08)", mutedColor: "#a9a9a9", rowBorder: "1px solid rgba(255,255,255,0.08)", linkColor: "#f4d58d", accent: "#f4d58d", heroBadgeBg: "rgba(255,255,255,0.08)", secondaryBg: "rgba(255,255,255,0.08)" },
    light: { pageBackground: "linear-gradient(180deg,#f7f7f7 0%,#ececec 100%)", pageTextColor: "#111", cardBackground: "rgba(255,255,255,0.92)", cardBorder: "1px solid rgba(0,0,0,0.08)", mutedColor: "#666", rowBorder: "1px solid rgba(0,0,0,0.08)", linkColor: "#0b57d0", accent: "#0b57d0", heroBadgeBg: "rgba(0,0,0,0.05)", secondaryBg: "#ffffff" },
    warm: { pageBackground: "linear-gradient(180deg,#f6eee2 0%,#eadbc8 100%)", pageTextColor: "#3e2d20", cardBackground: "rgba(255,250,244,0.92)", cardBorder: "1px solid rgba(88,54,24,0.12)", mutedColor: "#7b6756", rowBorder: "1px solid rgba(88,54,24,0.1)", linkColor: "#8b5e34", accent: "#8b5e34", heroBadgeBg: "rgba(88,54,24,0.08)", secondaryBg: "rgba(255,255,255,0.72)" },
    ocean: { pageBackground: "linear-gradient(180deg,#e8f7ff 0%,#cfeeff 100%)", pageTextColor: "#0f3550", cardBackground: "rgba(255,255,255,0.88)", cardBorder: "1px solid rgba(18,108,149,0.14)", mutedColor: "#4d7289", rowBorder: "1px solid rgba(18,108,149,0.12)", linkColor: "#0f6e91", accent: "#118ab2", heroBadgeBg: "rgba(17,138,178,0.08)", secondaryBg: "rgba(255,255,255,0.82)" },
    forest: { pageBackground: "linear-gradient(180deg,#edf6ef 0%,#d6e7d8 100%)", pageTextColor: "#233b2c", cardBackground: "rgba(250,255,250,0.9)", cardBorder: "1px solid rgba(47,94,61,0.14)", mutedColor: "#5c7564", rowBorder: "1px solid rgba(47,94,61,0.12)", linkColor: "#2f6b3f", accent: "#2f6b3f", heroBadgeBg: "rgba(47,107,63,0.08)", secondaryBg: "rgba(255,255,255,0.78)" },
    rose: { pageBackground: "linear-gradient(180deg,#fff2f6 0%,#f4dbe3 100%)", pageTextColor: "#5a3141", cardBackground: "rgba(255,250,252,0.92)", cardBorder: "1px solid rgba(145,78,101,0.14)", mutedColor: "#8b6573", rowBorder: "1px solid rgba(145,78,101,0.12)", linkColor: "#a14b68", accent: "#b35c7a", heroBadgeBg: "rgba(179,92,122,0.08)", secondaryBg: "rgba(255,255,255,0.82)" },
  } as const;

  const current = themeStyles[theme];
  const cardStyle: CSSProperties = { borderRadius: 28, padding: 24, background: current.cardBackground, border: current.cardBorder, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", backdropFilter: "blur(12px)" };

  return (
    <main style={{ minHeight: "100vh", background: current.pageBackground, color: current.pageTextColor, padding: "24px 16px 60px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: current.mutedColor, fontSize: 13, letterSpacing: 2, marginBottom: 14, padding: "8px 14px", borderRadius: 999, background: current.heroBadgeBg }}>UU MENU</div>
          {table ? <div style={{ display: "inline-flex", padding: "8px 14px", borderRadius: 999, background: current.secondaryBg, border: current.cardBorder, fontSize: 14, fontWeight: 700, marginBottom: 16 }}>目前桌號：{table}</div> : null}
          {data.logoDataUrl ? <div style={{ marginBottom: 14 }}><img src={data.logoDataUrl} alt={`${data.restaurant} logo`} style={{ width: 96, height: 96, objectFit: "contain", objectPosition: "center", borderRadius: "50%", background: "#fff", padding: 10, boxSizing: "border-box", boxShadow: "0 10px 24px rgba(0,0,0,0.12)" }} /></div> : null}
          <h1 style={{ fontSize: 42, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{data.restaurant}</h1>
          <p style={{ marginTop: 10, color: current.mutedColor, fontSize: 15 }}>掃碼即看，手機友善的數位菜單</p>
        </div>
        <div style={cardStyle}>
          <div style={{ display: "grid", gap: 18, fontSize: 18, lineHeight: 1.8 }}>
            {data.phone ? <div><div style={{ color: current.mutedColor, fontSize: 14, marginBottom: 4 }}>📞 電話</div><a href={`tel:${data.phone}`} style={{ color: current.linkColor, textDecoration: "none" }}>{data.phone}</a></div> : null}
            {data.address ? <div><div style={{ color: current.mutedColor, fontSize: 14, marginBottom: 4 }}>📍 地址</div><div>{data.address}</div></div> : null}
            {data.hours ? <div><div style={{ color: current.mutedColor, fontSize: 14, marginBottom: 4 }}>🕒 營業時間</div><div>{data.hours}</div></div> : null}
          </div>
        </div>
        <div style={{ height: 18 }} />
        <div style={cardStyle}>
          {grouped.map((group) => (
            <section key={group.category} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: current.accent, marginBottom: 14 }}>{group.category}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {group.items.map((item, index) => (
                  <div key={`${group.category}-${item.name}-${index}`} style={{ borderRadius: 18, padding: "14px 16px", border: current.rowBorder, background: current.secondaryBg, opacity: item.soldOut ? 0.55 : 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{item.name}{item.soldOut ? <span style={{ marginLeft: 8, fontSize: 12, color: current.mutedColor }}>已售完</span> : null}</div>
                        {item.note ? <div style={{ marginTop: 6, color: current.mutedColor, fontSize: 13 }}>{item.note}</div> : null}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: current.accent }}>{item.price ? `$${item.price}` : "時價"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
