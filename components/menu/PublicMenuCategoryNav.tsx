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
  if (!categoryLinks.length) return null;

  return (
    <div className="uu-public-mobile-nav" aria-label="菜單分類導覽">
      <div className="uu-public-nav-head">
        <div>
          <span className="uu-public-section-kicker">快速導覽</span>
          <strong>點分類可快速跳到對應區塊</strong>
        </div>
        <span className="uu-public-section-hint">共 {categoryLinks.length} 類</span>
      </div>

      <div className="uu-public-mobile-nav-scroll">
        {categoryLinks.map((link, index) => (
          <a key={link.id} href={`#${link.id}`} className="uu-public-mobile-nav-chip" style={{ borderColor, color: accentStrong }}>
            <span className="uu-public-mobile-nav-index">{String(index + 1).padStart(2, "0")}</span>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
