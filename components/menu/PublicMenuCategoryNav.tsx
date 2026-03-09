"use client";

import { useEffect, useMemo, useState } from "react";

type LinkItem = {
  label: string;
  id: string;
};

export function PublicMenuCategoryNav({
  categoryLinks,
}: {
  categoryLinks: LinkItem[];
  borderColor?: string;
  accentStrong?: string;
  muted?: string;
}) {
  const initialId = categoryLinks[0]?.id ?? "";
  const [activeId, setActiveId] = useState(initialId);

  const ids = useMemo(() => categoryLinks.map((item) => item.id), [categoryLinks]);

  useEffect(() => {
    if (!ids.length) return;

    const fromHash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (fromHash && ids.includes(fromHash)) {
      setActiveId(fromHash);
    } else {
      setActiveId(ids[0]);
    }

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  if (categoryLinks.length <= 1) return null;

  return (
    <div className="uu-public-category-nav-shell">
      <nav className="uu-public-category-nav" aria-label="菜單分類導覽">
        <div className="uu-public-category-nav-scroll">
          {categoryLinks.map((link) => {
            const isActive = link.id === activeId;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`uu-public-category-chip${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActiveId(link.id)}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
