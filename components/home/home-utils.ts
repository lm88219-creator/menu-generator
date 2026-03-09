import type { CSSProperties } from "react";
import { normalizeSlug } from "@/lib/menu";
import { getThemeSurface, type ThemeType } from "@/lib/theme";

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
    menu: `鵝肉\n鹽水鵝肉 200\n麻油鵝肉 220\n\n主食\n炒飯 80\n炒麵 80\n\n熱炒\n炒蝦球 200\n炒螺肉 120\n燙青菜 50`,
  };
}

export function sanitizeCustomSlug(value: string) {
  return normalizeSlug(value);
}

export function nextSlugFromRestaurant(name: string, previousCustomSlug: string) {
  if (previousCustomSlug) return previousCustomSlug;
  return normalizeSlug(name);
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

  const mainButtonStyle: CSSProperties = {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    background:
      theme === "warm"
        ? "linear-gradient(180deg, #8b5e34, #6f4623)"
        : theme === "classic"
        ? "linear-gradient(180deg, #b91c1c, #991b1b)"
        : "linear-gradient(180deg, #2563eb, #1d4ed8)",
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
  return {
    background:
      theme === "dark"
        ? "radial-gradient(circle at top,#1b1b1b 0%,#080808 70%)"
        : theme === "light"
        ? "linear-gradient(180deg,#ffffff 0%,#f3f3f3 100%)"
        : theme === "classic"
        ? "radial-gradient(circle at top,#ffffff 0%,#fbf7f1 55%,#f6f0e6 100%)"
        : "linear-gradient(180deg,#fffaf3 0%,#f1e0cb 100%)",
    border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
    color:
      theme === "dark"
        ? "#fff"
        : theme === "light"
        ? "#111"
        : theme === "warm"
        ? "#4e3426"
        : theme === "ocean"
        ? "#0f3550"
        : theme === "forest"
        ? "#233b2c"
        : theme === "classic"
        ? "#111827"
        : "#5a3141",
  };
}
