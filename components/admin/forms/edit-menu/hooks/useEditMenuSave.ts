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
  onSaved: (nextSlug: string | undefined, nextMenuText: string) => void;
};

export function useEditMenuSave(pushMessage: (text: string) => void) {
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async function handleSave(args: SaveArgs) {
    const latestItems = args.bulkDirty ? toFormItems(args.quickInput) : args.formItems;
    if (!args.restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return;
    }

    const finalMenuText = toMenuText(latestItems);
    if (!finalMenuText.trim()) {
      alert("請至少新增一個菜單品項");
      return;
    }

    if (args.bulkDirty) {
      args.onSyncQuickInput(latestItems, finalMenuText);
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/menu/${args.id}`, {
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
        return;
      }

      args.onSaved(data?.data?.slug, finalMenuText);
      pushMessage("已成功儲存");
    } catch {
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  }, [pushMessage]);

  return { saving, handleSave };
}
