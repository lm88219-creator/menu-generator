export const dynamic = "force-dynamic";

import { createMenu, isSlugAvailable } from "@/lib/store";
import { resolvePublicBaseUrl } from "@/lib/site";
import { pinyin } from "pinyin-pro";

function randomId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

function toEnglishSlug(text: string) {
  const value = String(text || "").trim();
  if (!value) return "";

  const py = pinyin(value, {
    toneType: "none",
    type: "array",
    nonZh: "consecutive",
  })
    .join("-")
    .toLowerCase();

  return py
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function makeAvailableSlug(base: string) {
  let safeBase = toEnglishSlug(base);

  if (!safeBase) {
    safeBase = `menu-${randomId()}`;
  }

  let candidate = safeBase;
  let count = 2;

  while (!(await isSlugAvailable(candidate))) {
    candidate = `${safeBase}-${count}`;
    count += 1;
  }

  return candidate;
}

export async function POST(req: Request) {
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

    if (!restaurant) {
      return Response.json({ error: "請輸入餐廳名稱" }, { status: 400 });
    }

    if (!menuText) {
      return Response.json({ error: "請輸入菜單內容" }, { status: 400 });
    }

    const allowedThemes = ["dark", "light", "warm", "ocean", "forest", "rose"];
    const safeTheme = allowedThemes.includes(theme) ? theme : "dark";

    // 有填自訂代稱就優先用自訂代稱，沒填就用店名自動轉英文
    const slugSource = customSlug || restaurant;
    const slug = await makeAvailableSlug(slugSource);

    const id = randomId();
    const now = Date.now();

    await createMenu(id, {
      restaurant,
      phone,
      address,
      hours,
      menuText,
      theme: safeTheme as "dark" | "light" | "warm" | "ocean" | "forest" | "rose",
      logoDataUrl,
      slug,
      createdAt: now,
      updatedAt: now,
    });

    const publicPath = `/menu/${encodeURIComponent(slug)}`;
    const publicBaseUrl = resolvePublicBaseUrl(req.url);
    const publicUrl = `${publicBaseUrl}${publicPath}`;

    return Response.json({
      id,
      slug,
      publicPath,
      publicUrl,
      shortUrl: publicPath,
    });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return Response.json({ error: "建立菜單失敗" }, { status: 500 });
  }
}