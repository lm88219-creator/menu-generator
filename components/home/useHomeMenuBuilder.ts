"use client";

import { useEffect, useMemo, useState } from "react";
import { joinPublicUrl } from "@/lib/public-url";
import { getHomeTheme, getThemeOptions, type ThemeType } from "@/lib/theme";
import {
  getExampleHomeFormState,
  getInitialHomeFormState,
  nextSlugFromRestaurant,
  sanitizeCustomSlug,
  type HomeFormState,
  type HomeRecognitionItem,
  type HomeRecognitionSummary,
} from "./home-utils";

type VisionFieldStatus = {
  field?: "restaurant" | "phone" | "address" | "hours";
  label?: string;
  value?: string;
  filled?: boolean;
  confidence?: number;
  status?: "ready" | "review" | "missing";
};

type VisionItem = {
  id?: string;
  name?: string;
  price?: string;
  category?: string;
  confidence?: number;
  status?: "ready" | "review" | "missing";
};

type VisionResponse = {
  note?: string;
  sourceLabel?: string;
  menuCount?: number;
  confidence?: { average?: number; label?: string };
  warnings?: string[];
  fieldStatus?: VisionFieldStatus[];
  menuItems?: VisionItem[];
};

function loadImage(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    img.src = objectUrl;
  });
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

async function prepareImageForVision(file: File) {
  const image = await loadImage(file);
  const maxWidth = 2200;
  const scale = Math.min(1, maxWidth / Math.max(image.width, 1));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法處理圖片");
  ctx.drawImage(image, 0, 0, width, height);

  const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const previewUrl = imageDataUrl;
  return { imageDataUrl, previewUrl };
}

function buildMenuTextFromItems(items: HomeRecognitionItem[]) {
  const selected = items
    .filter((item) => item.selected && item.name.trim())
    .map((item) => ({
      category: item.category.trim() || "精選菜單",
      name: item.name.trim(),
      price: item.price.trim(),
    }));

  if (!selected.length) return "";

  const groups = new Map<string, Array<{ name: string; price: string }>>();
  for (const item of selected) {
    const key = item.category;
    const bucket = groups.get(key) ?? [];
    bucket.push({ name: item.name, price: item.price });
    groups.set(key, bucket);
  }

  const lines: string[] = [];
  for (const [category, groupItems] of groups.entries()) {
    lines.push(`# ${category}`);
    for (const item of groupItems) {
      lines.push(item.price ? `${item.name} ${item.price}` : item.name);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function applyRecognitionToForm(current: HomeFormState, summary: HomeRecognitionSummary) {
  const next = { ...current };

  for (const item of summary.fieldStatus) {
    if (!item.selected || !item.filled) continue;
    const value = item.value.trim();
    if (item.field === "restaurant" && value) {
      next.restaurant = value;
      next.customSlug = nextSlugFromRestaurant(value, current.customSlug);
    } else if (item.field === "phone") {
      next.phone = value;
    } else if (item.field === "address") {
      next.address = value;
    } else if (item.field === "hours") {
      next.hours = value;
    }
  }

  const menuText = buildMenuTextFromItems(summary.menuItems);
  if (menuText) next.menu = menuText;

  return next;
}

export function useHomeMenuBuilder() {
  const [form, setForm] = useState<HomeFormState>(getInitialHomeFormState);
  const [isMobile, setIsMobile] = useState(false);
  const [qrText, setQrText] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPoster, setDownloadingPoster] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionNotice, setRecognitionNotice] = useState("");
  const [recognitionSummary, setRecognitionSummary] = useState<HomeRecognitionSummary | null>(null);

  const themeOptions = useMemo(() => getThemeOptions(), []);
  const currentTheme = getHomeTheme(form.theme, "warm");

  useEffect(() => {
    const apply = () => setIsMobile(window.innerWidth < 900);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  function patchForm(patch: Partial<HomeFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function setRestaurant(value: string) {
    setForm((current) => ({
      ...current,
      restaurant: value,
      customSlug: nextSlugFromRestaurant(value, current.customSlug),
    }));
  }

  function setCustomSlug(value: string) {
    patchForm({ customSlug: sanitizeCustomSlug(value) });
  }

  function fillExample() {
    setForm(getExampleHomeFormState());
    setQrText("");
    setCopied(false);
    setRecognitionNotice("");
    setRecognitionSummary(null);
  }

  function clearAll() {
    setForm(getInitialHomeFormState());
    setQrText("");
    setCopied(false);
    setRecognitionNotice("");
    setRecognitionSummary(null);
  }

  async function recognizeMenuImage(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請上傳圖片檔");
      return;
    }

    setRecognizing(true);
    setRecognitionSummary(null);
    setRecognitionNotice("正在整理圖片，準備送交 AI Vision 分析...");

    try {
      const { imageDataUrl, previewUrl } = await prepareImageForVision(file);
      setRecognitionNotice("AI 正在看懂菜單圖片內容，整理店家資訊與菜單草稿...");

      const res = await fetch("/api/menus/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, restaurantHint: form.restaurant }),
      });

      const data = (await res.json()) as VisionResponse & { error?: string };
      if (!res.ok) {
        alert(data?.error || "AI 辨識失敗");
        return;
      }

      const menuItems = Array.isArray(data.menuItems)
        ? data.menuItems.map((item, index) => ({
            id: String(item?.id ?? `item-${index + 1}`),
            name: String(item?.name ?? ""),
            price: String(item?.price ?? ""),
            category: String(item?.category ?? "精選菜單"),
            selected: Boolean(item?.name),
            confidence: Number(item?.confidence ?? data.confidence?.average ?? 0),
            status: item?.status ?? "review",
          }))
        : [];

      setRecognitionSummary({
        fileName: file.name,
        previewUrl,
        note: String(data.note ?? "AI 已先整理出候選結果，請逐項確認後再匯入表單。"),
        sourceLabel: String(data.sourceLabel ?? "AI Vision"),
        menuCount: Number(data.menuCount ?? menuItems.length ?? 0),
        selectedMenuCount: menuItems.filter((item) => item.selected && item.name.trim()).length,
        confidenceAverage: Number(data.confidence?.average ?? 0),
        confidenceLabel: String(data.confidence?.label ?? "未提供"),
        warnings: Array.isArray(data.warnings) ? data.warnings.map((item) => String(item)) : [],
        fieldStatus: Array.isArray(data.fieldStatus)
          ? data.fieldStatus.map((item, index) => ({
              field: item?.field ?? (["restaurant", "phone", "address", "hours"][index] as "restaurant" | "phone" | "address" | "hours"),
              label: String(item?.label ?? `欄位 ${index + 1}`),
              value: String(item?.value ?? ""),
              filled: Boolean(item?.filled),
              selected: Boolean(item?.filled),
              applied: false,
              confidence: Number(item?.confidence ?? data.confidence?.average ?? 0),
              status: item?.status ?? (item?.filled ? "review" : "missing"),
            }))
          : [],
        menuItems,
      });
      setRecognitionNotice("AI 分析完成，現在可以先編輯候選結果，再勾選匯入。");
    } catch (error) {
      console.error(error);
      setRecognitionNotice("AI 辨識失敗，請稍後再試，或先手動輸入菜單。");
    } finally {
      setRecognizing(false);
    }
  }

  function toggleRecognitionField(field: string) {
    setRecognitionSummary((current) => {
      if (!current) return current;
      return {
        ...current,
        fieldStatus: current.fieldStatus.map((item) =>
          item.field === field && item.filled ? { ...item, selected: !item.selected } : item,
        ),
      };
    });
  }

  function updateRecognitionField(field: string, value: string) {
    setRecognitionSummary((current) => {
      if (!current) return current;
      return {
        ...current,
        fieldStatus: current.fieldStatus.map((item) =>
          item.field === field
            ? {
                ...item,
                value,
                filled: Boolean(value.trim()),
                selected: value.trim() ? item.selected : false,
                status: value.trim() ? "review" : "missing",
              }
            : item,
        ),
      };
    });
  }

  function toggleRecognitionMenuItem(id: string) {
    setRecognitionSummary((current) => {
      if (!current) return current;
      const nextItems = current.menuItems.map((item) =>
        item.id === id && item.name.trim() ? { ...item, selected: !item.selected } : item,
      );
      return {
        ...current,
        menuItems: nextItems,
        selectedMenuCount: nextItems.filter((item) => item.selected && item.name.trim()).length,
      };
    });
  }

  function updateRecognitionMenuItem(id: string, patch: Partial<HomeRecognitionItem>) {
    setRecognitionSummary((current) => {
      if (!current) return current;
      const nextItems = current.menuItems.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        next.status = next.name.trim() ? next.status : "missing";
        if (!next.name.trim()) next.selected = false;
        return next;
      });
      return {
        ...current,
        menuItems: nextItems,
        selectedMenuCount: nextItems.filter((item) => item.selected && item.name.trim()).length,
      };
    });
  }

  function deleteRecognitionMenuItem(id: string) {
    setRecognitionSummary((current) => {
      if (!current) return current;
      const nextItems = current.menuItems.filter((item) => item.id !== id);
      return {
        ...current,
        menuItems: nextItems,
        menuCount: nextItems.length,
        selectedMenuCount: nextItems.filter((item) => item.selected && item.name.trim()).length,
      };
    });
  }

  function addRecognitionMenuItem() {
    setRecognitionSummary((current) => {
      if (!current) return current;
      const nextItems = [
        ...current.menuItems,
        {
          id: `manual-${Date.now()}`,
          name: "",
          price: "",
          category: current.menuItems[current.menuItems.length - 1]?.category || "精選菜單",
          selected: false,
          confidence: 0,
          status: "review" as const,
        },
      ];
      return {
        ...current,
        menuItems: nextItems,
        menuCount: nextItems.length,
      };
    });
  }

  function applySelectedRecognition() {
    if (!recognitionSummary) return;
    const hasSelectedField = recognitionSummary.fieldStatus.some((item) => item.selected && item.filled);
    const hasSelectedItems = recognitionSummary.menuItems.some((item) => item.selected && item.name.trim());
    if (!hasSelectedField && !hasSelectedItems) return;

    setForm((current) => applyRecognitionToForm(current, recognitionSummary));
    setRecognitionSummary((current) => {
      if (!current) return current;
      return {
        ...current,
        fieldStatus: current.fieldStatus.map((item) =>
          item.selected && item.filled ? { ...item, applied: true } : item,
        ),
      };
    });
    setRecognitionNotice("已把勾選的候選資料匯入表單，請再檢查一次後生成菜單。");
  }

  async function generateMenu() {
    if (!form.restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return;
    }

    if (!form.menu.trim()) {
      alert("請輸入菜單內容");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: form.restaurant,
          phone: form.phone,
          address: form.address,
          hours: form.hours,
          menuText: form.menu,
          theme: form.theme,
          logoDataUrl: form.logoDataUrl,
          customSlug: form.customSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.id) {
        alert(data?.error || "生成失敗");
        return;
      }

      const path = String(data.publicPath ?? data.shortUrl ?? `/m/${data.id}`);
      const url = String(data.publicUrl ?? joinPublicUrl(path));
      setQrText(url);
    } catch (error) {
      console.error(error);
      alert("生成失敗");
    } finally {
      setCreating(false);
    }
  }

  async function copyUrl() {
    if (!qrText) return;
    await navigator.clipboard.writeText(qrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function uploadLogo(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請上傳圖片檔");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => patchForm({ logoDataUrl: String(reader.result || "") });
    reader.readAsDataURL(file);
  }

  return {
    form,
    isMobile,
    qrText,
    creating,
    copied,
    downloadingPoster,
    setDownloadingPoster,
    recognizing,
    recognitionNotice,
    recognitionSummary,
    themeOptions,
    currentTheme,
    patchForm,
    setRestaurant,
    setCustomSlug,
    fillExample,
    clearAll,
    generateMenu,
    recognizeMenuImage,
    toggleRecognitionField,
    updateRecognitionField,
    toggleRecognitionMenuItem,
    updateRecognitionMenuItem,
    deleteRecognitionMenuItem,
    addRecognitionMenuItem,
    applySelectedRecognition,
    clearRecognition: () => {
      setRecognitionNotice("");
      setRecognitionSummary(null);
    },
    copyUrl,
    uploadLogo,
    removeLogo: () => patchForm({ logoDataUrl: "" }),
    setTheme: (theme: ThemeType) => patchForm({ theme }),
  };
}
