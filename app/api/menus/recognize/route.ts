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

function buildFieldStatus(field: RecognitionField, value: string) {
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
    if (confidence.average > 0 && confidence.average < 60) warnings.push("這張圖辨識信心偏低，建議改用更正面、更清楚的菜單照片。")
    if (!restaurant) warnings.push("餐廳名稱尚未穩定辨識，請手動確認店名。")
    if (!parsed.phone) warnings.push("電話沒有穩定抓到，可直接手動補上。")
    if (!parsed.hours) warnings.push("營業時間沒有穩定抓到，建議再手動檢查。")
    if (menuCount < 3) warnings.push("菜單項目偏少，複雜版面可能沒有完整抓到。")

    const fieldStatus = [
      buildFieldStatus("restaurant", restaurant),
      buildFieldStatus("phone", parsed.phone),
      buildFieldStatus("address", parsed.address),
      buildFieldStatus("hours", parsed.hours),
      buildFieldStatus("menuText", parsed.menuText),
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
        ? "辨識完成，已先幫你整理出較乾淨的店家資訊與菜單草稿；請看下方辨識摘要再確認。"
        : "已辨識出部分店家資訊，但菜單內容仍較亂，建議手動整理後再生成。",
    });
  } catch (error) {
    console.error("POST /api/menus/recognize error:", error);
    return Response.json({ error: "圖片辨識失敗" }, { status: 500 });
  }
}
