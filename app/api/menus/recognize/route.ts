export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";
import { parseRecognizedMenu } from "@/lib/menu-ocr-cleaner";

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawText = String(body.text ?? "").trim();
    const existingRestaurant = String(body.restaurant ?? "").trim();
    if (!rawText) return Response.json({ error: "沒有可辨識文字" }, { status: 400 });

    const parsed = parseRecognizedMenu(rawText);
    const restaurant = existingRestaurant || parsed.restaurant;

    return Response.json({
      restaurant,
      phone: parsed.phone,
      address: parsed.address,
      hours: parsed.hours,
      menuText: parsed.menuText,
      note: parsed.menuText
        ? "辨識完成，已先幫你整理出較乾淨的店家資訊與菜單草稿；複雜版面仍可再手動微調。"
        : "已辨識出部分店家資訊，但菜單內容仍較亂，建議手動整理後再生成。",
    });
  } catch (error) {
    console.error("POST /api/menus/recognize error:", error);
    return Response.json({ error: "圖片辨識失敗" }, { status: 500 });
  }
}
