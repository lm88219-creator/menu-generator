import type { CSSProperties } from "react";
import { buildMenuPathSegment, normalizeSlug } from "@/lib/menu";
import { getPublicThemeTokens, getPreviewTokens, getThemeSurface, type ThemeType } from "@/lib/theme";

export type HomeFormState = {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  menu: string;
  theme: ThemeType;
  logoDataUrl: string;
  customSlug: string;
};

export type HomeRecognitionField = {
  field: "restaurant" | "phone" | "address" | "hours";
  label: string;
  value: string;
  filled: boolean;
  selected: boolean;
  applied: boolean;
  confidence?: number;
  status: "ready" | "review" | "missing";
};

export type HomeRecognitionItem = {
  id: string;
  name: string;
  price: string;
  category: string;
  selected: boolean;
  confidence?: number;
  status: "ready" | "review" | "missing";
};

export type HomeRecognitionSummary = {
  fileName: string;
  previewUrl: string;
  note: string;
  sourceLabel: string;
  menuCount: number;
  selectedMenuCount: number;
  confidenceAverage: number;
  confidenceLabel: string;
  warnings: string[];
  fieldStatus: HomeRecognitionField[];
  menuItems: HomeRecognitionItem[];
};

export type HomeThemeOption = {
  value: ThemeType;
  label: string;
  desc: string;
  accent: string;
  preview: [string, string, string];
};

export function getInitialHomeFormState(): HomeFormState {
  return {
    restaurant: "",
    phone: "",
    address: "",
    hours: "",
    menu: "",
    theme: "warm",
    logoDataUrl: "",
    customSlug: "",
  };
}

export function getExampleHomeFormState(): HomeFormState {
  return {
    restaurant: "友愛熱炒",
    phone: "0912-345-678",
    address: "嘉義市西區友愛路100號",
    hours: "17:00 - 01:00",
    theme: "warm",
    logoDataUrl: "",
    customSlug: "",
    menu: `# 鵝肉\n鹽水鵝肉 200\n麻油鵝肉 220\n\n# 主食\n炒飯 80\n炒麵 80\n\n# 熱炒\n炒蝦球 200\n燙青菜 50`,
  };
}

export function sanitizeCustomSlug(value: string) {
  return normalizeSlug(value);
}

export function nextSlugFromRestaurant(name: string, previousCustomSlug: string) {
  if (previousCustomSlug) return previousCustomSlug;
  return buildMenuPathSegment("", name);
}

export function parseMenuLines(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isLikelyCategory(line: string) {
  const parts = line.split(/\s+/);
  return parts.length === 1;
}

export function getHomeButtonStyles(args: {
  currentTheme: {
    inputBorder: string;
    buttonGhostText: string;
    buttonMainText: string;
  };
  theme: ThemeType;
}) {
  const { currentTheme, theme } = args;

  const ghostButtonStyle: CSSProperties = {
    padding: "10px 16px",
    borderRadius: 12,
    border: currentTheme.inputBorder,
    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
    color: currentTheme.buttonGhostText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  };

  const surface = getThemeSurface(theme);
  const mainButtonStyle: CSSProperties = {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(180deg, ${surface.border}, ${surface.text === "#ffffff" ? "#0f172a" : surface.text})`,
    color: currentTheme.buttonMainText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  };

  return { ghostButtonStyle, mainButtonStyle };
}

export function getThemeCardStyle(theme: ThemeType, selectedTheme: ThemeType): CSSProperties {
  const surface = getThemeSurface(theme);
  return {
    borderRadius: 18,
    padding: 16,
    border: selectedTheme === theme ? `1px solid ${surface.border}` : "1px solid rgba(0,0,0,0.06)",
    background: surface.bg,
    color: surface.text,
    cursor: "pointer",
    minHeight: 104,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    boxShadow: selectedTheme === theme ? "0 10px 24px rgba(0,0,0,0.08)" : "none",
  };
}

export function getThemePreviewShell(theme: ThemeType) {
  const publicTokens = getPublicThemeTokens(theme);
  const previewTokens = getPreviewTokens(theme);
  return {
    background: `linear-gradient(180deg, ${publicTokens.bg} 0%, ${publicTokens.bgSoft} 100%)`,
    border: `1px solid ${publicTokens.border}`,
    color: publicTokens.text,
    accent: publicTokens.accentStrong,
    accentSoft: publicTokens.accentTint,
    muted: publicTokens.muted,
    line: publicTokens.border,
    panel: previewTokens.panel,
    priceBg: publicTokens.priceBg,
    priceText: publicTokens.priceText,
    title: publicTokens.title,
  };
}
