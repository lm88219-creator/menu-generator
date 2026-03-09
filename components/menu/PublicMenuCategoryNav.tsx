type LinkItem = {
  label: string;
  id: string;
};

export function PublicMenuCategoryNav({
  categoryLinks,
  borderColor,
  accentStrong,
}: {
  categoryLinks: LinkItem[];
  borderColor: string;
  accentStrong: string;
  muted: string;
}) {
  if (categoryLinks.length <= 1) return null;

  return (
    <div className="uu-public-category-nav-shell">
      <div className="uu-public-category-nav" aria-label="菜單分類導覽" style={{ borderColor }}>
        <div className="uu-public-category-nav-copy">
          <strong style={{ color: accentStrong }}>分類導航膠囊區</strong>
        </div>
        <div className="uu-public-category-nav-scroll">
          {categoryLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="uu-public-category-chip" style={{ borderColor, color: accentStrong }}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
