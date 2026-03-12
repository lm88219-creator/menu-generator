export const dynamic = "force-dynamic";

import { CSSProperties } from "react";
import { groupMenuItems } from "@/lib/menu";
import { getMenu, getMenuIdBySlug } from "@/lib/store";
import { getPublicThemeTokens, type ThemeType } from "@/lib/theme";
import { PublicMenuCategoryNav } from "@/components/menu/PublicMenuCategoryNav";
import { PublicMenuHero } from "@/components/menu/PublicMenuHero";
import { PublicMenuSections } from "@/components/menu/PublicMenuSections";

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

function toCategoryNavLabel(category: string) {
  return category.split("｜")[0]?.trim() || category.trim();
}


export default async function MenuPage({
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
  const tokens = getPublicThemeTokens(theme);
  const categoryLinks = grouped.map((group, index) => ({
    label: toCategoryNavLabel(group.category),
    id: toSectionId(group.category, index),
  }));

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
    ["--uu-public-bg" as string]: tokens.bg,
  };

  const cardStyle: CSSProperties = {
    background: tokens.surface,
    borderColor: tokens.border,
    boxShadow: tokens.shadow,
  };

  return (
    <main className="uu-public-shell" style={shellStyle}>
      <div id="top" />
      <div className="uu-public-container uu-public-container-refined uu-public-page-v2">
        <PublicMenuHero
          restaurant={data.restaurant}
          logoDataUrl={data.logoDataUrl}
          coverImageDataUrl={data.coverImageDataUrl}
          hours={data.hours}
          closedDay={data.closedDay}
          phone={data.phone}
          address={data.address}
          table={table}
          tokens={tokens}
          cardStyle={cardStyle}
          formatPhoneHref={formatPhoneHref}
          formatMapHref={formatMapHref}
        />

        <PublicMenuCategoryNav
          categoryLinks={categoryLinks}
          borderColor={tokens.border}
          accentStrong={tokens.accentStrong}
          muted={tokens.muted}
        />

        <section className="uu-public-card uu-public-menu-card uu-public-menu-card-v2" style={cardStyle}>
          <PublicMenuSections grouped={grouped} categoryLinks={categoryLinks} tokens={tokens} />
        </section>

        <a href="#top" className="uu-public-floating-top-link" aria-label="回到頁面頂端">
          <span className="uu-public-floating-top-link-icon">↑</span>
          <span className="uu-public-floating-top-link-label">Top</span>
        </a>
      </div>
    </main>
  );
}
