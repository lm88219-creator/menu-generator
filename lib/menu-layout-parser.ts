export type OcrWordBox = {
  text?: string;
  bbox?: { x0?: number; y0?: number; x1?: number; y1?: number };
  confidence?: number;
};

type NormalizedWord = {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  xc: number;
  yc: number;
};

type Row = {
  y: number;
  text: string;
  x0: number;
  x1: number;
};

type Column = {
  x0: number;
  x1: number;
  rows: Row[];
};

const CATEGORY_WORDS = ["鵝肉", "主食", "熱炒", "酥炸", "魚", "青菜", "湯", "蛋香", "魚味"];
const RESTAURANT_HINT_RE = /(海產|熱炒|小吃|餐廳|鵝肉|海鮮|食堂|便當)/;
const ADDRESS_RE = /(市|縣|區|路|街|段|巷|弄|號)/;
const HOURS_RE = /((?:AM|PM|am|pm)?\s*\d{1,2}[:：]\d{2}\s*[~\-－到至]\s*(?:AM|PM|am|pm)?\s*\d{1,2}[:：]\d{2})/;
const PHONE_RE = /(09\d{2}[-\s]?\d{3}[-\s]?\d{3}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4})/;

function normalizeDigits(value: string) {
  return value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248));
}

function cleanWord(value: string) {
  return normalizeDigits(String(value || ""))
    .replace(/[“”"'`~^]/g, "")
    .replace(/[【】\[\]{}<>]/g, "")
    .replace(/[｜|¦]/g, "")
    .replace(/[•●▪◆★☆]/g, "")
    .replace(/[€£¥@#]/g, "")
    .replace(/[／/]/g, "")
    .replace(/[：]/g, ":")
    .replace(/\s+/g, " ")
    .trim();
}

function countCjk(value: string) {
  return (value.match(/[\u4e00-\u9fff]/g) || []).length;
}

function countLetters(value: string) {
  return (value.match(/[A-Za-z]/g) || []).length;
}

function normalizeCategory(value: string) {
  const compact = cleanWord(value).replace(/\s+/g, "");
  return CATEGORY_WORDS.find((item) => compact.includes(item)) || "";
}

function looksLikeDish(value: string) {
  const compact = cleanWord(value).replace(/\s+/g, "");
  if (!compact) return false;
  if (normalizeCategory(compact)) return false;
  return countCjk(compact) >= 2;
}

function extractPrice(text: string) {
  const matches = [...cleanWord(text).matchAll(/(\d{2,4})(?!.*\d)/g)];
  const value = matches.at(-1)?.[1] || "";
  if (!value) return "";
  const num = Number(value);
  return num >= 10 && num <= 5000 ? value : "";
}

function normalizeMenuLine(text: string) {
  const price = extractPrice(text);
  if (!price) return "";
  const compact = cleanWord(text)
    .replace(new RegExp(`${price}$`), "")
    .replace(/[A-Za-z]{2,}/g, " ")
    .replace(/[^\u4e00-\u9fff0-9\s]/g, " ")
    .replace(/\b\d{1,2}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (countCjk(compact) < 2 || compact.length > 14) return "";
  return `${compact} ${price}`;
}

function normalizeWords(words: OcrWordBox[]) {
  const normalized: NormalizedWord[] = [];
  for (const item of words || []) {
    const text = cleanWord(item?.text || "");
    const x0 = Number(item?.bbox?.x0 ?? 0);
    const y0 = Number(item?.bbox?.y0 ?? 0);
    const x1 = Number(item?.bbox?.x1 ?? 0);
    const y1 = Number(item?.bbox?.y1 ?? 0);
    if (!text || x1 <= x0 || y1 <= y0) continue;
    if (countCjk(text) === 0 && !/\d/.test(text) && countLetters(text) === 0) continue;
    normalized.push({ text, x0, y0, x1, y1, xc: (x0 + x1) / 2, yc: (y0 + y1) / 2 });
  }
  return normalized.sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
}

function clusterRows(words: NormalizedWord[], tolerance = 18) {
  const rows: Row[] = [];
  for (const word of [...words].sort((a, b) => (a.yc - b.yc) || (a.x0 - b.x0))) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(last.y - word.yc) <= tolerance) {
      last.text = `${last.text} ${word.text}`.replace(/\s+/g, " ").trim();
      last.x0 = Math.min(last.x0, word.x0);
      last.x1 = Math.max(last.x1, word.x1);
      last.y = (last.y + word.yc) / 2;
    } else {
      rows.push({ y: word.yc, text: word.text, x0: word.x0, x1: word.x1 });
    }
  }
  return rows.map((row) => ({ ...row, text: cleanWord(row.text) })).filter((row) => row.text);
}

function buildColumns(words: NormalizedWord[]) {
  const sorted = [...words].sort((a, b) => a.x0 - b.x0);
  const columns: Column[] = [];
  const gapThreshold = 56;

  for (const word of sorted) {
    const last = columns[columns.length - 1];
    if (!last || word.x0 - last.x1 > gapThreshold) {
      columns.push({ x0: word.x0, x1: word.x1, rows: [] });
    } else {
      last.x1 = Math.max(last.x1, word.x1);
    }
  }

  for (const column of columns) {
    const columnWords = words.filter((word) => word.xc >= column.x0 - 6 && word.xc <= column.x1 + 6);
    column.rows = clusterRows(columnWords, 20);
  }

  return columns.filter((column) => column.rows.length >= 2);
}

function pickRestaurant(topRows: Row[]) {
  const candidates = topRows
    .map((row) => cleanWord(row.text).replace(/\s+/g, ""))
    .filter((text) => text && countCjk(text) >= 3 && countLetters(text) === 0 && !PHONE_RE.test(text) && !ADDRESS_RE.test(text) && !HOURS_RE.test(text));
  const hinted = candidates.find((text) => RESTAURANT_HINT_RE.test(text));
  return hinted || candidates.sort((a, b) => b.length - a.length)[0] || "";
}

function pickPhone(topText: string) {
  return cleanWord(topText.match(PHONE_RE)?.[1] || topText.match(PHONE_RE)?.[0] || "");
}

function pickHours(topText: string) {
  return cleanWord(topText.match(HOURS_RE)?.[1] || "");
}

function pickAddress(topRows: Row[], topText: string) {
  const row = topRows.find((item) => ADDRESS_RE.test(item.text) && /\d/.test(item.text));
  if (row) return cleanWord(row.text);
  const full = cleanWord(topText);
  const match = full.match(/([\u4e00-\u9fff]{0,8}(?:市|縣)[\u4e00-\u9fff0-9]{0,20}(?:區|鄉|鎮)?[\u4e00-\u9fff0-9]{0,20}(?:路|街)[\u4e00-\u9fff0-9巷段弄]{0,20}\d+號?)/);
  return cleanWord(match?.[1] || "");
}

function parseColumn(column: Column) {
  const rows = column.rows.map((row) => cleanWord(row.text)).filter(Boolean);
  const output: string[] = [];
  let category = "";

  for (let i = 0; i < rows.length; i += 1) {
    const current = rows[i];
    const next = rows[i + 1] || "";
    const foundCategory = normalizeCategory(current);
    if (foundCategory) {
      category = foundCategory;
      if (!output.includes(category)) output.push(category);
      continue;
    }

    const normalized = normalizeMenuLine(current);
    if (normalized) {
      if (!category && output.length === 0) output.push("精選菜單");
      output.push(normalized);
      continue;
    }

    if (looksLikeDish(current) && /^\d{2,4}$/.test(next)) {
      const joined = normalizeMenuLine(`${current} ${next}`);
      if (joined) {
        if (!category && output.length === 0) output.push("精選菜單");
        output.push(joined);
        i += 1;
      }
    }
  }

  return output;
}

export function parseOcrWordsToStructuredMenu(words: OcrWordBox[]) {
  const normalized = normalizeWords(words);
  if (!normalized.length) {
    return { restaurant: "", phone: "", hours: "", address: "", menuLines: [] as string[] };
  }

  const minY = Math.min(...normalized.map((word) => word.y0));
  const maxY = Math.max(...normalized.map((word) => word.y1));
  const splitY = minY + (maxY - minY) * 0.22;
  const topWords = normalized.filter((word) => word.y1 <= splitY);
  const menuWords = normalized.filter((word) => word.y0 > splitY - 4);

  const topRows = clusterRows(topWords, 22);
  const topText = topRows.map((row) => row.text).join(" ");
  const restaurant = pickRestaurant(topRows);
  const phone = pickPhone(topText);
  const hours = pickHours(topText);
  const address = pickAddress(topRows, topText);

  const columns = buildColumns(menuWords);
  const menuLines: string[] = [];
  for (const column of columns) {
    for (const line of parseColumn(column)) {
      if (!line) continue;
      const prev = menuLines[menuLines.length - 1];
      if (prev !== line) menuLines.push(line);
    }
  }

  const deduped = menuLines.filter((line, index) => menuLines.indexOf(line) === index);
  return { restaurant, phone, hours, address, menuLines: deduped };
}
