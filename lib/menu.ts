export type ParsedMenuItem = {
  category: string;
  name: string;
  price: string;
  note?: string;
  soldOut?: boolean;
};

function cleanupText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .replace(/[\/?#%]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function buildMenuPathSegment(customSlug: string, restaurant: string) {
  const custom = normalizeSlug(customSlug);
  if (custom) return custom;
  return normalizeSlug(restaurant);
}

export function isCategoryLine(line: string) {
  if (!line) return false;
  if (line.startsWith("#")) return true;
  if (/^[\[【].+[\]】]$/.test(line)) return true;
  const parts = line.split(/\s+/);
  return parts.length === 1;
}

export function getCategoryLabel(line: string) {
  return cleanupText(line.replace(/^#/, "").replace(/^[\[【]/, "").replace(/[\]】]$/, ""));
}

export function parseMenuText(raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items: ParsedMenuItem[] = [];
  let currentCategory = "精選菜單";

  for (const line of lines) {
    if (isCategoryLine(line)) {
      currentCategory = getCategoryLabel(line);
      continue;
    }

    const soldOut = /(?:售完|sold\s*out)/i.test(line);
    const soldOutTextRemoved = line.replace(/(?:\(|（)?(?:售完|sold\s*out)(?:\)|）)?/gi, "").trim();

    const match = soldOutTextRemoved.match(/^(.*?)(?:\s+)(\$?\d+(?:\.\d{1,2})?)(?:\s*[|｜\/／-]\s*(.+))?$/);

    if (match) {
      const [, rawName, rawPrice, rawNote] = match;
      items.push({
        category: currentCategory,
        name: cleanupText(rawName),
        price: rawPrice.replace(/^\$/, ""),
        note: rawNote ? cleanupText(rawNote) : "",
        soldOut,
      });
      continue;
    }

    items.push({
      category: currentCategory,
      name: cleanupText(soldOutTextRemoved),
      price: "",
      note: "",
      soldOut,
    });
  }

  return items;
}

export function groupMenuItems(raw: string) {
  const items = parseMenuText(raw);
  const groups: { category: string; items: ParsedMenuItem[] }[] = [];

  for (const item of items) {
    const last = groups[groups.length - 1];
    if (!last || last.category !== item.category) {
      groups.push({ category: item.category, items: [item] });
      continue;
    }
    last.items.push(item);
  }

  return groups;
}
