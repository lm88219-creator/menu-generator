type LinkItem = {
  label: string;
  id: string;
  count?: number;
};

export function PublicMenuCategoryNav({
  categoryLinks,
  borderColor,
  accentStrong,
}: {
  categoryLinks: LinkItem[];
  borderColor: string;
  accentStrong: string;
}) {
  if (categoryLinks.length <= 1) return null;

  return (
    <div className="uu-public-mobile-nav" aria-label="菜單分類導覽">
      <div className="uu-public-mobile-nav-scroll">
        {categoryLinks.map((link) => (
          <a key={link.id} href={`#${link.id}`} className="uu-public-mobile-nav-chip" style={{ borderColor, color: accentStrong }}>
            <span>{link.label}</span>
            {link.count ? <small>{link.count}</small> : null}
          </a>
        ))}
      </div>
    </div>
  );
}
