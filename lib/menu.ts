import { pinyin } from "pinyin-pro";

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
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function transliterateToSlug(value: string) {
  const base = pinyin(String(value || ""), {
    toneType: "none",
    type: "array",
    nonZh: "consecutive",
  }).join("-");

  return normalizeSlug(base);
}

export function buildMenuPathSegment(customSlug: string, restaurant: string) {
  const custom = normalizeSlug(customSlug);
  if (custom) return custom;
  return transliterateToSlug(restaurant);
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
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
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

    items.push({ category: currentCategory, name: cleanupText(soldOutTextRemoved), price: "", note: "", soldOut });
  }

  return items;
}

export function groupMenuItems(raw: string) {
  const items = parseMenuText(raw);
  const groups: { category: string; items: ParsedMenuItem[] }[] = [];

  for (const item of items) {
    const last = groups[groups.length - 1];
    if (!last || last.category !== item.category) groups.push({ category: item.category, items: [item] });
    else last.items.push(item);
  }

  return groups;
}
