export const dynamic = "force-dynamic";

import { isAdminAuthenticated } from "@/lib/auth";
import { createMenu, isSlugAvailable } from "@/lib/store";
import { buildMenuPathSegment } from "@/lib/menu";
import { resolvePublicBaseUrl } from "@/lib/site";
import { getPublicMenuPath } from "@/lib/routes";
import { readMenuPayload, validateMenuPayload } from "@/lib/menu-payload";

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
    const payload = readMenuPayload(body);
    const payloadError = validateMenuPayload(payload);

    if (payloadError) return Response.json({ error: payloadError }, { status: 400 });

    const slug = await makeAvailableSlug(payload.slug || payload.restaurant);
    const id = randomId();
    const now = Date.now();

    await createMenu(id, { ...payload, theme: payload.theme, slug, createdAt: now, updatedAt: now, isPublished: payload.isPublished });

    const publicPath = getPublicMenuPath(slug);
    const publicBaseUrl = resolvePublicBaseUrl(req.url);
    const publicUrl = `${publicBaseUrl}${publicPath}`;

    return Response.json({ id, slug, publicPath, publicUrl, shortUrl: publicPath });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return Response.json({ error: "建立菜單失敗" }, { status: 500 });
  }
}
