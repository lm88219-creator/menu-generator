import { buildMenuPathSegment, parseMenuText } from "@/lib/menu";
import { normalizeTheme, type ThemeType } from "@/lib/theme";

export type MenuPayload = {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  menuText: string;
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
  menuText: 12000,
  logoDataUrl: 700_000,
};

function trimField(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function readMenuPayload(body: Record<string, unknown>): MenuPayload {
  const restaurant = trimField(body.restaurant, MAX_TEXT_LENGTH.restaurant);
  const phone = trimField(body.phone, MAX_TEXT_LENGTH.phone);
  const address = trimField(body.address, MAX_TEXT_LENGTH.address);
  const hours = trimField(body.hours, MAX_TEXT_LENGTH.hours);
  const menuText = trimField(body.menuText ?? body.menu, MAX_TEXT_LENGTH.menuText);
  const theme = normalizeTheme(String(body.theme ?? "dark").trim());
  const logoDataUrl = trimField(body.logoDataUrl, MAX_TEXT_LENGTH.logoDataUrl);
  const slug = buildMenuPathSegment(String(body.customSlug ?? body.slug ?? "").trim(), restaurant);
  const isPublished = body.isPublished !== false;

  return { restaurant, phone, address, hours, menuText, theme, logoDataUrl, slug, isPublished };
}

function isAllowedLogoDataUrl(value: string) {
  if (!value) return true;
  return /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(value);
}

export function validateMenuPayload(payload: MenuPayload) {
  if (!payload.restaurant) return "請輸入餐廳名稱";
  if (!payload.menuText) return "請輸入菜單內容";
  if (payload.logoDataUrl.length > MAX_TEXT_LENGTH.logoDataUrl) return "Logo 圖片太大，請壓縮後再上傳";
  if (!isAllowedLogoDataUrl(payload.logoDataUrl)) return "Logo 只支援 PNG、JPG、WEBP 或 GIF 圖片";

  const parsedItems = parseMenuText(payload.menuText).filter((item) => Boolean(item.name));
  if (!parsedItems.length) return "請至少輸入 1 個菜單品項";
  if (parsedItems.length > 300) return "菜單品項太多，請分批整理後再建立";

  return "";
}
