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
  if (theme === "dark") return { accent: "#1d4ed8", badge: "#dbeafe", border: "#dbe3f1", bg: "#ffffff" };
  if (theme === "warm") return { accent: "#9a5b24", badge: "#fff1de", border: "#ead8c3", bg: "#fffaf5" };
  if (theme === "ocean") return { accent: "#0b72a9", badge: "#dff4ff", border: "#d7eaf3", bg: "#f8fdff" };
  if (theme === "forest") return { accent: "#2f6b3f", badge: "#e6f3e9", border: "#d6e4d8", bg: "#fbfefb" };
  if (theme === "rose") return { accent: "#b35c7a", badge: "#ffedf3", border: "#efd7e0", bg: "#fffafd" };
  return { accent: "#2563eb", badge: "#eaf1ff", border: "#dde6f4", bg: "#ffffff" };
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
    background: `linear-gradient(180deg, ${tokens.bg} 0%, #f5f7fb 100%)`,
  };

  return (
    <main className="uu-public-shell" style={shellStyle}>
      <div className="uu-public-container">
        <section className="uu-public-hero">
          <div className="uu-public-kicker">UU MENU</div>
          {table ? <div className="uu-public-table">桌號 {table}</div> : null}
          {data.logoDataUrl ? <img src={data.logoDataUrl} alt={`${data.restaurant} logo`} className="uu-public-logo" /> : null}
          <h1>{data.restaurant}</h1>
          <p>掃碼即可查看菜單，手機閱讀更清楚、字更大、價格更好對齊。</p>
        </section>

        <section className="uu-public-card">
          <div className="uu-public-info-grid">
            {data.phone ? <InfoItem label="電話" value={data.phone} href={`tel:${data.phone}`} /> : null}
            {data.hours ? <InfoItem label="營業時間" value={data.hours} /> : null}
            {data.address ? <InfoItem label="地址" value={data.address} full /> : null}
          </div>
        </section>

        <section className="uu-public-card">
          {grouped.map((group) => (
            <section key={group.category} className="uu-public-section">
              <div className="uu-public-section-title" style={{ color: tokens.accent, background: tokens.badge, borderColor: tokens.border }}>
                {group.category}
              </div>
              <div className="uu-public-item-list">
                {group.items.map((item, index) => (
                  <div key={`${group.category}-${item.name}-${index}`} className={`uu-public-item ${item.soldOut ? "is-soldout" : ""}`} style={{ borderColor: tokens.border }}>
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

function InfoItem({ label, value, href, full = false }: { label: string; value: string; href?: string; full?: boolean }) {
  const content = href ? <a href={href}>{value}</a> : <span>{value}</span>;
  return (
    <div className={`uu-public-info ${full ? "is-full" : ""}`}>
      <small>{label}</small>
      {content}
    </div>
  );
}
