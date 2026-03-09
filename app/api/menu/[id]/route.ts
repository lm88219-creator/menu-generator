export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";
import { deleteMenu, getMenu, isSlugAvailable, updateMenu } from "@/lib/store";
import { resolvePublicBaseUrl } from "@/lib/site";
import { getPublicMenuPath } from "@/lib/routes";
import { readMenuPayload, validateMenuPayload } from "@/lib/menu-payload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const data = await getMenu(id);
    if (!data) return Response.json({ error: "找不到菜單" }, { status: 404 });
    return Response.json({ id, ...data });
  } catch {
    return Response.json({ error: "讀取菜單失敗" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const payload = readMenuPayload(body);
    const payloadError = validateMenuPayload(payload);

    if (payloadError) return Response.json({ error: payloadError }, { status: 400 });
    if (payload.slug && !(await isSlugAvailable(payload.slug, id))) return Response.json({ error: "這個菜單網址已被使用" }, { status: 409 });

    const updated = await updateMenu(id, payload);
    if (!updated) return Response.json({ error: "找不到菜單" }, { status: 404 });

    const publicPath = getPublicMenuPath(updated.slug || id);
    const publicBaseUrl = resolvePublicBaseUrl(req.url);
    return Response.json({ success: true, id, data: updated, publicPath, publicUrl: `${publicBaseUrl}${publicPath}`, shortUrl: publicPath });
  } catch (error) {
    console.error("PATCH /api/menu/[id] error:", error);
    return Response.json({ error: "更新菜單失敗" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "請先登入管理員後台" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const data = await getMenu(id);
    if (!data) return Response.json({ error: "找不到菜單" }, { status: 404 });
    await deleteMenu(id);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "刪除菜單失敗" }, { status: 500 });
  }
}
