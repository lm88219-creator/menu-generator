import type { ParsedMenuItem } from "@/lib/menu";

type Group = {
  category: string;
  items: ParsedMenuItem[];
};

export function PublicMenuSections({
  grouped,
  categoryLinks,
  tokens,
}: {
  grouped: Group[];
  categoryLinks: Array<{ label: string; id: string }>;
  tokens: {
    border: string;
    badge: string;
    title: string;
    accentStrong: string;
    muted: string;
    surfaceSoft: string;
    priceText: string;
    priceBg: string;
    soldoutBg: string;
    soldoutText: string;
  };
}) {
  if (!grouped.length) {
    return (
      <div className="uu-public-empty-state" style={{ background: tokens.badge, borderColor: tokens.border }}>
        目前尚未填入菜單內容。
      </div>
    );
  }

  return (
    <>
      {grouped.map((group, index) => (
        <section key={`${group.category}-${index}`} id={categoryLinks[index]?.id} className="uu-public-section uu-public-section-refined">
          <div className="uu-public-section-title-row">
            <div className="uu-public-section-title uu-public-section-title-refined" style={{ color: tokens.accentStrong, background: tokens.badge, borderColor: tokens.border }}>
              <span className="uu-public-section-dot" />
              {group.category}
            </div>
          </div>

          <div className="uu-public-item-list uu-public-item-list-refined">
            {group.items.map((item, itemIndex) => (
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
      ))}
    </>
  );
}
