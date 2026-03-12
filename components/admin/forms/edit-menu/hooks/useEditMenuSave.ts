import { useCallback, useState } from "react";
import { toFormItems, toMenuText, type MenuItemForm, type ThemeType } from "../shared-ui";

type SaveArgs = {
  id: string;
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  formItems: MenuItemForm[];
  quickInput: string;
  bulkDirty: boolean;
  theme: ThemeType;
  logoDataUrl: string;
  slug: string;
  isPublished: boolean;
  onSyncQuickInput: (items: MenuItemForm[], menuText: string) => void;
  onSaved: (nextSlug?: string, updatedAt?: number) => void;
};

export function useEditMenuSave(pushMessage: (text: string) => void) {
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async function handleSave(args: SaveArgs) {
    const latestItems = args.bulkDirty ? toFormItems(args.quickInput) : args.formItems;
    if (!args.restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return false;
    }

    const finalMenuText = toMenuText(latestItems);
    if (!finalMenuText.trim()) {
      alert("請至少新增一個菜單品項");
      return false;
    }

    if (args.bulkDirty) {
      args.onSyncQuickInput(latestItems, finalMenuText);
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/menus/${args.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: args.restaurant,
          phone: args.phone,
          address: args.address,
          hours: args.hours,
          menuText: finalMenuText,
          theme: args.theme,
          logoDataUrl: args.logoDataUrl,
          customSlug: args.slug,
          isPublished: args.isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "更新失敗");
        return false;
      }

      args.onSaved(data?.data?.slug, data?.data?.updatedAt ?? Date.now());
      pushMessage("已成功儲存");
      return true;
    } catch {
      alert("更新失敗");
      return false;
    } finally {
      setSaving(false);
    }
  }, [pushMessage]);

  return { saving, handleSave };
}
