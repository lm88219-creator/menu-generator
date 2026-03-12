const PHONE_RE = /(09\d{2}[-\s]?\d{3}[-\s]?\d{3}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4})/;
const HOURS_RE = /(am|pm|營業|時間|open|close|週[一二三四五六日]|星期|\d{1,2}[:：]\d{2})/i;
const ADDRESS_RE = /(路|街|段|巷|號|市|縣|區|鄉|鎮)/;
const CATEGORY_HINT_RE = /(主食|熱炒|湯|湯類|炸物|飲料|海鮮|招牌|小菜|快炒|飯|麵|鍋|甜點|便當|冷盤|素食|肉類|魚類|青菜|蛋香|魚味|酥炸|鵝肉)/;

function normalizeDigits(value: string) {
  return value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248));
}

export function cleanOcrLine(input: string) {
  let line = normalizeDigits(String(input || ""))
    .replace(/[“”"'`~^]/g, "")
    .replace(/[【】\[\]{}<>]/g, " ")
    .replace(/[｜|¦]/g, " ")
    .replace(/[•●▪◆★☆]/g, " ")
    .replace(/[，,;；]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  line = line
    .replace(/([0-9]{2,4})[Iil|]\b/g, "$1")
    .replace(/([0-9]{2,4})\]/g, "$1")
    .replace(/\bNT\$?\s*/gi, "")
    .replace(/\$\s*(\d{2,4})/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return line;
}

function isMostlyNoise(line: string) {
  if (!line) return true;
  const cjk = (line.match(/[\u4e00-\u9fff]/g) || []).length;
  const digits = (line.match(/\d/g) || []).length;
  const letters = (line.match(/[A-Za-z]/g) || []).length;
  if (cjk === 0 && digits === 0) return true;
  if (letters > cjk * 2 && cjk < 2 && digits < 2) return true;
  return false;
}

function extractPrice(line: string) {
  const match = line.match(/(\d{2,4})(?!.*\d)/);
  if (!match) return "";
  const value = Number(match[1]);
  if (value < 5 || value > 5000) return "";
  return match[1];
}

function normalizeMenuLine(line: string) {
  const price = extractPrice(line);
  if (!price) return "";
  let name = line.slice(0, line.lastIndexOf(price)).trim();
  name = name
    .replace(/^[^\u4e00-\u9fffA-Za-z]+/, "")
    .replace(/[^\u4e00-\u9fffA-Za-z0-9()（）\-\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!name) return "";
  const cjk = (name.match(/[\u4e00-\u9fff]/g) || []).length;
  if (cjk === 0 && name.length < 3) return "";
  return `${name} ${price}`;
}

function normalizeCategory(line: string) {
  const value = line.replace(/\s+/g, "").trim();
  if (!value) return "";
  if (value.length > 8) return "";
  if (/\d/.test(value)) return "";
  if (/[A-Za-z]{4,}/.test(value) && !/[\u4e00-\u9fff]/.test(value)) return "";
  return value;
}

export function parseRecognizedMenu(rawText: string) {
  const lines = String(rawText || "")
    .split(/\r?\n+/)
    .map(cleanOcrLine)
    .filter(Boolean)
    .filter((line) => !isMostlyNoise(line))
    .slice(0, 320);

  const restaurant =
    lines.find((line) => {
      if (line.length < 2 || line.length > 24) return false;
      if (/\d/.test(line)) return false;
      if (PHONE_RE.test(line) || HOURS_RE.test(line) || ADDRESS_RE.test(line)) return false;
      if (/(菜單|menu|qr|電話|地址|營業|時間|公休|logo)/i.test(line)) return false;
      return /[\u4e00-\u9fff]/.test(line);
    }) || "";

  const phone = lines.find((line) => PHONE_RE.test(line)) || "";
  const hours = lines.find((line) => HOURS_RE.test(line) && !PHONE_RE.test(line)) || "";
  const address = lines.find((line) => ADDRESS_RE.test(line) && !/\$|元/.test(line)) || "";

  const result: string[] = [];
  let currentCategory = "";

  for (const rawLine of lines) {
    if (rawLine === restaurant || rawLine === phone || rawLine === hours || rawLine === address) continue;
    if (/(菜單|menu|qr|facebook|instagram|line官方|line id)/i.test(rawLine)) continue;

    const categoryCandidate = normalizeCategory(rawLine);
    if (categoryCandidate && CATEGORY_HINT_RE.test(categoryCandidate)) {
      if (result[result.length - 1] !== categoryCandidate) {
        currentCategory = categoryCandidate;
        result.push(categoryCandidate);
      }
      continue;
    }

    const menuLine = normalizeMenuLine(rawLine);
    if (menuLine) {
      if (!currentCategory) {
        currentCategory = "精選菜單";
        if (result[result.length - 1] !== currentCategory) result.push(currentCategory);
      }
      result.push(menuLine);
    }
  }

  const deduped: string[] = [];
  for (const line of result) {
    if (deduped[deduped.length - 1] !== line) deduped.push(line);
  }

  return {
    restaurant,
    phone,
    hours,
    address,
    menuText: deduped.join("\n").trim(),
  };
}
