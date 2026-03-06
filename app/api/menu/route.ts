export async function POST(req: Request) {
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

  const url =
    `/m?restaurant=${encodeURIComponent(restaurant)}` +
    `&phone=${encodeURIComponent(phone)}` +
    `&address=${encodeURIComponent(address)}` +
    `&hours=${encodeURIComponent(hours)}` +
    `&menu=${encodeURIComponent(menuText)}`;

  return Response.json({ url });
}