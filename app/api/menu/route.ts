import { supabase } from "@/lib/supabase";

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
    const menuText = String(body.menuText ?? "").trim();

    if (!restaurant) {
      return Response.json({ error: "請輸入餐廳名稱" }, { status: 400 });
    }

    if (!menuText) {
      return Response.json({ error: "請輸入菜單內容" }, { status: 400 });
    }

    const id = randomId();

    const { error } = await supabase.from("menus").insert({
      id,
      restaurant,
      phone,
      address,
      hours,
      menu_text: menuText,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ error: "儲存失敗" }, { status: 500 });
    }

    return Response.json({ id });
  } catch (error) {
    console.error("API /api/menu error:", error);
    return Response.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}