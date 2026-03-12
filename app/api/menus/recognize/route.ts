export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";
import { parseRecognizedMenu } from "@/lib/menu-ocr-cleaner";

type RecognitionField = "restaurant" | "phone" | "address" | "hours" | "menuText";

function getConfidenceSummary(words: Array<{ confidence?: number }>) {
  const values = words
    .map((word) => Number(word?.confidence ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) return { average: 0, label: "未提供" };

  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  const label = average >= 82 ? "高" : average >= 60 ? "中" : "低";
  return { average, label };
}

function guessFieldConfidence(field: RecognitionField, value: string, overall: number) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return 0;
  if (field === "menuText") {
    const lineCount = trimmed.split(/\r?\n/).filter(Boolean).length;
    return Math.max(40, Math.min(96, overall + Math.min(18, lineCount * 2)));
  }
  if (field === "phone") return /\d{2,}/.test(trimmed) ? Math.max(overall, 78) : Math.max(0, overall - 18);
  if (field === "address") return /(?:市|縣).+\d+號?/.test(trimmed) ? Math.max(overall, 74) : Math.max(0, overall - 10);
  if (field === "hours") return /\d{1,2}[:：]\d{2}/.test(trimmed) ? Math.max(overall, 72) : Math.max(0, overall - 12);
  return Math.max(overall, trimmed.length >= 3 ? 70 : 55);
}

function buildFieldStatus(field: RecognitionField, value: string, overall: number) {
  const trimmed = String(value || "").trim();
  return {
    field,
    label:
      field === "restaurant"
        ? "餐廳名稱"
        : field === "phone"
          ? "電話"
          : field === "address"
            ? "地址"
            : field === "hours"
              ? "營業時間"
              : "菜單內容",
    value: trimmed,
    filled: Boolean(trimmed),
    confidence: guessFieldConfidence(field, trimmed, overall),
  };
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawText = String(body.text ?? "").trim();
    const existingRestaurant = String(body.restaurant ?? "").trim();
    const words = Array.isArray(body.words) ? body.words : [];
    if (!rawText) return Response.json({ error: "沒有可辨識文字" }, { status: 400 });

    const parsed = parseRecognizedMenu(rawText, words);
    const restaurant = existingRestaurant || parsed.restaurant;
    const confidence = getConfidenceSummary(words);
    const menuCount = parsed.menuText
      .split(/\r?\n/)
      .filter((line: string) => /\d/.test(line))
      .length;

    const warnings: string[] = [];
    if (confidence.average > 0 && confidence.average < 60) warnings.push("這張圖辨識信心偏低，建議改用更正面、更清楚的菜單照片。");
    if (!restaurant) warnings.push("餐廳名稱尚未穩定辨識，請手動確認店名。");
    if (!parsed.phone) warnings.push("電話沒有穩定抓到，可直接手動補上。");
    if (!parsed.hours) warnings.push("營業時間沒有穩定抓到，建議再手動檢查。");
    if (!parsed.address) warnings.push("地址沒有完整抓到，若要公開頁顯示地圖，記得補上地址。");
    if (menuCount < 3) warnings.push("菜單項目偏少，複雜版面可能沒有完整抓到。");
    if (menuCount >= 3 && !/(主食|熱炒|湯類|湯品|飲料|小菜|海鮮|青菜|精選菜單)/.test(parsed.menuText)) {
      warnings.push("已抓到菜單，但分類還不夠完整，建議再看一下分類標題是否正確。");
    }

    const fieldStatus = [
      buildFieldStatus("restaurant", restaurant, confidence.average),
      buildFieldStatus("phone", parsed.phone, confidence.average),
      buildFieldStatus("address", parsed.address, confidence.average),
      buildFieldStatus("hours", parsed.hours, confidence.average),
      buildFieldStatus("menuText", parsed.menuText, confidence.average),
    ];

    return Response.json({
      restaurant,
      phone: parsed.phone,
      address: parsed.address,
      hours: parsed.hours,
      menuText: parsed.menuText,
      menuCount,
      confidence,
      warnings,
      fieldStatus,
      note: parsed.menuText
        ? "辨識完成，已整理出較乾淨的店家資訊、菜名價格與分類草稿；建議先勾選欄位再套用。"
        : "已辨識出部分店家資訊，但菜單內容仍較亂，建議手動整理後再生成。",
    });
  } catch (error) {
    console.error("POST /api/menus/recognize error:", error);
    return Response.json({ error: "圖片辨識失敗" }, { status: 500 });
  }
}
