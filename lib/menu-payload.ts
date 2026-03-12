import { buildMenuPathSegment } from "@/lib/menu";
import { normalizeTheme, type ThemeType } from "@/lib/theme";

export type MenuPayload = {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  closedDay: string;
  menuText: string;
  coverImageDataUrl: string;
  theme: ThemeType;
  logoDataUrl: string;
  slug: string;
  isPublished: boolean;
};

const MAX_TEXT_LENGTH = {
  restaurant: 80,
  phone: 40,
  address: 180,
  hours: 80,
  closedDay: 80,
  menuText: 12000,
  logoDataUrl: 700_000,
  coverImageDataUrl: 700_000,
};

function trimField(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function readMenuPayload(body: Record<string, unknown>): MenuPayload {
  const restaurant = trimField(body.restaurant, MAX_TEXT_LENGTH.restaurant);
  const phone = trimField(body.phone, MAX_TEXT_LENGTH.phone);
  const address = trimField(body.address, MAX_TEXT_LENGTH.address);
  const hours = trimField(body.hours, MAX_TEXT_LENGTH.hours);
  const closedDay = trimField(body.closedDay, MAX_TEXT_LENGTH.closedDay);
  const menuText = trimField(body.menuText ?? body.menu, MAX_TEXT_LENGTH.menuText);
  const theme = normalizeTheme(String(body.theme ?? "dark").trim());
  const logoDataUrl = trimField(body.logoDataUrl, MAX_TEXT_LENGTH.logoDataUrl);
  const coverImageDataUrl = trimField(body.coverImageDataUrl, MAX_TEXT_LENGTH.coverImageDataUrl);
  const slug = buildMenuPathSegment(String(body.customSlug ?? body.slug ?? "").trim(), restaurant);
  const isPublished = body.isPublished !== false;

  return { restaurant, phone, address, hours, closedDay, menuText, theme, logoDataUrl, coverImageDataUrl, slug, isPublished };
}

export function validateMenuPayload(payload: MenuPayload) {
  if (!payload.restaurant) return "請輸入餐廳名稱";
  if (!payload.menuText) return "請輸入菜單內容";
  if (payload.slug && !/^[a-z0-9-]{1,50}$/.test(payload.slug)) return "網址 slug 只能使用英文、數字與 -";
  if (payload.logoDataUrl && !payload.logoDataUrl.startsWith("data:image/")) return "Logo 格式不正確，請重新上傳圖片";
  if (payload.coverImageDataUrl && !payload.coverImageDataUrl.startsWith("data:image/")) return "封面圖格式不正確，請重新上傳圖片";
  if (payload.logoDataUrl.length > MAX_TEXT_LENGTH.logoDataUrl) return "Logo 圖片太大，請壓縮後再上傳";
  if (payload.coverImageDataUrl.length > MAX_TEXT_LENGTH.coverImageDataUrl) return "封面圖太大，請壓縮後再上傳";
  if (String(payload.menuText).split(/\n+/).filter((line) => /\d/.test(line)).length > 300) return "菜單品項過多，請拆成較精簡的內容";
  return "";
}
