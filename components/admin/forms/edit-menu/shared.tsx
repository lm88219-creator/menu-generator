import type { ReactNode } from "react";
import { parseMenuText } from "@/lib/menu";

export type ThemeType = "dark" | "light" | "warm" | "ocean" | "forest" | "rose" | "classic";

export type InitialData = {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  menuText: string;
  theme: ThemeType;
  logoDataUrl?: string;
  slug?: string;
  isPublished?: boolean;
};

export type MenuItemForm = {
  uid: string;
  category: string;
  name: string;
  price: string;
  note: string;
  soldOut: boolean;
};

export const THEME_OPTIONS: Array<{ value: ThemeType; label: string; desc: string; accent: string; preview: [string, string, string] }> = [
  { value: "dark", label: "深色經典", desc: "適合熱炒、宵夜、餐酒館。對比清楚、穩重耐看。", accent: "#6ea8ff", preview: ["#101723", "#172235", "#0d1420"] },
  { value: "light", label: "簡約白", desc: "閱讀感最乾淨，適合一般餐廳與簡潔菜單。", accent: "#d6b267", preview: ["#f7f8fa", "#ffffff", "#eef2f7"] },
  { value: "warm", label: "暖木咖啡", desc: "偏溫暖餐飲感，適合咖啡館、小吃、家常風格。", accent: "#d08a54", preview: ["#2d211a", "#412d21", "#221812"] },
  { value: "ocean", label: "海洋清新", desc: "色調明亮清爽，適合海鮮、健康餐、早午餐。", accent: "#4da3ff", preview: ["#10202d", "#173247", "#0d1923"] },
  { value: "forest", label: "森林自然", desc: "較有自然感，適合便當、蔬食、手作餐飲。", accent: "#6fb17a", preview: ["#142118", "#203126", "#101813"] },
  { value: "rose", label: "玫瑰奶茶", desc: "較柔和有質感，適合甜點、飲料與輕食。", accent: "#d78aa4", preview: ["#2b1a21", "#3a222b", "#1f1418"] },
  { value: "classic", label: "經典餐館", desc: "米白紙感搭配餐館紅，適合熱炒、鵝肉、小吃與家常菜。", accent: "#b91c1c", preview: ["#fbf7f1", "#ffffff", "#f6ebe6"] },
];

export function createFormItem(partial?: Partial<MenuItemForm>): MenuItemForm {
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: partial?.category ?? "精選菜單",
    name: partial?.name ?? "",
    price: partial?.price ?? "",
    note: partial?.note ?? "",
    soldOut: partial?.soldOut ?? false,
  };
}

export function toFormItems(menuText: string): MenuItemForm[] {
  const parsed = parseMenuText(menuText);
  return parsed.length
    ? parsed.map((item) => createFormItem({
        category: item.category || "精選菜單",
        name: item.name || "",
        price: item.price || "",
        note: item.note || "",
        soldOut: Boolean(item.soldOut),
      }))
    : [createFormItem()];
}

export function toMenuText(items: MenuItemForm[]) {
  const groups = new Map<string, MenuItemForm[]>();
  items.forEach((item) => {
    const category = item.category.trim() || "精選菜單";
    if (!item.name.trim() && !item.price.trim() && !item.note.trim()) return;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category)!.push(item);
  });

  const sections: string[] = [];
  groups.forEach((groupItems, category) => {
    sections.push(category);
    groupItems.forEach((item) => {
      const name = item.name.trim();
      const price = item.price.trim();
      const note = item.note.trim();
      const soldOut = item.soldOut ? " 售完" : "";
      if (price && note) sections.push(`${name} ${price} | ${note}${soldOut}`.trim());
      else if (price) sections.push(`${name} ${price}${soldOut}`.trim());
      else if (note) sections.push(`${name} | ${note}${soldOut}`.trim());
      else sections.push(`${name}${soldOut}`.trim());
    });
    sections.push("");
  });

  return sections.join("\n").trim();
}

export function parseDeskInput(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[,，\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function sanitizeSlugInput(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function getPreviewTokens(theme: ThemeType) {
  if (theme === "dark") return {
    shell: "linear-gradient(180deg, #0a1018 0%, #111927 100%)",
    panel: "rgba(16, 23, 35, 0.92)",
    soft: "rgba(143, 183, 255, 0.12)",
    border: "rgba(255,255,255,0.08)",
    accent: "#8fb7ff",
    accentSoft: "rgba(143,183,255,0.16)",
    title: "#f4f8ff",
    text: "#eef4ff",
    muted: "#9baccc",
    hero: "linear-gradient(135deg, rgba(143,183,255,0.2), rgba(10,16,24,0.1))",
    priceBg: "rgba(143,183,255,0.12)",
    surface: "rgba(7, 11, 18, 0.66)",
    section: "#d6e4ff",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "warm") return {
    shell: "linear-gradient(180deg, #211812 0%, #32241a 100%)",
    panel: "rgba(65, 46, 33, 0.92)",
    soft: "rgba(208, 138, 84, 0.16)",
    border: "rgba(255,255,255,0.08)",
    accent: "#d9a06e",
    accentSoft: "rgba(217,160,110,0.16)",
    title: "#fff6ee",
    text: "#fff4ea",
    muted: "#dcc0a8",
    hero: "linear-gradient(135deg, rgba(217,160,110,0.22), rgba(62,43,31,0.12))",
    priceBg: "rgba(255,237,219,0.1)",
    surface: "rgba(38, 26, 18, 0.6)",
    section: "#ffe1c3",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "ocean") return {
    shell: "linear-gradient(180deg, #081721 0%, #102838 100%)",
    panel: "rgba(17, 41, 58, 0.94)",
    soft: "rgba(91, 193, 255, 0.16)",
    border: "rgba(255,255,255,0.08)",
    accent: "#76d1ff",
    accentSoft: "rgba(118,209,255,0.16)",
    title: "#effaff",
    text: "#eef9ff",
    muted: "#acd0df",
    hero: "linear-gradient(135deg, rgba(118,209,255,0.22), rgba(11,28,40,0.12))",
    priceBg: "rgba(118,209,255,0.12)",
    surface: "rgba(8, 20, 30, 0.58)",
    section: "#dff6ff",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "forest") return {
    shell: "linear-gradient(180deg, #0d1510 0%, #19251b 100%)",
    panel: "rgba(25, 39, 29, 0.94)",
    soft: "rgba(137, 209, 151, 0.15)",
    border: "rgba(255,255,255,0.08)",
    accent: "#9bdfaa",
    accentSoft: "rgba(155,223,170,0.16)",
    title: "#f1fff4",
    text: "#f0fff4",
    muted: "#b4cfba",
    hero: "linear-gradient(135deg, rgba(155,223,170,0.2), rgba(14,24,17,0.12))",
    priceBg: "rgba(155,223,170,0.12)",
    surface: "rgba(11, 20, 13, 0.56)",
    section: "#dff8e5",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "rose") return {
    shell: "linear-gradient(180deg, #171015 0%, #251820 100%)",
    panel: "rgba(49, 31, 38, 0.94)",
    soft: "rgba(227, 160, 182, 0.16)",
    border: "rgba(255,255,255,0.08)",
    accent: "#f0b2c7",
    accentSoft: "rgba(240,178,199,0.16)",
    title: "#fff4f8",
    text: "#fff2f6",
    muted: "#dfb8c7",
    hero: "linear-gradient(135deg, rgba(240,178,199,0.22), rgba(38,24,31,0.12))",
    priceBg: "rgba(240,178,199,0.12)",
    surface: "rgba(28, 17, 22, 0.56)",
    section: "#ffe2eb",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "classic") return {
    shell: "radial-gradient(circle at top, #ffffff 0%, #fbf7f1 45%, #f6f0e6 100%)",
    panel: "rgba(255, 255, 255, 0.92)",
    soft: "rgba(185, 28, 28, 0.08)",
    border: "rgba(17,24,39,0.08)",
    accent: "#b91c1c",
    accentSoft: "rgba(185,28,28,0.12)",
    title: "#111827",
    text: "#1f2937",
    muted: "#6b7280",
    hero: "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.70))",
    priceBg: "rgba(185,28,28,0.08)",
    surface: "rgba(246, 235, 230, 0.72)",
    section: "#7a1212",
    line: "rgba(17,24,39,0.08)",
  };
  return {
    shell: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
    panel: "rgba(255, 255, 255, 0.96)",
    soft: "rgba(211, 177, 107, 0.18)",
    border: "rgba(15,23,42,0.08)",
    accent: "#c7922e",
    accentSoft: "rgba(199,146,46,0.14)",
    title: "#243244",
    text: "#263244",
    muted: "#728097",
    hero: "linear-gradient(135deg, rgba(199,146,46,0.16), rgba(255,255,255,0.82))",
    priceBg: "rgba(199,146,46,0.12)",
    surface: "rgba(245, 247, 250, 0.92)",
    section: "#866225",
    line: "rgba(15,23,42,0.07)",
  };
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="uu-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
