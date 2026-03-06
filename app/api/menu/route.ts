export async function POST(req: Request) {
  const body = await req.json();

  const restaurant = String(body.restaurant ?? "").trim();
  const menuText = String(body.menuText ?? "").trim();

  if (!restaurant) {
    return Response.json({ error: "請輸入餐廳名稱" }, { status: 400 });
  }

  if (!menuText) {
    return Response.json({ error: "請輸入菜單內容" }, { status: 400 });
  }

  const url =
    `/m?restaurant=${encodeURIComponent(restaurant)}` +
    `&menu=${encodeURIComponent(menuText)}`;

  return Response.json({ url });
}