"use client";

import type { CSSProperties } from "react";

import { HomeFormCard } from "./HomeFormCard";
import { HomePreviewCard } from "./HomePreviewCard";
import { HomeResultCard } from "./HomeResultCard";
import { getHomeButtonStyles } from "./home-utils";
import { useHomeMenuBuilder } from "./useHomeMenuBuilder";

export default function HomePageClient() {
  const {
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
    clearRecognition,
    copyUrl,
    uploadLogo,
    removeLogo,
    setTheme,
  } = useHomeMenuBuilder();

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: currentTheme.inputBorder,
    background: currentTheme.inputBg,
    color: currentTheme.text,
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  };

  const { ghostButtonStyle, mainButtonStyle } = getHomeButtonStyles({ currentTheme, theme: form.theme });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: currentTheme.pageBg,
        color: currentTheme.text,
        padding: "40px 16px",
        fontFamily: "Arial, sans-serif",
        transition: "0.2s ease",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div className="uu-home-top-strip">
          <div className="uu-home-top-chip">1. 填店名與菜單</div>
          <div className="uu-home-top-chip">2. 挑主題</div>
          <div className="uu-home-top-chip">3. 生成網址與 QR</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.12fr 0.88fr", gap: 18, alignItems: "start" }}>
          <HomeFormCard
            form={form}
            isMobile={isMobile}
            currentTheme={currentTheme}
            themeOptions={themeOptions}
            inputStyle={inputStyle}
            ghostButtonStyle={ghostButtonStyle}
            mainButtonStyle={mainButtonStyle}
            creating={creating}
            recognizing={recognizing}
            recognitionNotice={recognitionNotice}
            recognitionSummary={recognitionSummary}
            onRestaurantChange={setRestaurant}
            onPhoneChange={(phone) => patchForm({ phone })}
            onHoursChange={(hours) => patchForm({ hours })}
            onAddressChange={(address) => patchForm({ address })}
            onCustomSlugChange={setCustomSlug}
            onLogoUpload={uploadLogo}
            onLogoRemove={removeLogo}
            onThemeChange={setTheme}
            onMenuChange={(menu) => patchForm({ menu })}
            onGenerate={generateMenu}
            onFillExample={fillExample}
            onClear={clearAll}
            onRecognizeImage={recognizeMenuImage}
            onClearRecognition={clearRecognition}
            onToggleRecognitionField={toggleRecognitionField}
            onApplySelectedRecognition={applySelectedRecognition}
          />

          <HomePreviewCard form={form} isMobile={isMobile} currentTheme={currentTheme} />
        </div>

        <HomeResultCard
          form={form}
          qrText={qrText}
          copied={copied}
          downloadingPoster={downloadingPoster}
          setDownloadingPoster={setDownloadingPoster}
          currentTheme={currentTheme}
          isMobile={isMobile}
          mainButtonStyle={mainButtonStyle}
          ghostButtonStyle={ghostButtonStyle}
          onCopyUrl={copyUrl}
        />
      </div>
    </main>
  );
}
