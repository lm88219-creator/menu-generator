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
  type HomeRecognitionSummary,
} from "./home-utils";

type RecognitionResponse = {
  restaurant?: string;
  phone?: string;
  address?: string;
  hours?: string;
  menuText?: string;
  note?: string;
  menuCount?: number;
  confidence?: { average?: number; label?: string };
  warnings?: string[];
  fieldStatus?: Array<{
    field?: string;
    label?: string;
    value?: string;
    filled?: boolean;
  }>;
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

async function preprocessImageForOcr(file: File) {
  const image = await loadImage(file);
  const maxWidth = 2200;
  const scale = Math.min(1, maxWidth / Math.max(image.width, 1));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("無法處理圖片");

  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let min = 255;
  let max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }

  const contrastRange = Math.max(1, max - min);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    const normalized = Math.max(0, Math.min(255, ((gray - min) / contrastRange) * 255));
    const boosted = normalized > 188 ? 255 : normalized < 82 ? 0 : Math.round(normalized * 1.06);
    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
  }

  ctx.putImageData(imageData, 0, 0);

  const processedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
  if (!processedBlob) throw new Error("圖片處理失敗");

  return {
    blob: processedBlob,
    previewUrl: canvas.toDataURL("image/jpeg", 0.92),
  };
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
    setRecognitionNotice("正在整理圖片，先幫你做清晰化處理...");

    try {
      const { blob, previewUrl } = await preprocessImageForOcr(file);
      setRecognitionNotice("圖片已優化，開始辨識文字中，請稍候...");

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("chi_tra+eng");
      const result = await worker.recognize(blob);
      await worker.terminate();

      const ocrData = (result?.data ?? {}) as {
        text?: string;
        words?: Array<{ text?: string; bbox?: { x0?: number; y0?: number; x1?: number; y1?: number }; confidence?: number }>;
      };
      const recognizedText = String(ocrData.text ?? "").trim();
      const recognizedWords = Array.isArray(ocrData.words)
        ? ocrData.words.map((word) => ({
            text: String(word?.text ?? ""),
            bbox: {
              x0: Number(word?.bbox?.x0 ?? 0),
              y0: Number(word?.bbox?.y0 ?? 0),
              x1: Number(word?.bbox?.x1 ?? 0),
              y1: Number(word?.bbox?.y1 ?? 0),
            },
            confidence: Number(word?.confidence ?? 0),
          }))
        : [];

      if (!recognizedText && recognizedWords.length === 0) {
        setRecognitionNotice("這張圖片沒有辨識到清楚文字，建議換一張更正面、字更清楚的菜單圖。");
        return;
      }

      setRecognitionNotice("文字辨識完成，正在整理菜單欄位...");
      const res = await fetch("/api/menus/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: recognizedText, words: recognizedWords, restaurant: form.restaurant }),
      });
      const data = (await res.json()) as RecognitionResponse & { error?: string };
      if (!res.ok) {
        alert(data?.error || "圖片辨識失敗");
        return;
      }

      setForm((current) => ({
        ...current,
        restaurant: data.restaurant?.trim() || current.restaurant,
        phone: data.phone?.trim() || current.phone,
        address: data.address?.trim() || current.address,
        hours: data.hours?.trim() || current.hours,
        menu: data.menuText?.trim() || current.menu,
        customSlug: nextSlugFromRestaurant(data.restaurant?.trim() || current.restaurant, current.customSlug),
      }));

      setRecognitionSummary({
        fileName: file.name,
        previewUrl,
        menuCount: Number(data.menuCount ?? 0),
        confidenceAverage: Number(data.confidence?.average ?? 0),
        confidenceLabel: String(data.confidence?.label ?? "未提供"),
        warnings: Array.isArray(data.warnings) ? data.warnings.map((item) => String(item)) : [],
        fieldStatus: Array.isArray(data.fieldStatus)
          ? data.fieldStatus.map((item, index) => ({
              field: String(item?.field ?? `field-${index}`),
              label: String(item?.label ?? `欄位 ${index + 1}`),
              value: String(item?.value ?? ""),
              filled: Boolean(item?.filled),
            }))
          : [],
      });
      setRecognitionNotice(data.note || "辨識完成，已將文字填入表單草稿，請再檢查一次內容。");
    } catch (error) {
      console.error(error);
      setRecognitionNotice("圖片辨識失敗，請稍後再試或改用手動輸入。");
    } finally {
      setRecognizing(false);
    }
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
