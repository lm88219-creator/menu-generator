export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";
import { createMenu, isSlugAvailable } from "@/lib/store";
import { buildMenuPathSegment } from "@/lib/menu";
import { resolvePublicBaseUrl } from "@/lib/site";

function randomId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

async function makeAvailableSlug(base: string) {
  let safeBase = buildMenuPathSegment(base, base);
  if (!safeBase) safeBase = `menu-${randomId()}`;
  let candidate = safeBase;
  let count = 2;
  while (!(await isSlugAvailable(candidate))) {
    candidate = `${safeBase}-${count}`;
    count += 1;
  }
  return candidate;
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const restaurant = String(body.restaurant ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const hours = String(body.hours ?? "").trim();
    const menuText = String(body.menuText ?? body.menu ?? "").trim();
    const theme = String(body.theme ?? "dark");
    const logoDataUrl = String(body.logoDataUrl ?? "").trim();
    const customSlug = String(body.customSlug ?? body.slug ?? "").trim();
    const isPublished = body.isPublished !== false;

    if (!restaurant) return Response.json({ error: "請輸入餐廳名稱" }, { status: 400 });
    if (!menuText) return Response.json({ error: "請輸入菜單內容" }, { status: 400 });

    const allowedThemes = ["dark", "light", "warm", "ocean", "forest", "rose", "market"];
    const safeTheme = allowedThemes.includes(theme) ? theme : "dark";
    const slug = await makeAvailableSlug(customSlug || restaurant);
    const id = randomId();
    const now = Date.now();

    await createMenu(id, { restaurant, phone, address, hours, menuText, theme: safeTheme as any, logoDataUrl, slug, createdAt: now, updatedAt: now, isPublished });

    const publicPath = `/uu/menu/${encodeURIComponent(slug)}`;
    const publicBaseUrl = resolvePublicBaseUrl(req.url);
    const publicUrl = `${publicBaseUrl}${publicPath}`;

    return Response.json({ id, slug, publicPath, publicUrl, shortUrl: publicPath });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return Response.json({ error: "建立菜單失敗" }, { status: 500 });
  }
}
