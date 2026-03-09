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

function MetaRow({
  label,
  value,
  href,
  target,
  hint,
}: {
  label: string;
  value: string;
  href?: string;
  target?: string;
  hint?: string;
}) {
  const valueBlock = (
    <>
      <strong className="uu-public-store-meta-value">{value}</strong>
      {hint ? <span className="uu-public-store-meta-pill">{hint}</span> : null}
    </>
  );

  return (
    <div className="uu-public-store-meta-row">
      <span className="uu-public-store-meta-label">{label}</span>
      {href ? (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noreferrer" : undefined}
          className="uu-public-store-meta-link"
        >
          {valueBlock}
        </a>
      ) : (
        <div className="uu-public-store-meta-static">{valueBlock}</div>
      )}
    </div>
  );
}

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
  const visualAlt = coverImageDataUrl ? `${restaurant} 封面圖` : `${restaurant} Logo`;

  return (
    <section className="uu-public-hero-shell" style={cardStyle}>
      <div className="uu-public-hero-media-block">
        <div className="uu-public-visual-card" style={{ borderColor: tokens.border, background: tokens.badge }}>
          {visualSrc ? (
            <img
              src={visualSrc}
              alt={visualAlt}
              className={`uu-public-visual-image ${coverImageDataUrl ? "is-cover" : "is-logo"}`}
            />
          ) : (
            <div className="uu-public-visual-placeholder" style={{ color: tokens.muted }}>
              <strong style={{ color: tokens.title }}>封面準備中</strong>
              <span>{restaurant || "UU MENU"}</span>
            </div>
          )}
        </div>
        {table ? <div className="uu-public-table-chip">桌號 {table}</div> : null}
      </div>

      <div className="uu-public-store-card">
        <h1 style={{ color: tokens.title }}>{restaurant}</h1>

        <div className="uu-public-store-meta-list">
          {hours ? <MetaRow label="營業時間" value={hours} /> : null}
          {closedDay ? <MetaRow label="公休日期" value={closedDay} /> : null}
          {phone ? <MetaRow label="電話預訂" value={phone} href={formatPhoneHref(phone)} hint="一鍵撥打" /> : null}
          {address ? <MetaRow label="店家地址" value={address} href={formatMapHref(address)} target="_blank" hint="開啟地圖" /> : null}
          {!hours && !closedDay && !phone && !address ? <MetaRow label="店家資訊" value="目前尚未提供" /> : null}
        </div>
      </div>
    </section>
  );
}
