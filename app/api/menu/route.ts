import { saveMenu } from "@/lib/store";

function randomId() {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const restaurant = String(body.restaurant ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const hours = String(body.hours ?? "").trim();
    const menuText = String(body.menuText ?? body.menu ?? "").trim();

    if (!restaurant) {
      return Response.json({ error: "請輸入餐廳名稱" }, { status: 400 });
    }

    if (!menuText) {
      return Response.json({ error: "請輸入菜單內容" }, { status: 400 });
    }

    const id = randomId();

    await saveMenu(id, {
      restaurant,
      phone,
      address,
      hours,
      menuText,
    });

    return Response.json({ id });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return Response.json({ error: "建立菜單失敗" }, { status: 500 });
  }
}