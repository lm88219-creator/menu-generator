import type { CSSProperties } from "react";

type Props = {
  restaurant: string;
  logoDataUrl?: string;
  coverImageDataUrl?: string;
  hours?: string;
  closedDay?: string;
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
  coverImageDataUrl,
  hours,
  closedDay,
  phone,
  address,
  table,
  tokens,
  cardStyle,
  formatPhoneHref,
  formatMapHref,
}: Props) {
  const visualSrc = coverImageDataUrl || logoDataUrl;

  return (
    <section className="uu-public-hero-shell" style={cardStyle}>
      <div className="uu-public-visual-card" style={{ borderColor: tokens.border, background: tokens.badge }}>
        {visualSrc ? (
          <img
            src={visualSrc}
            alt={`${restaurant} cover`}
            className={`uu-public-visual-image ${coverImageDataUrl ? "is-cover" : "is-logo"}`}
          />
        ) : (
          <div className="uu-public-visual-placeholder" style={{ color: tokens.muted }}>
            <strong style={{ color: tokens.title }}>封面準備中</strong>
            <span>{restaurant || "UU MENU"}</span>
          </div>
        )}
        <div className="uu-public-visual-overlay">
          <span className="uu-public-kicker">UU MENU</span>
          {table ? <span className="uu-public-badge-chip is-table">桌號 {table}</span> : null}
        </div>
      </div>

      <div className="uu-public-store-card">
        <h1 style={{ color: tokens.title }}>{restaurant}</h1>
        <div className="uu-public-store-meta-list">
          {hours ? (
            <div className="uu-public-store-meta-row">
              <span>營業時間</span>
              <strong>{hours}</strong>
            </div>
          ) : null}
          {closedDay ? (
            <div className="uu-public-store-meta-row">
              <span>公休日</span>
              <strong>{closedDay}</strong>
            </div>
          ) : null}
          {phone ? (
            <a href={formatPhoneHref(phone)} className="uu-public-store-meta-row is-link">
              <span>電話</span>
              <strong>{phone}</strong>
            </a>
          ) : null}
          {address ? (
            <a href={formatMapHref(address)} target="_blank" rel="noreferrer" className="uu-public-store-meta-row is-link">
              <span>地址</span>
              <strong>{address}</strong>
            </a>
          ) : null}
          {!hours && !closedDay && !phone && !address ? (
            <div className="uu-public-store-meta-row">
              <span>店家資訊</span>
              <strong>目前尚未提供</strong>
            </div>
          ) : null}
        </div>

        <div className="uu-public-store-actions">
          {phone ? (
            <a href={formatPhoneHref(phone)} className="uu-public-store-action">
              一鍵撥打
            </a>
          ) : null}
          {address ? (
            <a href={formatMapHref(address)} target="_blank" rel="noreferrer" className="uu-public-store-action is-secondary">
              開啟地圖
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
