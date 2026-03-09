import type { CSSProperties } from "react";

type Props = {
  restaurant: string;
  logoDataUrl?: string;
  hours?: string;
  phone?: string;
  address?: string;
  table?: string;
  tokens: {
    badge: string;
    border: string;
    text: string;
    title: string;
    accentStrong: string;
    muted: string;
    accentTint: string;
  };
  cardStyle: CSSProperties;
  formatPhoneHref: (phone: string) => string;
  formatMapHref: (address: string) => string;
};

export function PublicMenuHero({
  restaurant,
  logoDataUrl,
  hours,
  phone,
  address,
  table,
  tokens,
  cardStyle,
  formatPhoneHref,
  formatMapHref,
}: Props) {
  const metaCards = [
    { label: "營業時間", value: hours || "未提供" },
    { label: "電話", value: phone || "未提供" },
    { label: "地址", value: address || "未提供" },
  ];

  const overviewChips = [
    hours ? "今日可營業資訊" : "營業資訊待補",
    phone ? "可直接撥號" : "電話未提供",
    address ? "可開啟導航" : "地址未提供",
  ];

  return (
    <section className="uu-public-hero uu-public-hero-refined" style={cardStyle}>
      <div className="uu-public-hero-top">
        <div className="uu-public-hero-badges">
          <span className="uu-public-kicker">UU MENU</span>
          {table ? <span className="uu-public-badge-chip is-table">桌號 {table}</span> : null}
          {hours ? <span className="uu-public-badge-chip">今日營業</span> : null}
        </div>
      </div>

      <div className="uu-public-hero-main">
        {logoDataUrl ? <img src={logoDataUrl} alt={`${restaurant} logo`} className="uu-public-logo" /> : null}
        <div className="uu-public-heading-block">
          <h1 style={{ color: tokens.title }}>{restaurant}</h1>
          <p className="uu-public-hero-copy" style={{ color: tokens.muted }}>
            線上菜單已整理完成，價格與供應狀態請以現場公告為準。
          </p>

          <div className="uu-public-inline-meta">
            {hours ? <span>營業時間｜{hours}</span> : null}
            {phone ? (
              <a href={formatPhoneHref(phone)} className="uu-public-inline-link">
                電話｜{phone}
              </a>
            ) : null}
            {address ? (
              <a href={formatMapHref(address)} target="_blank" rel="noreferrer" className="uu-public-inline-link">
                地址｜{address}
              </a>
            ) : null}
          </div>

          <div className="uu-public-hero-actions">
            {phone ? (
              <a href={formatPhoneHref(phone)} className="uu-public-hero-action">
                撥打電話
              </a>
            ) : null}
            {address ? (
              <a href={formatMapHref(address)} target="_blank" rel="noreferrer" className="uu-public-hero-action">
                開啟導航
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="uu-public-hero-overview">
        {overviewChips.map((item) => (
          <span key={item} className="uu-public-hero-overview-chip" style={{ background: tokens.badge, borderColor: tokens.border }}>
            {item}
          </span>
        ))}
      </div>

      <div className="uu-public-hero-meta-grid">
        {metaCards.map((item) => (
          <div key={item.label} className="uu-public-hero-meta-card" style={{ background: tokens.badge, borderColor: tokens.border }}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      {table ? (
        <div className="uu-public-table-pill" style={{ background: tokens.accentTint, borderColor: tokens.border, color: tokens.text }}>
          目前桌號：{table}
        </div>
      ) : null}
    </section>
  );
}
