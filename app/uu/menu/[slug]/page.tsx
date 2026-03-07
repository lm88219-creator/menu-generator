export const dynamic = "force-dynamic";

import { CSSProperties } from "react";
import { getMenu, getMenuIdBySlug, ThemeType } from "@/lib/store";
import { groupMenuItems } from "@/lib/menu";

function renderMessage(title: string, copy: string) {
  return (
    <main className="uu-public-shell is-empty">
      <div className="uu-public-container">
        <section className="uu-public-card uu-public-empty-card">
          <div className="uu-public-kicker">UU MENU</div>
          <h1>{title}</h1>
          <p>{copy}</p>
        </section>
      </div>
    </main>
  );
}

type ThemeTokens = {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentTint: string;
  accentTintStrong: string;
  badge: string;
  border: string;
  bg: string;
  bgSoft: string;
  bgDeep: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  title: string;
  muted: string;
  priceBg: string;
  priceText: string;
  soldoutBg: string;
  soldoutText: string;
  shadow: string;
};

function getThemeTokens(theme: ThemeType): ThemeTokens {
  if (theme === "dark") {
    return {
      accent: "#8cb6ff",
      accentStrong: "#4f7df3",
      accentSoft: "#d9e7ff",
      accentTint: "rgba(108, 153, 255, 0.18)",
      accentTintStrong: "rgba(108, 153, 255, 0.28)",
      badge: "rgba(143, 183, 255, 0.14)",
      border: "rgba(255, 255, 255, 0.08)",
      bg: "#08101e",
      bgSoft: "#0d1728",
      bgDeep: "#050915",
      surface: "rgba(11, 19, 33, 0.88)",
      surfaceSoft: "rgba(16, 26, 42, 0.88)",
      text: "#e6eefc",
      title: "#f7faff",
      muted: "#97a8c5",
      priceBg: "rgba(90, 131, 228, 0.16)",
      priceText: "#cfe0ff",
      soldoutBg: "rgba(255, 143, 143, 0.12)",
      soldoutText: "#ffb6b6",
      shadow: "0 24px 60px rgba(0, 0, 0, 0.34)",
    };
  }
  if (theme === "warm") {
    return {
      accent: "#d99b57",
      accentStrong: "#b56c2f",
      accentSoft: "#fff1df",
      accentTint: "rgba(217, 155, 87, 0.16)",
      accentTintStrong: "rgba(217, 155, 87, 0.24)",
      badge: "rgba(255, 236, 214, 0.84)",
      border: "rgba(113, 76, 41, 0.12)",
      bg: "#fbf1e4",
      bgSoft: "#fff8f1",
      bgDeep: "#f1e0ca",
      surface: "rgba(255, 251, 246, 0.96)",
      surfaceSoft: "rgba(255, 247, 238, 0.98)",
      text: "#4b3421",
      title: "#2f1f14",
      muted: "#7b614b",
      priceBg: "rgba(181, 108, 47, 0.12)",
      priceText: "#8b4a13",
      soldoutBg: "rgba(177, 73, 41, 0.1)",
      soldoutText: "#b14929",
      shadow: "0 22px 52px rgba(104, 70, 38, 0.14)",
    };
  }
  if (theme === "ocean") {
    return {
      accent: "#45a7d9",
      accentStrong: "#0b7bb7",
      accentSoft: "#e6f7ff",
      accentTint: "rgba(69, 167, 217, 0.14)",
      accentTintStrong: "rgba(69, 167, 217, 0.22)",
      badge: "rgba(227, 245, 255, 0.9)",
      border: "rgba(26, 89, 120, 0.12)",
      bg: "#ebf8fe",
      bgSoft: "#f8fdff",
      bgDeep: "#d8eef8",
      surface: "rgba(255, 255, 255, 0.96)",
      surfaceSoft: "rgba(249, 253, 255, 0.98)",
      text: "#234155",
      title: "#143244",
      muted: "#678294",
      priceBg: "rgba(11, 123, 183, 0.12)",
      priceText: "#0c6ea3",
      soldoutBg: "rgba(178, 81, 81, 0.1)",
      soldoutText: "#a24a4a",
      shadow: "0 22px 50px rgba(18, 80, 111, 0.12)",
    };
  }
  if (theme === "forest") {
    return {
      accent: "#65a86c",
      accentStrong: "#3d7c48",
      accentSoft: "#edf8ef",
      accentTint: "rgba(101, 168, 108, 0.14)",
      accentTintStrong: "rgba(101, 168, 108, 0.22)",
      badge: "rgba(235, 247, 237, 0.92)",
      border: "rgba(46, 92, 54, 0.12)",
      bg: "#eef7ef",
      bgSoft: "#fbfefb",
      bgDeep: "#dcecdc",
      surface: "rgba(255, 255, 255, 0.96)",
      surfaceSoft: "rgba(249, 253, 249, 0.98)",
      text: "#284030",
      title: "#1a2d20",
      muted: "#69806d",
      priceBg: "rgba(61, 124, 72, 0.12)",
      priceText: "#2f6e3a",
      soldoutBg: "rgba(150, 74, 74, 0.1)",
      soldoutText: "#9e4e4e",
      shadow: "0 22px 50px rgba(43, 78, 50, 0.12)",
    };
  }
  if (theme === "rose") {
    return {
      accent: "#d47f9d",
      accentStrong: "#b65b7d",
      accentSoft: "#ffedf4",
      accentTint: "rgba(212, 127, 157, 0.14)",
      accentTintStrong: "rgba(212, 127, 157, 0.22)",
      badge: "rgba(255, 237, 243, 0.9)",
      border: "rgba(116, 55, 78, 0.12)",
      bg: "#fff5f8",
      bgSoft: "#fffafd",
      bgDeep: "#f9e3ea",
      surface: "rgba(255, 255, 255, 0.96)",
      surfaceSoft: "rgba(255, 250, 253, 0.98)",
      text: "#4a2b37",
      title: "#341d26",
      muted: "#7c6070",
      priceBg: "rgba(182, 91, 125, 0.12)",
      priceText: "#a6466c",
      soldoutBg: "rgba(176, 72, 72, 0.1)",
      soldoutText: "#ad4949",
      shadow: "0 22px 50px rgba(120, 63, 85, 0.12)",
    };
  }
  return {
    accent: "#bc9b59",
    accentStrong: "#8d6c35",
    accentSoft: "#f7f1e6",
    accentTint: "rgba(188, 155, 89, 0.14)",
    accentTintStrong: "rgba(188, 155, 89, 0.22)",
    badge: "rgba(245, 239, 228, 0.92)",
    border: "rgba(101, 85, 53, 0.12)",
    bg: "#f5f2ec",
    bgSoft: "#fffdfa",
    bgDeep: "#ece4d7",
    surface: "rgba(255, 255, 255, 0.96)",
    surfaceSoft: "rgba(252, 250, 246, 0.98)",
    text: "#36312a",
    title: "#23201b",
    muted: "#756c5f",
    priceBg: "rgba(141, 108, 53, 0.12)",
    priceText: "#735326",
    soldoutBg: "rgba(166, 88, 61, 0.1)",
    soldoutText: "#9b5238",
    shadow: "0 22px 50px rgba(86, 69, 41, 0.12)",
  };
}

function formatPhoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function formatMapHref(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

const THEME_LABEL: Record<ThemeType, string> = {
  dark: "夜幕深色",
  light: "柔和淺色",
  warm: "暖金木質",
  ocean: "清爽海洋",
  forest: "森林自然",
  rose: "玫瑰雅緻",
};

const THEME_MOOD: Record<ThemeType, string> = {
  dark: "低調俐落，適合夜間與深色風格店面。",
  light: "乾淨明亮，適合簡潔清新的閱讀感。",
  warm: "帶一點木質暖度，適合家常與熱炒類型。",
  ocean: "清爽通透，適合海鮮與輕食系菜單。",
  forest: "自然穩定，適合健康、鍋物與家常料理。",
  rose: "柔和精緻，適合甜點、飲品與質感店型。",
};

function toSectionId(category: string, index: number) {
  return `section-${index}-${category}`
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "") || `section-${index}`;
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
  const categoryLinks = grouped.map((group, index) => ({
    label: group.category,
    id: toSectionId(group.category, index),
    count: group.items.length,
  }));
  const hasQuickActions = Boolean(data.phone || data.address);

  const shellStyle: CSSProperties = {
    background: `radial-gradient(circle at top, ${tokens.accentTintStrong} 0%, transparent 24%), radial-gradient(circle at bottom right, ${tokens.accentTint} 0%, transparent 26%), linear-gradient(180deg, ${tokens.bg} 0%, ${tokens.bgSoft} 55%, ${tokens.bgDeep} 100%)`,
    color: tokens.text,
    ["--uu-public-accent" as string]: tokens.accent,
    ["--uu-public-accent-strong" as string]: tokens.accentStrong,
    ["--uu-public-accent-soft" as string]: tokens.accentSoft,
    ["--uu-public-accent-tint" as string]: tokens.accentTint,
    ["--uu-public-badge" as string]: tokens.badge,
    ["--uu-public-border" as string]: tokens.border,
    ["--uu-public-surface" as string]: tokens.surface,
    ["--uu-public-surface-soft" as string]: tokens.surfaceSoft,
    ["--uu-public-title" as string]: tokens.title,
    ["--uu-public-text" as string]: tokens.text,
    ["--uu-public-muted" as string]: tokens.muted,
    ["--uu-public-price-bg" as string]: tokens.priceBg,
    ["--uu-public-price-text" as string]: tokens.priceText,
    ["--uu-public-soldout-bg" as string]: tokens.soldoutBg,
    ["--uu-public-soldout-text" as string]: tokens.soldoutText,
    ["--uu-public-shadow" as string]: tokens.shadow,
  };

  const cardStyle: CSSProperties = {
    background: tokens.surface,
    borderColor: tokens.border,
    boxShadow: tokens.shadow,
  };


  return (
    <main className="uu-public-shell" style={shellStyle}>
      <div className="uu-public-container uu-public-container-refined">
        <section className="uu-public-hero uu-public-hero-refined" style={cardStyle}>
          <div className="uu-public-hero-top">
            <div className="uu-public-kicker">UU MENU</div>
            <div className="uu-public-hero-badges">
              <span className="uu-public-badge-chip">{THEME_LABEL[theme]}</span>
              {table ? <span className="uu-public-badge-chip is-table">桌號 {table}</span> : null}
            </div>
          </div>

          <div className="uu-public-hero-main">
            {data.logoDataUrl ? <img src={data.logoDataUrl} alt={`${data.restaurant} logo`} className="uu-public-logo" /> : null}
            <div className="uu-public-heading-block">
              <h1 style={{ color: tokens.title }}>{data.restaurant}</h1>
              <p style={{ color: tokens.muted }}>
                {THEME_MOOD[theme]} 菜單與價格請以店內現場供應為準。
              </p>
              {(data.hours || data.phone || data.address) && (
                <div className="uu-public-inline-meta">
                  {data.hours ? <span>營業時間｜{data.hours}</span> : null}
                  {data.phone ? <span>電話｜{data.phone}</span> : null}
                  {data.address ? <span>地址｜{data.address}</span> : null}
                </div>
              )}
            </div>
          </div>

          {hasQuickActions ? (
            <div className="uu-public-action-row">
              {data.phone ? (
                <a
                  href={formatPhoneHref(data.phone)}
                  className="uu-public-action-button is-primary"
                  style={{ background: tokens.accentStrong, color: tokens.accentSoft, borderColor: tokens.accentStrong }}
                >
                  撥打電話
                </a>
              ) : null}
              {data.address ? (
                <a
                  href={formatMapHref(data.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="uu-public-action-button"
                  style={{ background: tokens.badge, color: tokens.text, borderColor: tokens.border }}
                >
                  查看位置
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="uu-public-hero-note" style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}>
            {table ? `目前桌號：${table}，點餐前可先向店家確認本桌品項與供應狀況。` : "向下滑動即可查看分類與價格，實際供應請以現場為準。"}
          </div>
        </section>

        {(data.phone || data.hours || data.address) && (
          <section className="uu-public-card uu-public-contact-card" style={cardStyle}>
            <div className="uu-public-section-head">
              <div>
                <span className="uu-public-section-kicker">商家資訊</span>
                <h2>聯絡與營業資訊</h2>
              </div>
            </div>

            <div className="uu-public-info-grid uu-public-info-grid-refined">
              {data.phone ? <InfoItem label="電話" value={data.phone} href={formatPhoneHref(data.phone)} tokens={tokens} /> : null}
              {data.hours ? <InfoItem label="營業時間" value={data.hours} tokens={tokens} /> : null}
              {data.address ? <InfoItem label="地址" value={data.address} full tokens={tokens} /> : null}
            </div>
          </section>
        )}

        <section className="uu-public-card uu-public-menu-card" style={cardStyle}>
          <div className="uu-public-section-head">
            <div>
              <span className="uu-public-section-kicker">精選菜單</span>
              <h2>菜單</h2>
            </div>
          </div>

          {categoryLinks.length > 1 ? (
            <div className="uu-public-nav-wrap">
              <div className="uu-public-nav-head">
                <span className="uu-public-section-kicker">快速分類</span>
                <span className="uu-public-section-hint">點一下可直接跳到對應分類</span>
              </div>
              <nav className="uu-public-category-nav" aria-label="菜單分類導覽">
                {categoryLinks.map((link) => (
                  <a key={link.id} href={`#${link.id}`} className="uu-public-category-chip" style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}>
                    <span>{link.label}</span>
                    <em>{link.count} 項</em>
                  </a>
                ))}
              </nav>
            </div>
          ) : null}

          {grouped.map((group, index) => (
            <section key={group.category} id={categoryLinks[index]?.id} className="uu-public-section uu-public-section-refined">
              <div className="uu-public-section-title-row">
                <div className="uu-public-section-title uu-public-section-title-refined" style={{ color: tokens.accent, background: tokens.badge, borderColor: tokens.border }}>
                  <span className="uu-public-section-dot" />
                  {group.category}
                </div>
                <span className="uu-public-section-count" style={{ background: tokens.accentTint, color: tokens.accentStrong, borderColor: tokens.border }}>
                  {group.items.length} 項
                </span>
              </div>

              <div className="uu-public-item-list uu-public-item-list-refined">
                {group.items.map((item, index) => (
                  <div
                    key={`${group.category}-${item.name}-${index}`}
                    className={`uu-public-item uu-public-item-refined ${item.soldOut ? "is-soldout" : ""}`}
                    style={{ borderColor: tokens.border, background: tokens.surfaceSoft }}
                  >
                    <div className="uu-public-item-copy">
                      <strong style={{ color: tokens.title }}>{item.name}</strong>
                      {item.note ? <p>{item.note}</p> : null}
                      {item.soldOut ? (
                        <span
                          className="uu-public-soldout-pill"
                          style={{ background: tokens.soldoutBg, color: tokens.soldoutText }}
                        >
                          今日售完
                        </span>
                      ) : null}
                    </div>
                    <div className="uu-public-item-price uu-public-item-price-refined" style={{ color: tokens.priceText, background: tokens.priceBg }}>
                      {item.price ? `$${item.price}` : "時價"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="uu-public-menu-footnote" style={{ color: tokens.muted }}>
            實際供應品項與價格請以現場公告為準。
          </div>
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
  tokens: ThemeTokens;
}) {
  const content = href ? <a href={href}>{value}</a> : <span>{value}</span>;
  return (
    <div className={`uu-public-info uu-public-info-refined ${full ? "is-full" : ""}`} style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}>
      <small style={{ color: tokens.muted }}>{label}</small>
      {content}
    </div>
  );
}
