export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";

function cleanLine(line: string) {
  return String(line || "")
    .replace(/[|｜]/g, " ")
    .replace(/[•●◆▪︎]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeMenuLine(line: string) {
  return /\d{1,4}/.test(line) && /[\u4e00-\u9fffA-Za-z]/.test(line);
}

function detectPhone(lines: string[]) {
  return lines.find((line) => /(09\d{2}[-\s]?\d{3}[-\s]?\d{3}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4})/.test(line)) || "";
}

function detectHours(lines: string[]) {
  return lines.find((line) => /(am|pm|營業|時間|open|close|\d{1,2}[:：]\d{2})/i.test(line)) || "";
}

function detectAddress(lines: string[]) {
  return lines.find((line) => /(路|街|段|巷|號|市|縣|區|鄉|鎮)/.test(line) && !/\$|元/.test(line)) || "";
}

function detectRestaurant(lines: string[]) {
  return (
    lines.find((line) => {
      if (line.length < 2 || line.length > 24) return false;
      if (/\d/.test(line)) return false;
      if (/(菜單|menu|qr|電話|地址|營業|時間|公休)/i.test(line)) return false;
      return true;
    }) || ""
  );
}

function normalizeMenuText(lines: string[]) {
  const candidates = lines.filter((line) => line && !/(電話|地址|營業|時間|公休|menu|qr|facebook|instagram|line)/i.test(line));
  const result: string[] = [];
  let currentCategory = "";

  for (const line of candidates) {
    if (looksLikeMenuLine(line)) {
      if (!currentCategory) {
        currentCategory = "精選菜單";
        result.push(currentCategory);
      }
      result.push(line.replace(/\s{2,}/g, " "));
      continue;
    }

    if (!/\d/.test(line) && line.length <= 12) {
      currentCategory = line;
      result.push(line);
    }
  }

  return Array.from(new Set(result)).join("\n").trim();
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawText = String(body.text ?? "").trim();
    const existingRestaurant = String(body.restaurant ?? "").trim();
    if (!rawText) return Response.json({ error: "沒有可辨識文字" }, { status: 400 });

    const lines = rawText
      .split(/\r?\n+/)
      .map(cleanLine)
      .filter(Boolean)
      .slice(0, 300);

    const restaurant = existingRestaurant || detectRestaurant(lines);
    const phone = detectPhone(lines);
    const hours = detectHours(lines);
    const address = detectAddress(lines);
    const menuText = normalizeMenuText(lines);

    return Response.json({
      restaurant,
      phone,
      address,
      hours,
      menuText,
      note: menuText
        ? "辨識完成，已把可判讀的店家資訊與菜單內容填入草稿。複雜版面可能仍需要手動調整。"
        : "已辨識出部分店家資訊，但菜單內容較亂，建議手動整理後再生成。",
    });
  } catch (error) {
    console.error("POST /api/menus/recognize error:", error);
    return Response.json({ error: "圖片辨識失敗" }, { status: 500 });
  }
}
