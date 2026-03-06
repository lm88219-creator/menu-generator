import { saveMenu, getMenu } from "@/lib/store";

function randomId() {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(req: Request) {
  const body = await req.json();

  const restaurant = String(body.restaurant ?? "").trim();
  const menuText = String(body.menuText ?? "").trim();

  if (!restaurant) return Response.json({ error: "請輸入餐廳名稱" }, { status: 400 });
  if (!menuText) return Response.json({ error: "請輸入菜單內容" }, { status: 400 });

  const id = randomId();

  // ✅ 存
  saveMenu(id, { restaurant, menuText });

  // ✅ 立刻驗證有沒有真的存到
  const saved = getMenu(id);
  if (!saved) {
    return Response.json({ error: "寫入 menus.json 失敗（未存到檔案）" }, { status: 500 });
  }

  return Response.json({ id });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") ?? "").trim();
  if (!id) return Response.json({ error: "缺少 id" }, { status: 400 });

  const data = getMenu(id);
  if (!data) return Response.json({ error: "找不到菜單" }, { status: 404 });

  return Response.json({ id, ...data });
}