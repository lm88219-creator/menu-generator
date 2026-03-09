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
}) {
  if (categoryLinks.length <= 1) return null;

  return (
    <div className="uu-public-mobile-nav" aria-label="菜單分類導覽">
      <div className="uu-public-mobile-nav-scroll">
        {categoryLinks.map((link) => (
          <a key={link.id} href={`#${link.id}`} className="uu-public-mobile-nav-chip" style={{ borderColor, color: accentStrong }}>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
