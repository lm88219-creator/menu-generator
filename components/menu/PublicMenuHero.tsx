import type { CSSProperties } from "react";

type Props = {
  restaurant: string;
  logoDataUrl?: string;
  hours?: string;
  phone?: string;
  address?: string;
  table?: string;
  categoryCount: number;
  itemCount: number;
  tokens: {
    badge: string;
    border: string;
    text: string;
    title: string;
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
  categoryCount,
  itemCount,
  tokens,
  cardStyle,
  formatPhoneHref,
  formatMapHref,
}: Props) {
  const hasMeta = Boolean(hours || phone || address);

  return (
    <section className="uu-public-hero uu-public-hero-refined" style={cardStyle}>
      <div className="uu-public-hero-top">
        <div className="uu-public-hero-badges">
          <span className="uu-public-kicker">UU MENU</span>
          {table ? <span className="uu-public-badge-chip is-table">桌號 {table}</span> : null}
          <span className="uu-public-badge-chip">{categoryCount} 個分類</span>
          <span className="uu-public-badge-chip">{itemCount} 項菜單</span>
        </div>
      </div>

      <div className="uu-public-hero-main">
        {logoDataUrl ? <img src={logoDataUrl} alt={`${restaurant} logo`} className="uu-public-logo" /> : null}
        <div className="uu-public-heading-block">
          <h1 style={{ color: tokens.title }}>{restaurant}</h1>
          {hasMeta ? (
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
          ) : null}
        </div>
      </div>

      <div className="uu-public-action-bar">
        {phone ? (
          <a href={formatPhoneHref(phone)} className="uu-public-action-button">
            撥打電話
          </a>
        ) : null}
        {address ? (
          <a href={formatMapHref(address)} target="_blank" rel="noreferrer" className="uu-public-action-button">
            開啟導航
          </a>
        ) : null}
        <a href="#menu-sections" className="uu-public-action-button">
          直接看菜單
        </a>
      </div>

      {table ? (
        <div className="uu-public-table-pill" style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}>
          目前桌號：{table}
        </div>
      ) : null}
    </section>
  );
}
