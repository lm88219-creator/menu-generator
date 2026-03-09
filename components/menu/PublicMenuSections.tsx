import type { ParsedMenuItem } from "@/lib/menu";

type PublicMenuItem = ParsedMenuItem & {
  imageUrl?: string;
  imageDataUrl?: string;
};

type Group = {
  category: string;
  items: PublicMenuItem[];
};

function getItemImage(item: PublicMenuItem) {
  return item.imageDataUrl || item.imageUrl || "";
}

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
        <section key={`${group.category}-${index}`} id={categoryLinks[index]?.id} className="uu-public-category-section">
          <div className="uu-public-category-title" style={{ color: tokens.title }}>
            <span className="uu-public-category-line" style={{ background: tokens.border }} />
            <strong>{group.category}</strong>
            <span className="uu-public-category-line" style={{ background: tokens.border }} />
          </div>

          <div className="uu-public-item-stack">
            {group.items.map((item, itemIndex) => {
              const imageSrc = getItemImage(item);
              return (
                <article
                  key={`${group.category}-${item.name}-${itemIndex}`}
                  className={`uu-public-menu-item ${item.soldOut ? "is-soldout" : ""} ${imageSrc ? "has-image" : "is-text-only"}`}
                  style={{ borderColor: tokens.border, background: tokens.surfaceSoft }}
                >
                  <div className="uu-public-menu-item-copy">
                    <strong className="uu-public-menu-item-name" style={{ color: tokens.title }}>
                      {item.name}
                    </strong>
                    {item.note ? <p className="uu-public-menu-item-note">{item.note}</p> : null}
                    <div className="uu-public-menu-item-foot">
                      <span className="uu-public-menu-item-price" style={{ color: tokens.priceText }}>
                        {item.price ? `$${item.price}` : "時價"}
                      </span>
                      {item.soldOut ? (
                        <span className="uu-public-soldout-pill" style={{ background: tokens.soldoutBg, color: tokens.soldoutText }}>
                          今日售完
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {imageSrc ? (
                    <div className="uu-public-menu-item-imagewrap" style={{ borderColor: tokens.border }}>
                      <img src={imageSrc} alt={`${item.name} 圖片`} className="uu-public-menu-item-image" />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
