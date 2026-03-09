"use client";

import { useEffect, useMemo, useState } from "react";
import { AdvancedToolsSection } from "./edit-menu/AdvancedToolsSection";
import { AppearanceSection } from "./edit-menu/AppearanceSection";
import { MenuItemsSection } from "./edit-menu/MenuItemsSection";
import { ShopInfoSection } from "./edit-menu/ShopInfoSection";
import type { InitialData } from "./edit-menu/shared-ui";
import { useDeskCodes } from "./edit-menu/hooks/useDeskCodes";
import { useEditMenuSave } from "./edit-menu/hooks/useEditMenuSave";
import { useEditMenuFormState } from "./edit-menu/hooks/useEditMenuFormState";
import { useLogoUpload } from "./edit-menu/hooks/useLogoUpload";

export type { InitialData, MenuItemForm, ThemeType } from "./edit-menu/shared-ui";

export default function EditMenuForm({ id, initialData }: { id: string; initialData: InitialData }) {
  const [message, setMessage] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const state = useEditMenuFormState(id, initialData);
  const { deskInput, setDeskInput, deskCodes, selectedDesk, setSelectedDesk } = useDeskCodes(id);
  const selectedDeskUrl = selectedDesk ? `${state.publicUrl}?table=${encodeURIComponent(selectedDesk)}` : "";

  const snapshot = useMemo(
    () =>
      JSON.stringify({
        restaurant: state.restaurant.trim(),
        phone: state.phone.trim(),
        address: state.address.trim(),
        hours: state.hours.trim(),
        menuText: state.menuText.trim(),
        quickInput: state.quickInput.trim(),
        bulkDirty: state.bulkDirty,
        theme: state.theme,
        logoDataUrl: state.logoDataUrl,
        slug: state.slug,
        isPublished: state.isPublished,
      }),
    [
      state.restaurant,
      state.phone,
      state.address,
      state.hours,
      state.menuText,
      state.quickInput,
      state.bulkDirty,
      state.theme,
      state.logoDataUrl,
      state.slug,
      state.isPublished,
    ]
  );

  useEffect(() => {
    setSavedSnapshot((current) => current ?? snapshot);
  }, [snapshot]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(state.restaurant.trim()),
      Boolean(state.phone.trim()),
      Boolean(state.address.trim()),
      Boolean(state.hours.trim()),
      Boolean(state.formItems.filter((item) => item.name.trim()).length),
      Boolean(state.safeSlug.trim()),
      Boolean(state.logoDataUrl),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [state.restaurant, state.phone, state.address, state.hours, state.formItems, state.safeSlug, state.logoDataUrl]);

  const isDirty = savedSnapshot !== null && snapshot !== savedSnapshot;

  function pushMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  }

  const { saving, handleSave } = useEditMenuSave(pushMessage);
  const handleLogoUpload = useLogoUpload(state.setLogoDataUrl);

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
      restaurant: state.restaurant,
      phone: state.phone,
      address: state.address,
      hours: state.hours,
      formItems: state.formItems,
      quickInput: state.quickInput,
      bulkDirty: state.bulkDirty,
      theme: state.theme,
      logoDataUrl: state.logoDataUrl,
      slug: state.slug,
      isPublished: state.isPublished,
      onSyncQuickInput: state.syncQuickInput,
      onSaved: (nextSlug, updatedAt) => {
        if (nextSlug) state.setSlug(nextSlug);
        if (updatedAt) setLastSavedAt(updatedAt);
        setSavedSnapshot(
          JSON.stringify({
            restaurant: state.restaurant.trim(),
            phone: state.phone.trim(),
            address: state.address.trim(),
            hours: state.hours.trim(),
            menuText: state.bulkDirty ? state.quickInput.trim() : state.menuText.trim(),
            quickInput: state.bulkDirty ? state.quickInput.trim() : state.menuText.trim(),
            bulkDirty: false,
            theme: state.theme,
            logoDataUrl: state.logoDataUrl,
            slug: nextSlug ?? state.slug,
            isPublished: state.isPublished,
          })
        );
      },
    });
  }

  return (
    <div className="uu-editor-v4-shell">
      {message ? <div className="uu-editor-floating-message"><span className="uu-inline-hint is-success">{message}</span></div> : null}

      <div className="uu-editor-workbench">
        <div className="uu-editor-workbench-main">
          <strong>編輯工作台</strong>
          <span>完成度 {completion}% ・ {state.activeCount} 項品項 ・ {state.isPublished ? "公開中" : "目前下架"}</span>
        </div>
        <div className="uu-editor-workbench-side">
          <span className={`uu-editor-dirty-chip ${isDirty ? "is-dirty" : "is-clean"}`}>
            {isDirty ? "尚未儲存變更" : "已與伺服器同步"}
          </span>
          <span className="uu-editor-last-saved">{lastSavedAt ? `最後儲存：${formatDateTime(lastSavedAt)}` : "尚未重新儲存"}</span>
        </div>
      </div>

      <div className="uu-editor-v4-layout uu-editor-v4-layout-single">
        <div className="uu-editor-v4-main">
          <ShopInfoSection
            isPublished={state.isPublished}
            setIsPublished={state.setIsPublished}
            restaurant={state.restaurant}
            setRestaurant={state.setRestaurant}
            slug={state.slug}
            setSlug={state.setSlug}
            phone={state.phone}
            setPhone={state.setPhone}
            hours={state.hours}
            setHours={state.setHours}
            address={state.address}
            setAddress={state.setAddress}
            safeSlug={state.safeSlug}
          />

          <MenuItemsSection
            activeCount={state.activeCount}
            categorySummary={state.categorySummary}
            bulkDirty={state.bulkDirty}
            quickInput={state.quickInput}
            handleQuickInputChange={state.handleQuickInputChange}
            applyQuickInput={state.applyQuickInput}
            handleSave={onSave}
            saving={saving}
            formItems={state.formItems}
            updateFormItem={state.updateFormItem}
            duplicateItem={state.duplicateItem}
            removeItem={state.removeItem}
            addItem={() => state.addItem()}
          />

          <AppearanceSection
            selectedTheme={state.selectedTheme}
            theme={state.theme}
            setTheme={state.setTheme}
            logoDataUrl={state.logoDataUrl}
            handleLogoUpload={handleLogoUpload}
            setLogoDataUrl={state.setLogoDataUrl}
            previewTokens={state.previewTokens}
            restaurant={state.restaurant}
            previewSubtitle={state.previewSubtitle}
            previewCategory={state.previewCategory}
            previewItems={state.previewItems}
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
            publicUrl={state.publicUrl}
            publicPath={state.publicPath}
          />
        </div>
      </div>

      <div className="uu-editor-sticky-savebar">
        <div className="uu-editor-sticky-savebar-copy">
          <strong>{isDirty ? "有變更尚未儲存" : "目前內容已儲存"}</strong>
          <span>{state.restaurant || "未命名店家"} ・ /{state.safeSlug}</span>
        </div>
        <div className="uu-editor-sticky-savebar-actions">
          <button type="button" className="uu-btn uu-btn-secondary" onClick={() => copyText(state.publicUrl, "已複製公開網址")}>複製公開網址</button>
          <button type="button" className="uu-btn uu-btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "儲存中..." : isDirty ? "立即儲存變更" : "再次儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
