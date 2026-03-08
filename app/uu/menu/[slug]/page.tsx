export const dynamic = "force-dynamic";

import { CSSProperties } from "react";
import { getMenu, getMenuIdBySlug } from "@/lib/store";
import type { ThemeType } from "@/lib/theme";
import { groupMenuItems } from "@/lib/menu";

function renderMessage(title: string, copy: string) {
  return (
    <main className="uu-public-shell is-empty">
      <div className="uu-public-container uu-public-container-refined">
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
      accent: "#b89a6a",
      accentStrong: "#e7c992",
      accentSoft: "#f5ead8",
      accentTint: "rgba(231, 201, 146, 0.12)",
      accentTintStrong: "rgba(231, 201, 146, 0.2)",
      badge: "rgba(255, 246, 227, 0.08)",
      border: "rgba(255, 244, 224, 0.12)",
      bg: "#0d0f14",
      bgSoft: "#151821",
      bgDeep: "#090b10",
      surface: "rgba(19, 22, 30, 0.92)",
      surfaceSoft: "rgba(26, 30, 40, 0.92)",
      text: "#e8e1d3",
      title: "#fff8ec",
      muted: "#aa9f8f",
      priceBg: "rgba(231, 201, 146, 0.12)",
      priceText: "#f3d8a6",
      soldoutBg: "rgba(214, 121, 121, 0.14)",
      soldoutText: "#ffc5c5",
      shadow: "0 30px 72px rgba(0, 0, 0, 0.42)",
    };
  }
  if (theme === "warm") {
    return {
      accent: "#c58b4f",
      accentStrong: "#9d5f2d",
      accentSoft: "#fff1de",
      accentTint: "rgba(197, 139, 79, 0.14)",
      accentTintStrong: "rgba(197, 139, 79, 0.22)",
      badge: "rgba(255, 246, 236, 0.86)",
      border: "rgba(136, 88, 43, 0.12)",
      bg: "#f6ecdf",
      bgSoft: "#fdf8f1",
      bgDeep: "#ead8c2",
      surface: "rgba(255, 252, 247, 0.98)",
      surfaceSoft: "rgba(255, 248, 241, 0.98)",
      text: "#513722",
      title: "#2f1c10",
      muted: "#81644b",
      priceBg: "rgba(157, 95, 45, 0.1)",
      priceText: "#8d501f",
      soldoutBg: "rgba(177, 73, 41, 0.1)",
      soldoutText: "#b14929",
      shadow: "0 24px 56px rgba(104, 70, 38, 0.13)",
    };
  }
  if (theme === "ocean") {
    return {
      accent: "#5aa7b6",
      accentStrong: "#2d7485",
      accentSoft: "#e8f7f8",
      accentTint: "rgba(90, 167, 182, 0.12)",
      accentTintStrong: "rgba(90, 167, 182, 0.2)",
      badge: "rgba(239, 250, 251, 0.9)",
      border: "rgba(43, 108, 120, 0.12)",
      bg: "#eaf5f6",
      bgSoft: "#f8fcfc",
      bgDeep: "#d7e9eb",
      surface: "rgba(255, 255, 255, 0.98)",
      surfaceSoft: "rgba(248, 252, 252, 0.98)",
      text: "#29414a",
      title: "#183039",
      muted: "#67808a",
      priceBg: "rgba(45, 116, 133, 0.1)",
      priceText: "#2a6e7d",
      soldoutBg: "rgba(178, 81, 81, 0.1)",
      soldoutText: "#a24a4a",
      shadow: "0 24px 54px rgba(20, 74, 84, 0.11)",
    };
  }
  if (theme === "forest") {
    return {
      accent: "#7b9a68",
      accentStrong: "#4d6b44",
      accentSoft: "#eff5e8",
      accentTint: "rgba(123, 154, 104, 0.12)",
      accentTintStrong: "rgba(123, 154, 104, 0.2)",
      badge: "rgba(242, 248, 238, 0.92)",
      border: "rgba(75, 107, 68, 0.12)",
      bg: "#eef3ea",
      bgSoft: "#fbfdf9",
      bgDeep: "#dde7d8",
      surface: "rgba(255, 255, 255, 0.98)",
      surfaceSoft: "rgba(248, 251, 246, 0.98)",
      text: "#314132",
      title: "#202d21",
      muted: "#70806f",
      priceBg: "rgba(77, 107, 68, 0.1)",
      priceText: "#47653f",
      soldoutBg: "rgba(150, 74, 74, 0.1)",
      soldoutText: "#9e4e4e",
      shadow: "0 24px 54px rgba(43, 78, 50, 0.11)",
    };
  }
  if (theme === "rose") {
    return {
      accent: "#c88aa0",
      accentStrong: "#9b5b73",
      accentSoft: "#fdeff4",
      accentTint: "rgba(200, 138, 160, 0.12)",
      accentTintStrong: "rgba(200, 138, 160, 0.2)",
      badge: "rgba(255, 242, 246, 0.9)",
      border: "rgba(128, 77, 95, 0.12)",
      bg: "#fcf3f6",
      bgSoft: "#fffafd",
      bgDeep: "#f2dde4",
      surface: "rgba(255, 255, 255, 0.98)",
      surfaceSoft: "rgba(255, 250, 252, 0.98)",
      text: "#4b313b",
      title: "#311c24",
      muted: "#7d6670",
      priceBg: "rgba(155, 91, 115, 0.1)",
      priceText: "#934a65",
      soldoutBg: "rgba(176, 72, 72, 0.1)",
      soldoutText: "#ad4949",
      shadow: "0 24px 54px rgba(120, 63, 85, 0.11)",
    };
  }
  if (theme === "classic") {
    return {
      accent: "#b91c1c",
      accentStrong: "#7a1212",
      accentSoft: "#fff3e8",
      accentTint: "rgba(185, 28, 28, 0.08)",
      accentTintStrong: "rgba(185, 28, 28, 0.16)",
      badge: "rgba(255, 255, 255, 0.82)",
      border: "rgba(17, 24, 39, 0.10)",
      bg: "#fbf7f1",
      bgSoft: "#fffdfa",
      bgDeep: "#f6f0e6",
      surface: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,251,246,0.98))",
      surfaceSoft: "rgba(255, 255, 255, 0.88)",
      text: "#111827",
      title: "#111827",
      muted: "#6b7280",
      priceBg: "rgba(185, 28, 28, 0.08)",
      priceText: "#9f1d1d",
      soldoutBg: "rgba(127, 29, 29, 0.08)",
      soldoutText: "#7f1d1d",
      shadow: "0 24px 54px rgba(17, 24, 39, 0.08)",
    };
  }
  return {
    accent: "#b69b74",
    accentStrong: "#7d6543",
    accentSoft: "#f5efe6",
    accentTint: "rgba(182, 155, 116, 0.12)",
    accentTintStrong: "rgba(182, 155, 116, 0.2)",
    badge: "rgba(248, 243, 236, 0.92)",
    border: "rgba(108, 89, 60, 0.12)",
    bg: "#f3efe9",
    bgSoft: "#fdfbf8",
    bgDeep: "#e7ddd0",
    surface: "rgba(255, 255, 255, 0.98)",
    surfaceSoft: "rgba(250, 248, 244, 0.98)",
    text: "#3f372d",
    title: "#29231c",
    muted: "#7c7162",
    priceBg: "rgba(125, 101, 67, 0.1)",
    priceText: "#715634",
    soldoutBg: "rgba(166, 88, 61, 0.1)",
    soldoutText: "#9b5238",
    shadow: "0 24px 54px rgba(86, 69, 41, 0.11)",
  };
}

function formatPhoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function formatMapHref(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function toSectionId(category: string, index: number) {
  return (
    `section-${index}-${category}`
      .toLowerCase()
      .replace(/[^a-z0-9一-龥]+/g, "-")
      .replace(/^-+|-+$/g, "") || `section-${index}`
  );
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
  if (data.isPublished === false) return renderMessage("這份菜單暫時未公開", "店家目前暫停顯示這份菜單，請稍後再試。");

  const theme = (data.theme ?? "light") as ThemeType;
  const grouped = groupMenuItems(data.menuText || "");
  const table = String(query?.table ?? "").trim();
  const tokens = getThemeTokens(theme);
  const categoryLinks = grouped.map((group, index) => ({
    label: group.category,
    id: toSectionId(group.category, index),
  }));
  const hasMeta = Boolean(data.hours || data.phone || data.address);

  const shellStyle: CSSProperties = {
    background: `radial-gradient(circle at top, ${tokens.accentTintStrong} 0%, transparent 24%), radial-gradient(circle at bottom right, ${tokens.accentTint} 0%, transparent 28%), linear-gradient(180deg, ${tokens.bg} 0%, ${tokens.bgSoft} 56%, ${tokens.bgDeep} 100%)`,
    color: tokens.text,
    ["--uu-public-accent" as string]: tokens.accent,
    ["--uu-public-accent-strong" as string]: tokens.accentStrong,
    ["--uu-public-accent-soft" as string]: tokens.accentSoft,
    ["--uu-public-accent-tint" as string]: tokens.accentTint,
    ["--uu-public-accent-tint-strong" as string]: tokens.accentTintStrong,
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
            <div className="uu-public-hero-badges">
              <span className="uu-public-kicker">UU MENU</span>
              {table ? <span className="uu-public-badge-chip is-table">桌號 {table}</span> : null}
            </div>
          </div>

          <div className="uu-public-hero-main">
            {data.logoDataUrl ? <img src={data.logoDataUrl} alt={`${data.restaurant} logo`} className="uu-public-logo" /> : null}
            <div className="uu-public-heading-block">
              <h1 style={{ color: tokens.title }}>{data.restaurant}</h1>
              {hasMeta ? (
                <div className="uu-public-inline-meta">
                  {data.hours ? <span>營業時間｜{data.hours}</span> : null}
                  {data.phone ? (
                    <a href={formatPhoneHref(data.phone)} className="uu-public-inline-link">
                      電話｜{data.phone}
                    </a>
                  ) : null}
                  {data.address ? (
                    <a href={formatMapHref(data.address)} target="_blank" rel="noreferrer" className="uu-public-inline-link">
                      地址｜{data.address}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {table ? (
            <div className="uu-public-table-pill" style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}>
              目前桌號：{table}
            </div>
          ) : null}
        </section>

        <section className="uu-public-card uu-public-menu-card" style={cardStyle}>
          {categoryLinks.length > 1 ? (
            <div className="uu-public-mobile-nav" aria-label="菜單分類導覽">
              <div className="uu-public-mobile-nav-scroll">
                {categoryLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="uu-public-mobile-nav-chip"
                    style={{ borderColor: tokens.border, color: tokens.accentStrong }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="uu-public-section-head is-menu-head">
            <div>
              <span className="uu-public-section-kicker">精選內容</span>
              <h2>菜單</h2>
            </div>
          </div>

          {grouped.length ? (
            grouped.map((group, index) => (
              <section key={`${group.category}-${index}`} id={categoryLinks[index]?.id} className="uu-public-section uu-public-section-refined">
                <div className="uu-public-section-title-row">
                  <div className="uu-public-section-title uu-public-section-title-refined" style={{ color: tokens.accentStrong, background: tokens.badge, borderColor: tokens.border }}>
                    <span className="uu-public-section-dot" />
                    {group.category}
                  </div>
                </div>

                <div className="uu-public-item-list uu-public-item-list-refined">
                  {group.items.map((item: any, itemIndex: number) => (
                    <div
                      key={`${group.category}-${item.name}-${itemIndex}`}
                      className={`uu-public-item uu-public-item-refined ${item.soldOut ? "is-soldout" : ""}`}
                      style={{ borderColor: tokens.border, background: tokens.surfaceSoft }}
                    >
                      <div className="uu-public-item-copy">
                        <strong style={{ color: tokens.title }}>{item.name}</strong>
                        {item.note ? <p>{item.note}</p> : null}
                        {item.soldOut ? (
                          <span className="uu-public-soldout-pill" style={{ background: tokens.soldoutBg, color: tokens.soldoutText }}>
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
            ))
          ) : (
            <div className="uu-public-empty-state" style={{ background: tokens.badge, borderColor: tokens.border }}>
              目前尚未填入菜單內容。
            </div>
          )}

          <div className="uu-public-menu-footnote" style={{ color: tokens.muted }}>
            實際供應品項與價格請以現場公告為準。
          </div>
        </section>
      </div>
    </main>
  );
}

