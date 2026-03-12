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
} from "./home-utils";

export function useHomeMenuBuilder() {
  const [form, setForm] = useState<HomeFormState>(getInitialHomeFormState);
  const [isMobile, setIsMobile] = useState(false);
  const [qrText, setQrText] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPoster, setDownloadingPoster] = useState(false);

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
  }

  function clearAll() {
    setForm(getInitialHomeFormState());
    setQrText("");
    setCopied(false);
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
    themeOptions,
    currentTheme,
    patchForm,
    setRestaurant,
    setCustomSlug,
    fillExample,
    clearAll,
    generateMenu,
    copyUrl,
    uploadLogo,
    removeLogo: () => patchForm({ logoDataUrl: "" }),
    setTheme: (theme: ThemeType) => patchForm({ theme }),
  };
}
