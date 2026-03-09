"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeSlug } from "@/lib/menu";
import { joinPublicUrl } from "@/lib/public-url";
import { getPublicMenuPath } from "@/lib/routes";
import { AdvancedToolsSection } from "./edit-menu/AdvancedToolsSection";
import { AppearanceSection } from "./edit-menu/AppearanceSection";
import { MenuItemsSection } from "./edit-menu/MenuItemsSection";
import { ShopInfoSection } from "./edit-menu/ShopInfoSection";
import {
  createFormItem,
  getPreviewTokens,
  THEME_OPTIONS,
  toFormItems,
  toMenuText,
  type InitialData,
  type MenuItemForm,
  type ThemeType,
} from "./edit-menu/shared-ui";
import { useDeskCodes } from "./edit-menu/hooks/useDeskCodes";
import { useEditMenuSave } from "./edit-menu/hooks/useEditMenuSave";
import { useLogoUpload } from "./edit-menu/hooks/useLogoUpload";

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
  const [message, setMessage] = useState("");

  const { deskInput, setDeskInput, deskCodes, selectedDesk, setSelectedDesk } = useDeskCodes(id);
  const safeSlug = normalizeSlug(slug || restaurant) || id;
  const publicPath = getPublicMenuPath(safeSlug);
  const publicUrl = joinPublicUrl(publicPath);
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
  const selectedDeskUrl = selectedDesk ? `${publicUrl}?table=${encodeURIComponent(selectedDesk)}` : "";

  function pushMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  }

  const { saving, handleSave } = useEditMenuSave(pushMessage);
  const handleLogoUpload = useLogoUpload(setLogoDataUrl);

  useEffect(() => {
    const nextMenuText = toMenuText(formItems);
    if (nextMenuText !== menuText) setMenuText(nextMenuText);
    if (!bulkDirty && nextMenuText !== quickInput) setQuickInput(nextMenuText);
  }, [formItems, menuText, quickInput, bulkDirty]);

  function updateFormItem(index: number, patch: Partial<MenuItemForm>) {
    setFormItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function handleQuickInputChange(value: string) {
    setQuickInput(value);
    setBulkDirty(true);
  }

  function applyQuickInput() {
    const nextItems = toFormItems(quickInput);
    const nextMenuText = toMenuText(nextItems);
    setFormItems(nextItems);
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

  async function copyText(value: string, okText: string) {
    try {
      await navigator.clipboard.writeText(value);
      pushMessage(okText);
    } catch {
      alert("複製失敗");
    }
  }

  async function onSave() {
    await handleSave({
      id,
      restaurant,
      phone,
      address,
      hours,
      formItems,
      quickInput,
      bulkDirty,
      theme,
      logoDataUrl,
      slug,
      isPublished,
      onSyncQuickInput: (items, syncedMenuText) => {
        setFormItems(items);
        setMenuText(syncedMenuText);
        setQuickInput(syncedMenuText);
        setBulkDirty(false);
      },
      onSaved: (nextSlug) => {
        if (nextSlug) setSlug(nextSlug);
        setMenuText(toMenuText(formItems));
      },
    });
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
            handleSave={onSave}
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
            handleSave={onSave}
            saving={saving}
            publicUrl={publicUrl}
            publicPath={publicPath}
          />
        </div>
      </div>
    </div>
  );
}
