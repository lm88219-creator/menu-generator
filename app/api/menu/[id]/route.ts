export const dynamic = "force-dynamic";

import { deleteMenu, getMenu, isSlugAvailable, updateMenu } from "@/lib/store";
import { resolvePublicBaseUrl } from "@/lib/site";
import { buildMenuPathSegment } from "@/lib/menu";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await getMenu(id);

    if (!data) {
      return Response.json({ error: "找不到菜單" }, { status: 404 });
    }

    return Response.json({ id, ...data });
  } catch (error) {
    console.error("GET /api/menu/[id] error:", error);
    return Response.json({ error: "讀取菜單失敗" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const restaurant = String(body.restaurant ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const hours = String(body.hours ?? "").trim();
    const menuText = String(body.menuText ?? body.menu ?? "").trim();
    const theme = String(body.theme ?? "dark").trim();
    const logoDataUrl = String(body.logoDataUrl ?? "").trim();
    const slug = buildMenuPathSegment(String(body.customSlug ?? body.slug ?? "").trim(), restaurant);

    if (!restaurant) {
      return Response.json({ error: "請輸入餐廳名稱" }, { status: 400 });
    }

    if (!menuText) {
      return Response.json({ error: "請輸入菜單內容" }, { status: 400 });
    }

    if (slug && !(await isSlugAvailable(slug, id))) {
      return Response.json({ error: "這個菜單網址已被使用，請換一個店名或自訂代稱" }, { status: 409 });
    }

    const allowedThemes = ["dark", "light", "warm", "ocean", "forest", "rose"];
    const safeTheme = allowedThemes.includes(theme) ? theme : "dark";

    const updated = await updateMenu(id, {
      restaurant,
      phone,
      address,
      hours,
      menuText,
      theme: safeTheme as "dark" | "light" | "warm" | "ocean" | "forest" | "rose",
      logoDataUrl,
      slug,
    });

    if (!updated) {
      return Response.json({ error: "找不到菜單" }, { status: 404 });
    }

    const publicPath = updated.slug ? `/menu/${encodeURIComponent(updated.slug)}` : `/m/${id}`;
    const publicBaseUrl = resolvePublicBaseUrl(req.url);
    const publicUrl = `${publicBaseUrl}${publicPath}`;

    return Response.json({
      success: true,
      id,
      data: updated,
      publicPath,
      publicUrl,
      shortUrl: publicPath,
    });
  } catch (error) {
    console.error("PATCH /api/menu/[id] error:", error);
    return Response.json({ error: "更新菜單失敗" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const data = await getMenu(id);

    if (!data) {
      return Response.json({ error: "找不到菜單" }, { status: 404 });
    }

    await deleteMenu(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/menu/[id] error:", error);
    return Response.json({ error: "刪除菜單失敗" }, { status: 500 });
  }
}
