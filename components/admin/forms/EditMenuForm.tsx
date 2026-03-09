"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeSlug } from "@/lib/menu";
import { AdvancedToolsSection } from "./edit-menu/AdvancedToolsSection";
import { AppearanceSection } from "./edit-menu/AppearanceSection";
import { MenuItemsSection } from "./edit-menu/MenuItemsSection";
import { ShopInfoSection } from "./edit-menu/ShopInfoSection";
import {
  createFormItem,
  getPreviewTokens,
  parseDeskInput,
  THEME_OPTIONS,
  toFormItems,
  toMenuText,
  type InitialData,
  type MenuItemForm,
  type ThemeType,
} from "./edit-menu/shared-ui";

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export type { InitialData, MenuItemForm, ThemeType } from "./edit-menu/shared-ui";

export default function EditMenuForm({ id, initialData }: { id: string; initialData: InitialData }) {
  const [restaurant, setRestaurant] = useState(initialData.restaurant);
  const [phone, setPhone] = useState(initialData.phone);
  const [address, setAddress] = useState(initialData.address);
  const [hours, setHours] = useState(initialData.hours);
  const [formItems, setFormItems] = useState<MenuItemForm[]>(() => toFormItems(initialData.menuText));
  const [menuText, setMenuText] = useState(initialData.menuText);
  const [quickInput, setQuickInput] = useState(initialData.menuText);
  const [bulkDirty, setBulkDirty] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(initialData.theme || "dark");
  const [logoDataUrl, setLogoDataUrl] = useState(initialData.logoDataUrl || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [isPublished, setIsPublished] = useState(initialData.isPublished !== false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deskInput, setDeskInput] = useState("");
  const [selectedDesk, setSelectedDesk] = useState("");

  const safeSlug = normalizeSlug(slug || restaurant) || id;
  const publicPath = `/uu/menu/${safeSlug}`;
  const publicUrl = `${getBaseUrl()}${publicPath}`;
  const deskCodes = useMemo(() => parseDeskInput(deskInput), [deskInput]);
  const activeCount = formItems.filter((item) => item.name.trim() && !item.soldOut).length;
  const categorySummary = useMemo(() => {
    const map = new Map<string, number>();
    formItems.forEach((item) => {
      const name = item.name.trim();
      if (!name) return;
      const key = item.category.trim() || "精選菜單";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [formItems]);
  const selectedTheme = THEME_OPTIONS.find((item) => item.value === theme) || THEME_OPTIONS[0];
  const previewTokens = getPreviewTokens(theme);
  const previewItems = formItems.filter((item) => item.name.trim()).slice(0, 4);
  const previewCategory = categorySummary[0]?.name || "主廚推薦";
  const previewSubtitle = address || phone || hours || "今日精選菜單";
  const deskStorageKey = `uu-desk-codes:${id}`;
  const selectedDeskUrl = selectedDesk ? `${publicUrl}?table=${encodeURIComponent(selectedDesk)}` : "";

  useEffect(() => {
    const nextMenuText = toMenuText(formItems);
    if (nextMenuText !== menuText) setMenuText(nextMenuText);
    if (!bulkDirty && nextMenuText !== quickInput) setQuickInput(nextMenuText);
  }, [formItems, menuText, quickInput, bulkDirty]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(deskStorageKey);
    if (saved) setDeskInput(saved);
  }, [deskStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (deskInput.trim()) window.localStorage.setItem(deskStorageKey, deskInput);
    else window.localStorage.removeItem(deskStorageKey);
  }, [deskInput, deskStorageKey]);

  useEffect(() => {
    if (!deskCodes.length) {
      setSelectedDesk("");
      return;
    }
    if (!selectedDesk || !deskCodes.includes(selectedDesk)) {
      setSelectedDesk(deskCodes[0]);
    }
  }, [deskCodes, selectedDesk]);

  function pushMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  }

  function updateFormItem(index: number, patch: Partial<MenuItemForm>) {
    setFormItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function handleQuickInputChange(value: string) {
    setQuickInput(value);
    setBulkDirty(true);
  }

  function applyQuickInput() {
    const nextItems = toFormItems(quickInput);
    setFormItems(nextItems);
    const nextMenuText = toMenuText(nextItems);
    setMenuText(nextMenuText);
    setQuickInput(nextMenuText);
    setBulkDirty(false);
    pushMessage("已套用整排輸入");
  }

  function addItem(afterCategory?: string) {
    setFormItems((current) => [
      ...current,
      createFormItem({ category: afterCategory || current[current.length - 1]?.category || "精選菜單" }),
    ]);
  }

  function duplicateItem(index: number) {
    setFormItems((current) => {
      const target = current[index];
      if (!target) return current;
      const next = [...current];
      next.splice(index + 1, 0, createFormItem({ ...target }));
      return next;
    });
  }

  function removeItem(index: number) {
    setFormItems((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [createFormItem()];
    });
  }

  async function handleSave() {
    const latestItems = bulkDirty ? toFormItems(quickInput) : formItems;
    if (bulkDirty) {
      setFormItems(latestItems);
      const syncedMenuText = toMenuText(latestItems);
      setMenuText(syncedMenuText);
      setQuickInput(syncedMenuText);
      setBulkDirty(false);
    }
    const finalMenuText = toMenuText(latestItems);

    if (!restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return;
    }
    if (!finalMenuText.trim()) {
      alert("請至少新增一個菜單品項");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant,
          phone,
          address,
          hours,
          menuText: finalMenuText,
          theme,
          logoDataUrl,
          customSlug: slug,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "更新失敗");
        return;
      }
      if (data?.data?.slug) setSlug(data.data.slug);
      setMenuText(finalMenuText);
      pushMessage("已成功儲存");
    } catch {
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  }

  async function copyText(value: string, okText: string) {
    try {
      await navigator.clipboard.writeText(value);
      pushMessage(okText);
    } catch {
      alert("複製失敗");
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請上傳圖片檔");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <div className="uu-editor-v4-shell">
      {message ? <div className="uu-editor-floating-message"><span className="uu-inline-hint is-success">{message}</span></div> : null}

      <div className="uu-editor-v4-layout uu-editor-v4-layout-single">
        <div className="uu-editor-v4-main">
          <ShopInfoSection
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            restaurant={restaurant}
            setRestaurant={setRestaurant}
            slug={slug}
            setSlug={setSlug}
            phone={phone}
            setPhone={setPhone}
            hours={hours}
            setHours={setHours}
            address={address}
            setAddress={setAddress}
            safeSlug={safeSlug}
          />

          <MenuItemsSection
            activeCount={activeCount}
            categorySummary={categorySummary}
            bulkDirty={bulkDirty}
            quickInput={quickInput}
            handleQuickInputChange={handleQuickInputChange}
            applyQuickInput={applyQuickInput}
            handleSave={handleSave}
            saving={saving}
            formItems={formItems}
            updateFormItem={updateFormItem}
            duplicateItem={duplicateItem}
            removeItem={removeItem}
            addItem={() => addItem()}
          />

          <AppearanceSection
            selectedTheme={selectedTheme}
            theme={theme}
            setTheme={setTheme}
            logoDataUrl={logoDataUrl}
            handleLogoUpload={handleLogoUpload}
            setLogoDataUrl={setLogoDataUrl}
            previewTokens={previewTokens}
            restaurant={restaurant}
            previewSubtitle={previewSubtitle}
            previewCategory={previewCategory}
            previewItems={previewItems}
          />

          <AdvancedToolsSection
            deskInput={deskInput}
            setDeskInput={setDeskInput}
            deskCodes={deskCodes}
            selectedDesk={selectedDesk}
            setSelectedDesk={setSelectedDesk}
            selectedDeskUrl={selectedDeskUrl}
            copyText={copyText}
            handleSave={handleSave}
            saving={saving}
            publicUrl={publicUrl}
            publicPath={publicPath}
          />
        </div>
      </div>
    </div>
  );
}
