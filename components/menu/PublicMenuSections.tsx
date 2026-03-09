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
  categoryLinks: Array<{ label: string; id: string; count?: number }>;
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
    accentTint: string;
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
            <span className="uu-public-section-count" style={{ color: tokens.muted }}>{group.items.length} 項</span>
          </div>

          <div className="uu-public-item-list uu-public-item-list-refined">
            {group.items.map((item, itemIndex) => (
              <div
                key={`${group.category}-${item.name}-${itemIndex}`}
                className={`uu-public-item uu-public-item-refined ${item.soldOut ? "is-soldout" : ""}`}
                style={{ borderColor: tokens.border, background: tokens.surfaceSoft }}
              >
                <div className="uu-public-item-copy">
                  <div className="uu-public-item-mainrow">
                    <strong style={{ color: tokens.title }}>{item.name}</strong>
                    {!item.soldOut && item.note ? (
                      <span className="uu-public-item-note-tag" style={{ background: tokens.accentTint, color: tokens.accentStrong }}>
                        備註
                      </span>
                    ) : null}
                  </div>
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
