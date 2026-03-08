export const THEME_VALUES = ["dark", "light", "warm", "ocean", "forest", "rose", "classic"] as const;

export type ThemeType = (typeof THEME_VALUES)[number];

export const THEME_LABELS: Record<ThemeType, string> = {
  dark: "深色經典",
  light: "簡約白",
  warm: "暖木咖啡",
  ocean: "海洋清新",
  forest: "森林自然",
  rose: "玫瑰奶茶",
  classic: "經典餐館",
};

export function isThemeType(value: string): value is ThemeType {
  return (THEME_VALUES as readonly string[]).includes(value);
}

export function normalizeTheme(value: string | undefined | null, fallback: ThemeType = "dark"): ThemeType {
  const candidate = String(value ?? "").trim();
  return isThemeType(candidate) ? candidate : fallback;
}

export function getThemeLabel(theme?: string | null) {
  return THEME_LABELS[normalizeTheme(theme, "dark")];
}
