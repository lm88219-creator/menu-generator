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
    confidence?: number;
  }>;
};

type OcrWord = {
  text?: string;
  bbox?: { x0?: number; y0?: number; x1?: number; y1?: number };
  confidence?: number;
};

type OcrResultLike = {
  data?: {
    text?: string;
    words?: OcrWord[];
  };
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

function normalizeCanvasForOcr(source: HTMLCanvasElement) {
  const canvas = makeCanvas(source.width, source.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("無法處理圖片");

  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let min = 255;
  let max = 0;
  const histogram = new Array<number>(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    histogram[gray] += 1;
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }

  const total = canvas.width * canvas.height;
  let running = 0;
  let threshold = 160;
  for (let i = 0; i < histogram.length; i += 1) {
    running += histogram[i];
    if (running / Math.max(total, 1) >= 0.62) {
      threshold = i;
      break;
    }
  }

  const contrastRange = Math.max(1, max - min);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    const normalized = Math.max(0, Math.min(255, ((gray - min) / contrastRange) * 255));
    const boosted = normalized >= threshold ? 255 : normalized <= threshold - 36 ? 0 : Math.round(normalized * 1.08);
    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function preprocessImageForOcr(file: File) {
  const image = await loadImage(file);
  const maxWidth = 2200;
  const scale = Math.min(1, maxWidth / Math.max(image.width, 1));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const baseCanvas = makeCanvas(width, height);
  const baseCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
  if (!baseCtx) throw new Error("無法處理圖片");
  baseCtx.drawImage(image, 0, 0, width, height);

  const normalizedCanvas = normalizeCanvasForOcr(baseCanvas);
  const processedBlob = await new Promise<Blob | null>((resolve) => normalizedCanvas.toBlob(resolve, "image/png", 1));
  if (!processedBlob) throw new Error("圖片處理失敗");

  return {
    canvas: normalizedCanvas,
    blob: processedBlob,
    previewUrl: normalizedCanvas.toDataURL("image/jpeg", 0.92),
  };
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
  if (!blob) throw new Error("切圖失敗");
  return blob;
}

async function buildOcrSlices(canvas: HTMLCanvasElement) {
  const regions: Array<{ id: string; x: number; y: number; width: number; height: number }> = [
    { id: "full", x: 0, y: 0, width: canvas.width, height: canvas.height },
    { id: "header", x: 0, y: 0, width: canvas.width, height: Math.max(180, Math.round(canvas.height * 0.28)) },
  ];

  if (canvas.width >= 720) {
    const bodyY = Math.round(canvas.height * 0.2);
    const bodyHeight = Math.max(200, canvas.height - bodyY);
    const gutter = Math.max(12, Math.round(canvas.width * 0.03));
    const half = Math.max(180, Math.round((canvas.width - gutter) / 2));
    regions.push(
      { id: "left", x: 0, y: bodyY, width: half, height: bodyHeight },
      { id: "right", x: Math.max(0, canvas.width - half), y: bodyY, width: half, height: bodyHeight },
    );
  } else {
    const halfH = Math.max(180, Math.round(canvas.height / 2));
    regions.push(
      { id: "top", x: 0, y: 0, width: canvas.width, height: halfH },
      { id: "bottom", x: 0, y: Math.max(0, canvas.height - halfH), width: canvas.width, height: halfH },
    );
  }

  const unique = new Map<string, { blob: Blob; x: number; y: number }>();
  for (const region of regions) {
    const slice = makeCanvas(region.width, region.height);
    const ctx = slice.getContext("2d");
    if (!ctx) continue;
    ctx.drawImage(canvas, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);
    unique.set(region.id, { blob: await canvasToBlob(slice), x: region.x, y: region.y });
  }

  return [...unique.values()];
}

function normalizeWords(words: OcrWord[] | undefined, offsetX = 0, offsetY = 0) {
  return Array.isArray(words)
    ? words.map((word) => ({
        text: String(word?.text ?? ""),
        bbox: {
          x0: Number(word?.bbox?.x0 ?? 0) + offsetX,
          y0: Number(word?.bbox?.y0 ?? 0) + offsetY,
          x1: Number(word?.bbox?.x1 ?? 0) + offsetX,
          y1: Number(word?.bbox?.y1 ?? 0) + offsetY,
        },
        confidence: Number(word?.confidence ?? 0),
      }))
    : [];
}

function dedupeWords(words: ReturnType<typeof normalizeWords>) {
  const seen = new Set<string>();
  return words.filter((word) => {
    const key = `${word.text}|${Math.round(word.bbox.x0)}|${Math.round(word.bbox.y0)}|${Math.round(word.bbox.x1)}|${Math.round(word.bbox.y1)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyRecognitionToForm(current: HomeFormState, summary: HomeRecognitionSummary) {
  const next = { ...current };
  for (const item of summary.fieldStatus) {
    if (!item.selected || !item.filled) continue;
    const value = item.value.trim();
    if (item.field === "restaurant" && value) {
      next.restaurant = value;
      next.customSlug = nextSlugFromRestaurant(value, current.customSlug);
    } else if (item.field === "phone" && value) {
      next.phone = value;
    } else if (item.field === "address" && value) {
      next.address = value;
    } else if (item.field === "hours" && value) {
      next.hours = value;
    } else if (item.field === "menuText" && value) {
      next.menu = value;
    }
  }
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
    setRecognitionNotice("正在整理圖片，先幫你做灰階、對比強化與去雜訊...");

    try {
      const { canvas, previewUrl } = await preprocessImageForOcr(file);
      setRecognitionNotice("圖片已優化，開始做整張 + 分區辨識，雙欄菜單會一起分析...");

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("chi_tra+eng");
      const slices = await buildOcrSlices(canvas);
      let mergedText = "";
      let mergedWords: ReturnType<typeof normalizeWords> = [];

      for (let index = 0; index < slices.length; index += 1) {
        const slice = slices[index];
        setRecognitionNotice(`圖片已優化，正在辨識第 ${index + 1} / ${slices.length} 個區塊...`);
        const result = (await worker.recognize(slice.blob)) as OcrResultLike;
        mergedText += `\n${String(result?.data?.text ?? "").trim()}`;
        mergedWords = mergedWords.concat(normalizeWords(result?.data?.words, slice.x, slice.y));
      }
      await worker.terminate();

      const recognizedText = mergedText.trim();
      const recognizedWords = dedupeWords(mergedWords);

      if (!recognizedText && recognizedWords.length === 0) {
        setRecognitionNotice("這張圖片沒有辨識到清楚文字，建議換一張更正面、字更清楚的菜單圖。");
        return;
      }

      setRecognitionNotice("文字辨識完成，正在整理菜名、價格、分類與店家資訊...");
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
              selected: Boolean(item?.filled),
              applied: false,
              confidence: Number(item?.confidence ?? data.confidence?.average ?? 0),
            }))
          : [],
      });
      setRecognitionNotice(data.note || "辨識完成，請先勾選要套用的欄位，再套用到表單。");
    } catch (error) {
      console.error(error);
      setRecognitionNotice("圖片辨識失敗，請稍後再試或改用手動輸入。");
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

  function applySelectedRecognition() {
    if (!recognitionSummary) return;
    const hasSelected = recognitionSummary.fieldStatus.some((item) => item.selected && item.filled);
    if (!hasSelected) return;

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
    setRecognitionNotice("已將勾選欄位套用到表單，請再檢查一次後生成菜單。");
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
