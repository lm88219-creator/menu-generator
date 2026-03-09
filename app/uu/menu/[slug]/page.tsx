export const dynamic = "force-dynamic";

import { CSSProperties } from "react";
import { getMenu, getMenuIdBySlug } from "@/lib/store";
import { getPublicThemeTokens, type ThemeType } from "@/lib/theme";
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

type ThemeTokens = ReturnType<typeof getPublicThemeTokens>;

function getThemeTokens(theme: ThemeType): ThemeTokens {
  return getPublicThemeTokens(theme);
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

