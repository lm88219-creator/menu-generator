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

function buildSnapshot(input: {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  quickInput: string;
  theme: string;
  logoDataUrl: string;
  slug: string;
  isPublished: boolean;
}) {
  return JSON.stringify({
    restaurant: input.restaurant.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    hours: input.hours.trim(),
    quickInput: input.quickInput.trim(),
    theme: input.theme,
    logoDataUrl: input.logoDataUrl,
    slug: input.slug.trim(),
    isPublished: input.isPublished,
  });
}

function formatSavedTime(timestamp: number | null) {
  if (!timestamp) return "尚未儲存";
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

export default function EditMenuForm({ id, initialData }: { id: string; initialData: InitialData }) {
  const [message, setMessage] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(Date.now());
  const state = useEditMenuFormState(id, initialData);
  const { deskInput, setDeskInput, deskCodes, selectedDesk, setSelectedDesk } = useDeskCodes(id);
  const selectedDeskUrl = selectedDesk ? `${state.publicUrl}?table=${encodeURIComponent(selectedDesk)}` : "";

  function pushMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  }

  const { saving, handleSave } = useEditMenuSave(pushMessage);
  const handleLogoUpload = useLogoUpload(state.setLogoDataUrl);

  const currentSnapshot = useMemo(
    () =>
      buildSnapshot({
        restaurant: state.restaurant,
        phone: state.phone,
        address: state.address,
        hours: state.hours,
        quickInput: state.quickInput,
        theme: state.theme,
        logoDataUrl: state.logoDataUrl,
        slug: state.slug,
        isPublished: state.isPublished,
      }),
    [state.restaurant, state.phone, state.address, state.hours, state.quickInput, state.theme, state.logoDataUrl, state.slug, state.isPublished]
  );

  const initialSnapshot = useMemo(
    () =>
      buildSnapshot({
        restaurant: initialData.restaurant,
        phone: initialData.phone ?? "",
        address: initialData.address ?? "",
        hours: initialData.hours ?? "",
        quickInput: initialData.menuText ?? "",
        theme: initialData.theme,
        logoDataUrl: initialData.logoDataUrl ?? "",
        slug: initialData.slug ?? "",
        isPublished: initialData.isPublished !== false,
      }),
    [initialData]
  );

  const [savedSnapshot, setSavedSnapshot] = useState(initialSnapshot);
  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;
  const hasChangedSinceInitial = currentSnapshot !== initialSnapshot;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

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
      onSaved: (nextSlug, nextMenuText) => {
        if (nextSlug) state.setSlug(nextSlug);
        const nextSavedAt = Date.now();
        setSavedSnapshot(
          buildSnapshot({
            restaurant: state.restaurant,
            phone: state.phone,
            address: state.address,
            hours: state.hours,
            quickInput: nextMenuText,
            theme: state.theme,
            logoDataUrl: state.logoDataUrl,
            slug: nextSlug ?? state.slug,
            isPublished: state.isPublished,
          })
        );
        setLastSavedAt(nextSavedAt);
      },
    });
  }

  return (
    <div className="uu-editor-v4-shell">
      {message ? <div className="uu-editor-floating-message"><span className="uu-inline-hint is-success">{message}</span></div> : null}

      <section className="uu-panel uu-editor-workbench-bar">
        <div className="uu-editor-workbench-main">
          <div>
            <div className="uu-kicker">編輯工作台</div>
            <h2>店家資料、菜單內容與公開頁設定都集中在這裡</h2>
            <p>
              {hasUnsavedChanges
                ? "你目前有尚未儲存的修改，建議先存檔再離開頁面。"
                : "目前內容已同步到最新儲存版本，可以繼續微調後再存檔。"}
            </p>
          </div>

          <div className="uu-editor-workbench-meta">
            <span className={`uu-status ${hasUnsavedChanges ? "is-warn" : "is-on"}`}>
              {hasUnsavedChanges ? "尚未儲存" : "已儲存"}
            </span>
            <span className="uu-chip">最後儲存 {formatSavedTime(lastSavedAt)}</span>
            <span className="uu-chip">{state.activeCount} 項菜單</span>
            <span className="uu-chip">{state.categorySummary.length} 個分類</span>
            <span className="uu-chip">{state.isPublished ? "公開中" : "已下架"}</span>
          </div>
        </div>

        <div className="uu-editor-workbench-actions">
          <button type="button" className="uu-btn uu-btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "儲存中..." : hasUnsavedChanges ? "儲存變更" : "再次儲存"}
          </button>
          <button type="button" className="uu-btn uu-btn-secondary" onClick={() => copyText(state.publicUrl, "已複製公開網址")}>
            複製公開網址
          </button>
          <a className="uu-btn uu-btn-secondary" href={state.publicPath} target="_blank" rel="noreferrer">
            開啟公開頁
          </a>
        </div>

        {hasChangedSinceInitial ? (
          <div className="uu-editor-workbench-note">
            <strong>提醒：</strong>
            {state.slug !== (initialData.slug ?? "")
              ? "你已修改菜單網址 slug，舊的 QR Code 或舊連結可能需要一起更新。"
              : "目前編輯內容與你剛進入頁面時已不同，離開前記得確認是否已儲存。"}
          </div>
        ) : null}
      </section>

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
    </div>
  );
}
