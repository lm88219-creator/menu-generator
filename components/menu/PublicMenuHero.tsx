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
  const infoCards = [
    hours ? { label: "營業時間", value: hours } : null,
    phone ? { label: "電話", value: phone, href: formatPhoneHref(phone) } : null,
    address ? { label: "地址", value: address, href: formatMapHref(address), external: true } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; href?: string; external?: boolean }>;

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
          <p className="uu-public-hero-tagline">手機掃碼就能看菜單，若有售完或價格調整，請以現場公告為準。</p>
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

      {infoCards.length ? (
        <div className="uu-public-info-cards">
          {infoCards.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="uu-public-info-card"
              >
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </a>
            ) : (
              <div key={item.label} className="uu-public-info-card">
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            )
          )}
        </div>
      ) : null}

      {table ? (
        <div className="uu-public-table-pill" style={{ background: tokens.badge, borderColor: tokens.border, color: tokens.text }}>
          目前桌號：{table}
        </div>
      ) : null}
    </section>
  );
}
