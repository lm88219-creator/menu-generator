const PHONE_RE = /(09\d{2}[-\s]?\d{3}[-\s]?\d{3}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4})/;
const HOURS_RE = /(am|pm|營業|時間|open|close|週[一二三四五六日]|星期|每日|公休|\d{1,2}[:：]\d{2})/i;
const ADDRESS_RE = /(路|街|段|巷|號|市|縣|區|鄉|鎮)/;
const CATEGORY_HINT_RE = /(主食|熱炒|湯|湯類|湯品|炸物|飲料|海鮮|招牌|小菜|快炒|飯類|麵類|鍋物|甜點|便當|冷盤|素食|肉類|魚類|青菜|蛋香|魚味|酥炸|鵝肉)/;
const CATEGORY_WORDS = ["主食", "熱炒", "湯類", "湯品", "炸物", "飲料", "海鮮", "招牌", "小菜", "快炒", "飯類", "麵類", "鍋物", "甜點", "冷盤", "青菜", "蛋香", "魚味", "酥炸", "鵝肉"];
const VALID_STANDALONE_DISHES = new Set(["白飯", "炒飯", "炒麵", "米粉", "冬粉", "肉羹", "魚湯", "蛤湯", "蚵仔", "青菜", "高麗菜", "空心菜", "菠菜", "地瓜葉", "沙拉", "腰子", "白肉", "羊肉", "豬肉"]);
const RESTAURANT_HINT_RE = /(海產|熱炒|小吃|餐廳|便當|牛肉麵|鵝肉|海鮮|食堂|咖啡|茶飲|鍋燒|鍋物|早午餐)/;
const FRAGMENT_JOINERS = [
  "炒",
  "炸",
  "煎",
  "烤",
  "滷",
  "燙",
  "拌",
  "蒸",
  "麻油",
  "三杯",
  "清炒",
  "紅燒",
  "宮保",
  "沙茶",
  "酥炸",
  "椒鹽",
  "鹽酥",
  "鹽水",
  "蒜泥",
  "蒜苗",
  "魚味",
  "蛋香",
  "十全藥膳",
  "十還膳",
  "十全",
  "藥膳",
  "上提",
  "扣",
  "扣肉",
  "紅燒",
  "白",
  "炒",
  "牛",
  "豬",
  "雞",
  "鵝",
  "蝦",
  "魚",
  "羊",
];
const DISH_WORD_FIXES: Array<[RegExp, string]> = [
  [/炒\s*8\s*球/g, "炒蝦球"],
  [/炒\s*蝦\s*蝦\s*球/g, "炒蝦球"],
  [/炒\s*螺\s*肉/g, "炒螺肉"],
  [/球\s*(\d{2,4})$/g, "蝦球 $1"],
  [/魚\s*柳/g, "魚柳"],
  [/肥\s*腸/g, "肥腸"],
  [/麻\s*油/g, "麻油"],
  [/三\s*杯/g, "三杯"],
  [/炒\s*飯/g, "炒飯"],
  [/炒\s*麵/g, "炒麵"],
  [/炒\s*米\s*粉/g, "炒米粉"],
  [/冬\s*粉/g, "冬粉"],
  [/青\s*蛙/g, "青蛙"],
  [/螺\s*肉/g, "螺肉"],
  [/鵝\s*肉/g, "鵝肉"],
  [/鹽\s*水/g, "鹽水"],
  [/魚\s*味/g, "魚味"],
  [/蛋\s*香/g, "蛋香"],
  [/酥\s*炸/g, "酥炸"],
  [/才\s*首/g, "香酥"],
  [/星\s*桔/g, "宮保"],
  [/理\s*雞/g, "椒鹽雞"],
  [/十\s*還\s*膳/g, "十全藥膳"],
  [/十\s*全\s*藥\s*膳/g, "十全藥膳"],
  [/十\s*全\s*藥\s*膳\s*湯/g, "十全藥膳湯"],
  [/和\s*肉/g, "扣肉"],
  [/沙\s*茶/g, "沙茶"],
  [/紅\s*灶/g, "紅燒"],
  [/清\s*炒/g, "清炒"],
  [/蒜\s*苗/g, "蒜苗"],
  [/二\s*對\s*飯/g, "白飯"],
  [/米\s*粉/g, "米粉"],
  [/湯\s*類/g, "湯類"],
  [/主\s*食/g, "主食"],
  [/熱\s*炒/g, "熱炒"],
  [/腰\s*子/g, "腰子"],
  [/沙\s*拉/g, "沙拉"],
  [/紅\s*燒\s*青\s*蛙/g, "紅燒青蛙"],
  [/清\s*炒\s*花\s*枝/g, "清炒花枝"],
  [/友\s*愛\s*熱\s*炒/g, "友愛熱炒"],
  [/外\s*送/g, "外送"],
  [/預\s*約/g, "預約"],
  [/營\s*業\s*時\s*間/g, "營業時間"],
];
const MENU_BLACKLIST_RE = /(facebook|instagram|line\s*id|官方|訂位|預約|外送|歡迎|營業時間|地址|電話|digital|menu|logo|uu\s*menu|qr)/i;

function normalizeDigits(value: string) {
  return value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248));
}

function applyWordFixes(value: string) {
  let next = value;
  for (const [pattern, replacement] of DISH_WORD_FIXES) next = next.replace(pattern, replacement);
  return next;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function looksLikeAddress(line: string) {
  return ADDRESS_RE.test(line) && /(路|街|段|巷|號|市|縣|區|鄉|鎮)/.test(line) && /\d/.test(line);
}

function looksLikeHours(line: string) {
  return HOURS_RE.test(line) && /(am|pm|\d{1,2}[:：]\d{2})/i.test(line);
}

function looksLikePhone(line: string) {
  return PHONE_RE.test(line);
}

function countCjk(line: string) {
  return (line.match(/[\u4e00-\u9fff]/g) || []).length;
}

function countLetters(line: string) {
  return (line.match(/[A-Za-z]/g) || []).length;
}

function isShortDishFragment(name: string) {
  const value = name.replace(/\s+/g, "");
  if (!value) return true;
  if (VALID_STANDALONE_DISHES.has(value)) return false;
  const cjk = countCjk(value);
  return cjk <= 1;
}

function containsStrongNoise(line: string) {
  const letters = countLetters(line);
  const cjk = countCjk(line);
  return /[€£@#]/.test(line) || (letters > cjk && letters >= 3);
}

export function cleanOcrLine(input: string) {
  let line = normalizeDigits(String(input || ""))
    .replace(/[“”"'`~^]/g, "")
    .replace(/[【】\[\]{}<>]/g, " ")
    .replace(/[｜|¦]/g, " ")
    .replace(/[•●▪◆★☆]/g, " ")
    .replace(/[，,;；、]/g, " ")
    .replace(/[（）()]+/g, " ")
    .replace(/[＄$]/g, " ")
    .replace(/[／/]/g, " ")
    .replace(/[：:]/g, ":")
    .replace(/[。．]/g, " ")
    .replace(/[€£¥@#]/g, " ")
    .trim();

  line = line
    .replace(/([0-9]{2,4})[Iil|｜]\b/g, "$1")
    .replace(/([0-9]{2,4})\]/g, "$1")
    .replace(/\bNT\$?\s*/gi, "")
    .replace(/\$\s*(\d{2,4})/g, "$1")
    .replace(/[?？×xX]+$/g, "")
    .replace(/[A-Za-z]{4,}/g, " ")
    .replace(/(^|\s)[A-Za-z](?=\s|$)/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  line = applyWordFixes(line)
    .replace(/\s{2,}/g, " ")
    .trim();

  return line;
}

function isMostlyNoise(line: string) {
  if (!line) return true;
  const cjk = countCjk(line);
  const digits = (line.match(/\d/g) || []).length;
  const letters = countLetters(line);
  if (cjk === 0 && digits === 0) return true;
  if (letters > cjk * 1.5 && cjk < 2 && digits < 2) return true;
  if (line.length <= 1) return true;
  return false;
}

function extractPrice(line: string) {
  const all = [...line.matchAll(/(\d{2,4})(?!.*\d)/g)];
  const match = all.at(-1);
  if (!match) return "";
  const value = Number(match[1]);
  if (value < 10 || value > 5000) return "";
  return match[1];
}

function cleanupDishName(name: string) {
  return applyWordFixes(
    name
      .replace(/^[^\u4e00-\u9fffA-Za-z]+/, "")
      .replace(/[A-Za-z]{2,}/g, " ")
      .replace(/[^\u4e00-\u9fffA-Za-z0-9\-\s]+/g, " ")
      .replace(/\b[\d]{1,2}\b/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function normalizeMenuLine(line: string) {
  const price = extractPrice(line);
  if (!price) return "";
  let name = cleanupDishName(line.slice(0, line.lastIndexOf(price)).trim());
  name = name.replace(/(主食|熱炒|湯類|湯品|招牌|海鮮|小菜|青菜|蛋香|魚味)$/, "").trim();
  if (!name) return "";
  const cjk = countCjk(name);
  if (cjk === 0 && name.length < 3) return "";
  if (cjk < 1) return "";
  if (name.length > 14) return "";
  if (MENU_BLACKLIST_RE.test(name)) return "";
  if (looksLikeAddress(name) || looksLikeHours(name) || looksLikePhone(name)) return "";
  if (isShortDishFragment(name)) return "";
  return `${name} ${price}`;
}

function normalizeCategory(line: string) {
  const value = applyWordFixes(line.replace(/\s+/g, "").trim()).replace(/\d+/g, "").trim();
  if (!value) return "";
  if (value.length > 8) return "";
  if (/[A-Za-z]{2,}/.test(value) && !/[\u4e00-\u9fff]/.test(value)) return "";
  const direct = CATEGORY_WORDS.find((item) => value.includes(item));
  return direct || (CATEGORY_HINT_RE.test(value) ? value : "");
}

function extractFullTextHours(rawText: string) {
  const text = normalizeDigits(rawText).replace(/[\n\r]+/g, " ");
  const match = text.match(/((?:AM|PM|am|pm)?\s*\d{1,2}[:：]\d{2}\s*[~\-－到至]\s*(?:AM|PM|am|pm)?\s*\d{1,2}[:：]\d{2})/);
  return cleanOcrLine(match?.[1] || "");
}

function extractAddressLine(lines: string[]) {
  return (
    lines.find((line) => looksLikeAddress(line) && !/(元|\$|\d{2,4}\s*$)/.test(line) && /[\u4e00-\u9fff]/.test(line)) ||
    ""
  );
}

function splitMergedMenuText(text: string) {
  const normalized = cleanOcrLine(text)
    .replace(/\b(主\s*食|熱\s*炒|湯\s*類|湯\s*品|炸\s*物|飲\s*料|海\s*鮮|招\s*牌|小\s*菜|青\s*菜|鵝\s*肉|魚\s*味|蛋\s*香)\b/g, (_m) => `\n${cleanOcrLine(_m)}\n`)
    .replace(/([\u4e00-\u9fff]{2,10})\s*(\d{2,4})(?=\s|$)/g, (_, name, price) => `\n${String(name).trim()} ${price}\n`)
    .replace(/(\d{2,4})\s*([\u4e00-\u9fff]{2,8})/g, "$1\n$2")
    .replace(/\n{2,}/g, "\n");

  return normalized
    .split(/\n+/)
    .map(cleanOcrLine)
    .filter(Boolean);
}

function shouldDropLine(line: string) {
  if (!line) return true;
  if (MENU_BLACKLIST_RE.test(line)) return true;
  if (looksLikePhone(line) || looksLikeHours(line) || looksLikeAddress(line)) return true;
  if (/^[\d\s:-]+$/.test(line)) return true;
  if (countCjk(line) === 0 && !extractPrice(line)) return true;
  if (containsStrongNoise(line) && !extractPrice(line)) return true;
  return false;
}

function buildSmartLines(rawText: string) {
  const baseLines = String(rawText || "")
    .split(/\r?\n+/)
    .map(cleanOcrLine)
    .filter(Boolean);

  const merged = splitMergedMenuText(String(rawText || ""));
  return [...baseLines, ...merged]
    .map(cleanOcrLine)
    .filter(Boolean)
    .filter((line) => !isMostlyNoise(line))
    .slice(0, 800);
}

function dedupeWithPreference(lines: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const line of lines) {
    const key = line.replace(/\s+/g, "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(line);
  }
  return output;
}

function maybeJoinFragments(lines: string[]) {
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    const next = lines[index + 1] || "";
    if (!current) continue;

    const currentPrice = extractPrice(current);
    const nextPrice = extractPrice(next);
    const currentCategory = normalizeCategory(current);

    if (currentCategory) {
      output.push(currentCategory);
      continue;
    }

    if (currentPrice) {
      output.push(current);
      continue;
    }

    const compact = current.replace(/\s+/g, "");
    const nextNamePart = cleanupDishName(next.replace(/\d{2,4}/g, "").trim()).replace(/\s+/g, "");

    if (
      next &&
      nextPrice &&
      compact &&
      compact.length <= 6 &&
      nextNamePart &&
      nextNamePart.length <= 8 &&
      FRAGMENT_JOINERS.some((item) => compact.endsWith(item) || item.endsWith(compact) || compact.startsWith(item))
    ) {
      const joinedName = cleanupDishName(`${compact}${nextNamePart}`);
      const joinedLine = normalizeMenuLine(`${joinedName} ${nextPrice}`);
      if (joinedLine) {
        output.push(joinedLine);
        index += 1;
        continue;
      }
    }

    if (!currentPrice && nextPrice) {
      const joinedLine = normalizeMenuLine(`${compact} ${nextPrice}`);
      if (joinedLine) {
        output.push(joinedLine);
        index += 1;
        continue;
      }
    }

    output.push(current);
  }

  return output;
}

function mergeSplitPriceLines(lines: string[]) {
  const output: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i];
    const next = lines[i + 1] || "";
    if (!current) continue;
    if (!extractPrice(current) && /^\d{2,4}$/.test(next.trim())) {
      const joined = normalizeMenuLine(`${current} ${next.trim()}`);
      if (joined) {
        output.push(joined);
        i += 1;
        continue;
      }
    }
    output.push(current);
  }
  return output;
}

function formatMenuDraft(lines: string[]) {
  const output: string[] = [];
  let hasMenu = false;

  for (const line of lines) {
    if (!line || shouldDropLine(line)) continue;
    const category = normalizeCategory(line);
    if (category) {
      if (!output.length || output[output.length - 1] !== category) {
        output.push(category);
      }
      continue;
    }

    const menuLine = normalizeMenuLine(line);
    if (!menuLine) continue;
    if (!hasMenu) {
      output.push("精選菜單");
      hasMenu = true;
    }
    output.push(menuLine);
  }

  return dedupeWithPreference(output).filter((line, index, array) => {
    if (CATEGORY_WORDS.includes(line) && array[index + 1] && CATEGORY_WORDS.includes(array[index + 1])) return false;
    return true;
  });
}

function restaurantScore(line: string) {
  const cleaned = cleanOcrLine(line).replace(/\s+/g, "").trim();
  if (!cleaned) return -999;
  if (cleaned.length < 2 || cleaned.length > 18) return -999;
  if (looksLikePhone(cleaned) || looksLikeHours(cleaned) || looksLikeAddress(cleaned)) return -999;
  if (MENU_BLACKLIST_RE.test(cleaned)) return -999;
  const cjk = countCjk(cleaned);
  const letters = countLetters(cleaned);
  if (cjk < 2) return -999;
  if (letters > 0) return -999;
  let score = cjk;
  if (RESTAURANT_HINT_RE.test(cleaned)) score += 10;
  if (/友愛|魚香|阿明|老|小|大/.test(cleaned)) score += 1;
  return score;
}

function detectRestaurantName(lines: string[]) {
  const candidates = lines
    .map((line) => ({ line: cleanOcrLine(line), score: restaurantScore(line) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.line || "";
}

function detectAddress(lines: string[], rawText: string) {
  const direct = extractAddressLine(lines);
  if (direct) return direct;
  const flattened = cleanOcrLine(rawText).replace(/\s+/g, " ");
  const match = flattened.match(/([\u4e00-\u9fff]{0,8}(?:市|縣)[\u4e00-\u9fff0-9]{0,20}(?:區|鄉|鎮)?[\u4e00-\u9fff0-9]{0,20}(?:路|街)[\u4e00-\u9fff0-9巷段弄]{0,20}\d+號?)/);
  return cleanOcrLine(match?.[1] || "");
}

function detectHours(lines: string[], rawText: string) {
  const full = extractFullTextHours(rawText);
  if (full) return full;
  const candidate = lines.find((line) => looksLikeHours(line) && !looksLikePhone(line) && !looksLikeAddress(line));
  return candidate || "";
}

function detectPhone(lines: string[], rawText: string) {
  const fromLines = lines.find((line) => looksLikePhone(line));
  if (fromLines) return fromLines.match(PHONE_RE)?.[1] || fromLines.match(PHONE_RE)?.[0] || fromLines;
  const match = normalizeDigits(rawText).match(PHONE_RE);
  return cleanOcrLine(match?.[1] || match?.[0] || "");
}

function removeMetadataLines(lines: string[], metadata: string[]) {
  const keys = new Set(metadata.filter(Boolean).map((item) => item.replace(/\s+/g, "").trim()));
  return lines.filter((line) => {
    const key = line.replace(/\s+/g, "").trim();
    if (keys.has(key)) return false;
    if (restaurantScore(line) > 0) return false;
    if (looksLikePhone(line) || looksLikeHours(line) || looksLikeAddress(line)) return false;
    if (containsStrongNoise(line) && !extractPrice(line)) return false;
    return true;
  });
}

export function parseRecognizedMenu(rawText: string) {
  const initialLines = buildSmartLines(rawText);
  const restaurant = detectRestaurantName(initialLines);
  const phone = detectPhone(initialLines, rawText);
  const hours = detectHours(initialLines, rawText);
  const address = detectAddress(initialLines, rawText);

  const filtered = removeMetadataLines(initialLines, [restaurant, phone, hours, address]);
  const merged = maybeJoinFragments(filtered);
  const mergedPrices = mergeSplitPriceLines(merged);
  const menuLines = formatMenuDraft(mergedPrices);

  return {
    restaurant,
    phone,
    hours,
    address,
    menuText: menuLines.join("\n").trim(),
  };
}
