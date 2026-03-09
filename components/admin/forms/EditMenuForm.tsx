"use client";

import { useState } from "react";
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
  const state = useEditMenuFormState(id, initialData);
  const { deskInput, setDeskInput, deskCodes, selectedDesk, setSelectedDesk } = useDeskCodes(id);
  const selectedDeskUrl = selectedDesk ? `${state.publicUrl}?table=${encodeURIComponent(selectedDesk)}` : "";

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
      onSaved: (nextSlug) => {
        if (nextSlug) state.setSlug(nextSlug);
      },
    });
  }

  return (
    <div className="uu-editor-v4-shell">
      {message ? <div className="uu-editor-floating-message"><span className="uu-inline-hint is-success">{message}</span></div> : null}

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
