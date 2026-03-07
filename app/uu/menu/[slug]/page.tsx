export const dynamic = "force-dynamic";

import { CSSProperties } from "react";
import { getMenu, getMenuIdBySlug, ThemeType } from "@/lib/store";
import { groupMenuItems } from "@/lib/menu";

function renderMessage(title: string, copy: string) {
  return (
    <main className="uu-public-shell is-empty">
      <div className="uu-public-container">
        <section className="uu-public-card">
          <div className="uu-public-kicker">UU MENU</div>
          <h1>{title}</h1>
          <p>{copy}</p>
        </section>
      </div>
    </main>
  );
}

function getThemeTokens(theme: ThemeType) {
  if (theme === "dark") {
    return {
      accent: "#8fb7ff",
      accentStrong: "#4f7df3",
      badge: "rgba(143, 183, 255, 0.16)",
      border: "rgba(255, 255, 255, 0.08)",
      bg: "#0b1020",
      bgSoft: "#121a2d",
      surface: "rgba(12, 18, 31, 0.86)",
      text: "#edf3ff",
      muted: "#98a7c2",
    };
  }
  if (theme === "warm") {
    return {
      accent: "#d79a5b",
      accentStrong: "#b67335",
      badge: "#fff0de",
      border: "#ead9c7",
      bg: "#f8f2ea",
      bgSoft: "#fffaf5",
      surface: "rgba(255, 250, 244, 0.94)",
      text: "#3b2b1f",
      muted: "#7a6450",
    };
  }
  if (theme === "ocean") {
    return {
      accent: "#3f9bd8",
      accentStrong: "#0e76b8",
      badge: "#e3f5ff",
      border: "#d8eaf5",
      bg: "#eff8fc",
      bgSoft: "#fbfeff",
      surface: "rgba(255, 255, 255, 0.94)",
      text: "#183246",
      muted: "#5a7586",
    };
  }
  if (theme === "forest") {
    return {
      accent: "#5a9c68",
      accentStrong: "#397545",
      badge: "#ebf7ed",
      border: "#d8e8db",
      bg: "#f2f8f2",
      bgSoft: "#fbfefb",
      surface: "rgba(255, 255, 255, 0.95)",
      text: "#203126",
      muted: "#5d7666",
    };
  }
  if (theme === "rose") {
    return {
      accent: "#d07c9f",
      accentStrong: "#b35c7a",
      badge: "#ffedf3",
      border: "#efd9e2",
      bg: "#fff6fa",
      bgSoft: "#fffafd",
      surface: "rgba(255, 255, 255, 0.95)",
      text: "#3f2430",
      muted: "#7c5b68",
    };
  }
  return {
    accent: "#caa35f",
    accentStrong: "#8c6a34",
    badge: "#f5efe4",
    border: "#e8dfd1",
    bg: "#f5f2ec",
    bgSoft: "#fffdf9",
    surface: "rgba(255, 255, 255, 0.95)",
    text: "#2b2f36",
    muted: "#667085",
  };
}

export default async function UuMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ table?: string }>;
}) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const id = await getMenuIdBySlug(decodeURIComponent(slug));
  const data = id ? await getMenu(id) : null;

  if (!data) return renderMessage("找不到菜單", "這份菜單可能不存在，或網址有誤。請確認餐廳提供的連結是否正確。");
  if (data.isPublished === false) return renderMessage("這份菜單暫時未公開", "店家目前暫停顯示這份菜單，請稍後再試。\n");

  const theme = (data.theme ?? "light") as ThemeType;
  const grouped = groupMenuItems(data.menuText || "");
  const table = String(query?.table ?? "").trim();
  const tokens = getThemeTokens(theme);

  const shellStyle: CSSProperties = {
    background: `radial-gradient(circle at top, ${tokens.badge} 0%, transparent 26%), linear-gradient(180deg, ${tokens.bg} 0%, ${tokens.bgSoft} 100%)`,
    color: tokens.text,
  };

  const heroStyle: CSSProperties = {
    background: tokens.surface,
    borderColor: tokens.border,
  };

  const infoCardStyle: CSSProperties = {
    background: tokens.surface,
    borderColor: tokens.border,
  };

  return (
    <main className="uu-public-shell" style={shellStyle}>
      <div className="uu-public-container">
        <section className="uu-public-hero" style={heroStyle}>
          <div className="uu-public-kicker">UU MENU</div>
          {table ? <div className="uu-public-table">桌號 {table}</div> : null}
          {data.logoDataUrl ? <img src={data.logoDataUrl} alt={`${data.restaurant} logo`} className="uu-public-logo" /> : null}
          <h1>{data.restaurant}</h1>
          <p style={{ color: tokens.muted }}>掃碼即可查看菜單，手機閱讀更清楚、字更大、價格更好對齊。</p>
          <div className="uu-public-hero-note" style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}>
            {table ? `目前桌號：${table}` : "可直接滑動查看完整菜單與價格"}
          </div>
        </section>

        <section className="uu-public-card" style={infoCardStyle}>
          <div className="uu-public-info-grid">
            {data.phone ? <InfoItem label="電話" value={data.phone} href={`tel:${data.phone}`} tokens={tokens} /> : null}
            {data.hours ? <InfoItem label="營業時間" value={data.hours} tokens={tokens} /> : null}
            {data.address ? <InfoItem label="地址" value={data.address} full tokens={tokens} /> : null}
          </div>
        </section>

        <section className="uu-public-card" style={infoCardStyle}>
          {grouped.map((group) => (
            <section key={group.category} className="uu-public-section">
              <div className="uu-public-section-title" style={{ color: tokens.accent, background: tokens.badge, borderColor: tokens.border }}>
                {group.category}
              </div>
              <div className="uu-public-item-list">
                {group.items.map((item, index) => (
                  <div key={`${group.category}-${item.name}-${index}`} className={`uu-public-item ${item.soldOut ? "is-soldout" : ""}`} style={{ borderColor: tokens.border, background: tokens.surface }}>
                    <div className="uu-public-item-copy">
                      <strong>{item.name}</strong>
                      {item.note ? <p>{item.note}</p> : null}
                      {item.soldOut ? <span>今日售完</span> : null}
                    </div>
                    <div className="uu-public-item-price" style={{ color: tokens.accent }}>{item.price ? `$${item.price}` : "時價"}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </section>
      </div>
    </main>
  );
}

function InfoItem({
  label,
  value,
  href,
  full = false,
  tokens,
}: {
  label: string;
  value: string;
  href?: string;
  full?: boolean;
  tokens: ReturnType<typeof getThemeTokens>;
}) {
  const content = href ? <a href={href}>{value}</a> : <span>{value}</span>;
  return (
    <div
      className={`uu-public-info ${full ? "is-full" : ""}`}
      style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}
    >
      <small style={{ color: tokens.muted }}>{label}</small>
      {content}
    </div>
  );
}
