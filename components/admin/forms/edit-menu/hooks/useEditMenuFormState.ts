import { useEffect, useMemo, useState } from "react";
import { normalizeSlug } from "@/lib/menu";
import { joinPublicUrl } from "@/lib/public-url";
import { getPublicMenuPath } from "@/lib/routes";
import {
  createFormItem,
  getPreviewTokens,
  THEME_OPTIONS,
  toFormItems,
  toMenuText,
  type InitialData,
  type MenuItemForm,
  type ThemeType,
} from "../shared-ui";

export function useEditMenuFormState(id: string, initialData: InitialData) {
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

  function syncQuickInput(items: MenuItemForm[], syncedMenuText: string) {
    setFormItems(items);
    setMenuText(syncedMenuText);
    setQuickInput(syncedMenuText);
    setBulkDirty(false);
  }

  return {
    restaurant,
    setRestaurant,
    phone,
    setPhone,
    address,
    setAddress,
    hours,
    setHours,
    formItems,
    setFormItems,
    menuText,
    setMenuText,
    quickInput,
    setQuickInput,
    bulkDirty,
    setBulkDirty,
    theme,
    setTheme,
    logoDataUrl,
    setLogoDataUrl,
    slug,
    setSlug,
    isPublished,
    setIsPublished,
    safeSlug,
    publicPath,
    publicUrl,
    activeCount,
    categorySummary,
    selectedTheme,
    previewTokens,
    previewItems,
    previewCategory,
    previewSubtitle,
    updateFormItem,
    handleQuickInputChange,
    applyQuickInput,
    addItem,
    duplicateItem,
    removeItem,
    syncQuickInput,
  };
}
