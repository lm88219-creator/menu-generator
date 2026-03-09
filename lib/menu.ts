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

function extractNote(raw: string) {
  const noteMatch = raw.match(/(?:\s*[|｜／/]\s*|\s*[-－]\s+)(.+)$/);
  if (!noteMatch) return { namePart: raw, note: "" };
  return {
    namePart: raw.slice(0, noteMatch.index).trim(),
    note: cleanupText(noteMatch[1] || ""),
  };
}

function extractPrice(raw: string) {
  const match = raw.match(/^(.*?)(?:\s+)(?:\$|NT\$|nt\$)?(\d+(?:\.\d{1,2})?)(?:\s*(?:元|塊))?$/);
  if (!match) return null;
  return {
    namePart: cleanupText(match[1] || ""),
    price: String(match[2] || ""),
  };
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

    const soldOut = /(?:售完|完售|sold\s*out)/i.test(line);
    const soldOutTextRemoved = cleanupText(line.replace(/(?:\(|（)?(?:售完|完售|sold\s*out)(?:\)|）)?/gi, " "));
    const { namePart: lineWithoutNote, note } = extractNote(soldOutTextRemoved);
    const priceMatch = extractPrice(lineWithoutNote);

    if (priceMatch) {
      items.push({
        category: currentCategory,
        name: cleanupText(priceMatch.namePart),
        price: priceMatch.price,
        note,
        soldOut,
      });
      continue;
    }

    items.push({
      category: currentCategory,
      name: cleanupText(lineWithoutNote),
      price: "",
      note,
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
    if (!last || last.category !== item.category) groups.push({ category: item.category, items: [item] });
    else last.items.push(item);
  }

  return groups;
}
