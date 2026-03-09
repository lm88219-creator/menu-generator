export const THEME_VALUES = ["dark", "light", "warm", "ocean", "forest", "rose", "classic"] as const;

export type ThemeType = (typeof THEME_VALUES)[number];

type HomeThemeTokens = {
  name: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  subText: string;
  accent: string;
  inputBg: string;
  inputBorder: string;
  buttonMainBg: string;
  buttonMainText: string;
  buttonGhostBg: string;
  buttonGhostText: string;
};

type ThemeOptionMeta = {
  desc: string;
  preview: [string, string, string];
};

type PreviewTokens = {
  shell: string;
  panel: string;
  soft: string;
  border: string;
  accent: string;
  accentSoft: string;
  title: string;
  text: string;
  muted: string;
  hero: string;
  priceBg: string;
  surface: string;
  section: string;
  line: string;
};

type PublicThemeTokens = {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentTint: string;
  accentTintStrong: string;
  badge: string;
  border: string;
  bg: string;
  bgSoft: string;
  bgDeep: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  title: string;
  muted: string;
  priceBg: string;
  priceText: string;
  soldoutBg: string;
  soldoutText: string;
  shadow: string;
};

type PosterThemeTokens = {
  bg: string;
  card: string;
  title: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
};

type ThemeConfig = {
  label: string;
  home: HomeThemeTokens;
  option: ThemeOptionMeta;
  editorPreview: PreviewTokens;
  publicPage: PublicThemeTokens;
  poster: PosterThemeTokens;
  surface: { bg: string; text: string; muted: string; border: string };
};

export const THEME_CONFIG: Record<ThemeType, ThemeConfig> = {
  dark: {
    label: "深色經典",
    home: {
      name: "黑色餐廳風",
      pageBg: "radial-gradient(circle at top,#1a1a1a 0%,#000 45%,#000 100%)",
      cardBg: "rgba(255,255,255,0.04)",
      cardBorder: "1px solid rgba(255,255,255,0.08)",
      text: "#fff",
      subText: "#a9a9a9",
      accent: "#f4d58d",
      inputBg: "rgba(255,255,255,0.05)",
      inputBorder: "1px solid rgba(255,255,255,0.08)",
      buttonMainBg: "#fff",
      buttonMainText: "#000",
      buttonGhostBg: "rgba(255,255,255,0.08)",
      buttonGhostText: "#fff",
    },
    option: {
      desc: "適合熱炒、宵夜、餐酒館。對比清楚、穩重耐看。",
      preview: ["#101723", "#172235", "#0d1420"],
    },
    editorPreview: {
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
    },
    publicPage: {
      accent: "#b89a6a",
      accentStrong: "#e7c992",
      accentSoft: "#f5ead8",
      accentTint: "rgba(231, 201, 146, 0.12)",
      accentTintStrong: "rgba(231, 201, 146, 0.2)",
      badge: "rgba(255, 246, 227, 0.08)",
      border: "rgba(255, 244, 224, 0.12)",
      bg: "#0d0f14",
      bgSoft: "#151821",
      bgDeep: "#090b10",
      surface: "rgba(19, 22, 30, 0.92)",
      surfaceSoft: "rgba(26, 30, 40, 0.92)",
      text: "#e8e1d3",
      title: "#fff8ec",
      muted: "#aa9f8f",
      priceBg: "rgba(231, 201, 146, 0.12)",
      priceText: "#f3d8a6",
      soldoutBg: "rgba(214, 121, 121, 0.14)",
      soldoutText: "#ffc5c5",
      shadow: "0 30px 72px rgba(0, 0, 0, 0.42)",
    },
    poster: {
      bg: "#111111",
      card: "#1b1b1b",
      title: "#ffffff",
      text: "#f3f3f3",
      muted: "#aaaaaa",
      line: "#3a3a3a",
      accent: "#f4d58d",
    },
    surface: { bg: "#23262d", text: "#f4efe7", muted: "#b8a99a", border: "rgba(212,169,93,0.22)" },
  },
  light: {
    label: "簡約白",
    home: {
      name: "簡約白色",
      pageBg: "linear-gradient(180deg,#f8f8f8 0%,#eeeeee 100%)",
      cardBg: "rgba(255,255,255,0.9)",
      cardBorder: "1px solid rgba(0,0,0,0.08)",
      text: "#111",
      subText: "#666",
      accent: "#0b57d0",
      inputBg: "#fff",
      inputBorder: "1px solid rgba(0,0,0,0.08)",
      buttonMainBg: "#111",
      buttonMainText: "#fff",
      buttonGhostBg: "#fff",
      buttonGhostText: "#111",
    },
    option: {
      desc: "閱讀感最乾淨，適合一般餐廳與簡潔菜單。",
      preview: ["#f7f8fa", "#ffffff", "#eef2f7"],
    },
    editorPreview: {
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
    },
    publicPage: {
      accent: "#c7922e",
      accentStrong: "#a96d00",
      accentSoft: "#fff0cf",
      accentTint: "rgba(199, 146, 46, 0.11)",
      accentTintStrong: "rgba(199, 146, 46, 0.18)",
      badge: "rgba(199, 146, 46, 0.08)",
      border: "rgba(36, 50, 68, 0.08)",
      bg: "#fbfbfc",
      bgSoft: "#f2f4f7",
      bgDeep: "#edf1f5",
      surface: "rgba(255, 255, 255, 0.92)",
      surfaceSoft: "rgba(247, 249, 252, 0.94)",
      text: "#334155",
      title: "#243244",
      muted: "#728097",
      priceBg: "rgba(199, 146, 46, 0.12)",
      priceText: "#8f6519",
      soldoutBg: "rgba(185, 28, 28, 0.10)",
      soldoutText: "#b91c1c",
      shadow: "0 30px 64px rgba(15, 23, 42, 0.08)",
    },
    poster: {
      bg: "#f5f5f5",
      card: "#ffffff",
      title: "#111111",
      text: "#222222",
      muted: "#666666",
      line: "#d9d9d9",
      accent: "#0b57d0",
    },
    surface: { bg: "#f4f4f2", text: "#2f343a", muted: "#69727d", border: "rgba(168,178,194,0.34)" },
  },
  warm: {
    label: "暖木咖啡",
    home: {
      name: "溫暖咖啡風",
      pageBg: "linear-gradient(180deg,#f6efe5 0%,#eadbc8 100%)",
      cardBg: "rgba(255,250,244,0.9)",
      cardBorder: "1px solid rgba(88,54,24,0.12)",
      text: "#3e2d20",
      subText: "#7b6756",
      accent: "#8b5e34",
      inputBg: "rgba(255,255,255,0.78)",
      inputBorder: "1px solid rgba(88,54,24,0.12)",
      buttonMainBg: "#4e3426",
      buttonMainText: "#fff",
      buttonGhostBg: "rgba(255,255,255,0.65)",
      buttonGhostText: "#3e2d20",
    },
    option: {
      desc: "偏溫暖餐飲感，適合咖啡館、小吃、家常風格。",
      preview: ["#2d211a", "#412d21", "#221812"],
    },
    editorPreview: {
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
    },
    publicPage: {
      accent: "#c58b4f",
      accentStrong: "#9d5f2d",
      accentSoft: "#fff1de",
      accentTint: "rgba(197, 139, 79, 0.12)",
      accentTintStrong: "rgba(197, 139, 79, 0.2)",
      badge: "rgba(255, 241, 222, 0.54)",
      border: "rgba(111, 78, 55, 0.12)",
      bg: "#f8f1e8",
      bgSoft: "#f2e3d2",
      bgDeep: "#ecd6be",
      surface: "rgba(255, 251, 245, 0.92)",
      surfaceSoft: "rgba(251, 244, 236, 0.94)",
      text: "#4e3627",
      title: "#3d281b",
      muted: "#82624f",
      priceBg: "rgba(197, 139, 79, 0.12)",
      priceText: "#8b5e34",
      soldoutBg: "rgba(153, 76, 76, 0.12)",
      soldoutText: "#9c3d3d",
      shadow: "0 30px 68px rgba(84, 52, 25, 0.14)",
    },
    poster: {
      bg: "#efe1cf",
      card: "#fffaf3",
      title: "#4a3326",
      text: "#4a3326",
      muted: "#7b6756",
      line: "#d9c3ae",
      accent: "#8b5e34",
    },
    surface: { bg: "#f1e2d4", text: "#4a3326", muted: "#7b6756", border: "rgba(155,107,67,0.22)" },
  },
  ocean: {
    label: "海洋清新",
    home: {
      name: "海洋清新風",
      pageBg: "linear-gradient(180deg,#e8f7ff 0%,#cfeeff 100%)",
      cardBg: "rgba(255,255,255,0.82)",
      cardBorder: "1px solid rgba(18,108,149,0.14)",
      text: "#0f3550",
      subText: "#4d7289",
      accent: "#118ab2",
      inputBg: "rgba(255,255,255,0.88)",
      inputBorder: "1px solid rgba(18,108,149,0.14)",
      buttonMainBg: "#0f6e91",
      buttonMainText: "#fff",
      buttonGhostBg: "rgba(255,255,255,0.72)",
      buttonGhostText: "#0f3550",
    },
    option: {
      desc: "色調明亮清爽，適合海鮮、健康餐、早午餐。",
      preview: ["#10202d", "#173247", "#0d1923"],
    },
    editorPreview: {
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
    },
    publicPage: {
      accent: "#1584ad",
      accentStrong: "#0a6b8e",
      accentSoft: "#dff7ff",
      accentTint: "rgba(21, 132, 173, 0.11)",
      accentTintStrong: "rgba(21, 132, 173, 0.19)",
      badge: "rgba(223, 247, 255, 0.7)",
      border: "rgba(15, 53, 80, 0.1)",
      bg: "#eef9ff",
      bgSoft: "#dff3fb",
      bgDeep: "#d3ebf6",
      surface: "rgba(255, 255, 255, 0.92)",
      surfaceSoft: "rgba(244, 252, 255, 0.94)",
      text: "#24506a",
      title: "#16384b",
      muted: "#5e7f92",
      priceBg: "rgba(21, 132, 173, 0.12)",
      priceText: "#0a6b8e",
      soldoutBg: "rgba(185, 28, 28, 0.10)",
      soldoutText: "#b91c1c",
      shadow: "0 30px 64px rgba(21, 132, 173, 0.12)",
    },
    poster: {
      bg: "#dff4ff",
      card: "#ffffff",
      title: "#0f3550",
      text: "#0f3550",
      muted: "#4d7289",
      line: "#b7dcee",
      accent: "#118ab2",
    },
    surface: { bg: "#e2f3f8", text: "#214d63", muted: "#5d7f90", border: "rgba(83,168,201,0.26)" },
  },
  forest: {
    label: "森林自然",
    home: {
      name: "森林自然風",
      pageBg: "linear-gradient(180deg,#edf6ef 0%,#d6e7d8 100%)",
      cardBg: "rgba(250,255,250,0.86)",
      cardBorder: "1px solid rgba(47,94,61,0.14)",
      text: "#233b2c",
      subText: "#5c7564",
      accent: "#2f6b3f",
      inputBg: "rgba(255,255,255,0.82)",
      inputBorder: "1px solid rgba(47,94,61,0.14)",
      buttonMainBg: "#2f6b3f",
      buttonMainText: "#fff",
      buttonGhostBg: "rgba(255,255,255,0.7)",
      buttonGhostText: "#233b2c",
    },
    option: {
      desc: "較有自然感，適合便當、蔬食、手作餐飲。",
      preview: ["#142118", "#203126", "#101813"],
    },
    editorPreview: {
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
    },
    publicPage: {
      accent: "#3c7d4b",
      accentStrong: "#255e33",
      accentSoft: "#e7faeb",
      accentTint: "rgba(60, 125, 75, 0.11)",
      accentTintStrong: "rgba(60, 125, 75, 0.18)",
      badge: "rgba(231, 250, 235, 0.72)",
      border: "rgba(35, 59, 44, 0.1)",
      bg: "#f2f9f2",
      bgSoft: "#e5f2e6",
      bgDeep: "#d8ead9",
      surface: "rgba(255, 255, 255, 0.92)",
      surfaceSoft: "rgba(246, 252, 247, 0.94)",
      text: "#2f4a36",
      title: "#223628",
      muted: "#687b6d",
      priceBg: "rgba(60, 125, 75, 0.12)",
      priceText: "#255e33",
      soldoutBg: "rgba(185, 28, 28, 0.1)",
      soldoutText: "#b91c1c",
      shadow: "0 30px 64px rgba(47, 107, 63, 0.12)",
    },
    poster: {
      bg: "#e4f0e5",
      card: "#fbfffb",
      title: "#233b2c",
      text: "#233b2c",
      muted: "#5c7564",
      line: "#c4d8c8",
      accent: "#2f6b3f",
    },
    surface: { bg: "#e7f1e5", text: "#274332", muted: "#667a6c", border: "rgba(94,148,104,0.26)" },
  },
  rose: {
    label: "玫瑰奶茶",
    home: {
      name: "玫瑰奶茶風",
      pageBg: "linear-gradient(180deg,#fff2f6 0%,#f4dbe3 100%)",
      cardBg: "rgba(255,250,252,0.9)",
      cardBorder: "1px solid rgba(145,78,101,0.14)",
      text: "#5a3141",
      subText: "#8b6573",
      accent: "#b35c7a",
      inputBg: "rgba(255,255,255,0.84)",
      inputBorder: "1px solid rgba(145,78,101,0.14)",
      buttonMainBg: "#a14b68",
      buttonMainText: "#fff",
      buttonGhostBg: "rgba(255,255,255,0.72)",
      buttonGhostText: "#5a3141",
    },
    option: {
      desc: "較柔和有質感，適合甜點、飲料與輕食。",
      preview: ["#2b1a21", "#3a222b", "#1f1418"],
    },
    editorPreview: {
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
    },
    publicPage: {
      accent: "#b86484",
      accentStrong: "#8f4964",
      accentSoft: "#ffe8f0",
      accentTint: "rgba(184, 100, 132, 0.11)",
      accentTintStrong: "rgba(184, 100, 132, 0.18)",
      badge: "rgba(255, 232, 240, 0.74)",
      border: "rgba(90, 49, 65, 0.1)",
      bg: "#fff7fa",
      bgSoft: "#fcecf1",
      bgDeep: "#f5dde6",
      surface: "rgba(255, 255, 255, 0.92)",
      surfaceSoft: "rgba(255, 249, 252, 0.94)",
      text: "#6b4652",
      title: "#4f2e3a",
      muted: "#906b78",
      priceBg: "rgba(184, 100, 132, 0.12)",
      priceText: "#8f4964",
      soldoutBg: "rgba(185, 28, 28, 0.1)",
      soldoutText: "#b91c1c",
      shadow: "0 30px 64px rgba(179, 92, 122, 0.12)",
    },
    poster: {
      bg: "#fdebf1",
      card: "#fffafc",
      title: "#5a3141",
      text: "#5a3141",
      muted: "#8b6573",
      line: "#ebc8d5",
      accent: "#b35c7a",
    },
    surface: { bg: "#f7e7eb", text: "#623d49", muted: "#8d6b76", border: "rgba(199,138,159,0.28)" },
  },
  classic: {
    label: "經典餐館",
    home: {
      name: "經典餐館",
      pageBg: "radial-gradient(circle at top,#ffffff 0%,#f8f9f7 46%,#eef1ec 100%)",
      cardBg: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,251,246,0.96) 100%)",
      cardBorder: "1px solid rgba(17,24,39,0.08)",
      text: "#111827",
      subText: "#6b7280",
      accent: "#b91c1c",
      inputBg: "rgba(255,255,255,0.88)",
      inputBorder: "1px solid rgba(17,24,39,0.1)",
      buttonMainBg: "linear-gradient(180deg,#b91c1c 0%,#991b1b 100%)",
      buttonMainText: "#fff",
      buttonGhostBg: "rgba(255,255,255,0.78)",
      buttonGhostText: "#111827",
    },
    option: {
      desc: "米白紙感搭配餐館紅，適合熱炒、鵝肉、小吃與家常菜。",
      preview: ["#fbf7f1", "#ffffff", "#f6ebe6"],
    },
    editorPreview: {
      shell: "radial-gradient(circle at top, #ffffff 0%, #f8f9f7 48%, #eef1ec 100%)",
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
    },
    publicPage: {
      accent: "#b91c1c",
      accentStrong: "#991b1b",
      accentSoft: "#fee2e2",
      accentTint: "rgba(34, 73, 52, 0.06)",
      accentTintStrong: "rgba(34, 73, 52, 0.1)",
      badge: "rgba(34, 73, 52, 0.05)",
      border: "rgba(17, 24, 39, 0.08)",
      bg: "#fbfcfa",
      bgSoft: "#f5f7f3",
      bgDeep: "#edf1ea",
      surface: "rgba(255, 255, 255, 0.92)",
      surfaceSoft: "rgba(252, 253, 251, 0.96)",
      text: "#374151",
      title: "#111827",
      muted: "#6b7280",
      priceBg: "rgba(185, 28, 28, 0.08)",
      priceText: "#991b1b",
      soldoutBg: "rgba(185, 28, 28, 0.1)",
      soldoutText: "#991b1b",
      shadow: "0 30px 68px rgba(17, 24, 39, 0.08)",
    },
    poster: {
      bg: "#f6f0e6",
      card: "#ffffff",
      title: "#111827",
      text: "#1f2937",
      muted: "#6b7280",
      line: "rgba(17,24,39,0.12)",
      accent: "#b91c1c",
    },
    surface: { bg: "#fbf7f1", text: "#111827", muted: "#6b7280", border: "rgba(185,28,28,0.22)" },
  },
};

export const THEME_LABELS: Record<ThemeType, string> = Object.fromEntries(
  Object.entries(THEME_CONFIG).map(([key, value]) => [key, value.label])
) as Record<ThemeType, string>;

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

export function getThemeConfig(theme?: string | null, fallback: ThemeType = "dark") {
  return THEME_CONFIG[normalizeTheme(theme, fallback)];
}

export function getHomeTheme(theme?: string | null, fallback: ThemeType = "dark") {
  return getThemeConfig(theme, fallback).home;
}

export function getThemeOptions() {
  return THEME_VALUES.map((value) => {
    const config = THEME_CONFIG[value];
    return {
      value,
      label: config.label,
      desc: config.option.desc,
      accent: config.home.accent,
      preview: config.option.preview,
    };
  });
}

export function getPreviewTokens(theme?: string | null, fallback: ThemeType = "dark") {
  return getThemeConfig(theme, fallback).editorPreview;
}

export function getPublicThemeTokens(theme?: string | null, fallback: ThemeType = "dark") {
  return getThemeConfig(theme, fallback).publicPage;
}

export function getPosterThemeTokens(theme?: string | null, fallback: ThemeType = "dark") {
  return getThemeConfig(theme, fallback).poster;
}

export function getThemeSurface(theme?: string | null, fallback: ThemeType = "dark") {
  return getThemeConfig(theme, fallback).surface;
}
