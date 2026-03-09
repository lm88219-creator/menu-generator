import type { CSSProperties, ReactNode } from "react";
import { getThemeCardStyle, type HomeFormState, type HomeThemeOption } from "./home-utils";
import type { ThemeType } from "@/lib/theme";

export function HomeFormCard({
  form,
  isMobile,
  currentTheme,
  themeOptions,
  inputStyle,
  ghostButtonStyle,
  mainButtonStyle,
  creating,
  onRestaurantChange,
  onPhoneChange,
  onHoursChange,
  onAddressChange,
  onCustomSlugChange,
  onLogoUpload,
  onLogoRemove,
  onThemeChange,
  onMenuChange,
  onGenerate,
  onFillExample,
  onClear,
}: {
  form: HomeFormState;
  isMobile: boolean;
  currentTheme: {
    cardBorder: string;
    cardBg: string;
    text: string;
    subText: string;
    inputBg: string;
    inputBorder: string;
  };
  themeOptions: HomeThemeOption[];
  inputStyle: CSSProperties;
  ghostButtonStyle: CSSProperties;
  mainButtonStyle: CSSProperties;
  creating: boolean;
  onRestaurantChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCustomSlugChange: (value: string) => void;
  onLogoUpload: (file: File | null | undefined) => void;
  onLogoRemove: () => void;
  onThemeChange: (value: ThemeType) => void;
  onMenuChange: (value: string) => void;
  onGenerate: () => void;
  onFillExample: () => void;
  onClear: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        padding: 24,
        border: currentTheme.cardBorder,
        background: currentTheme.cardBg,
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 999,
          background: form.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          fontSize: 13,
          color: currentTheme.subText,
          letterSpacing: "0.1em",
          fontWeight: 700,
        }}
      >
        UU MENU
      </div>

      <h1 style={{ fontSize: isMobile ? 34 : 42, margin: "16px 0 0", lineHeight: 1.08 }}>QR 菜單生成器</h1>

      <p
        style={{
          marginTop: 12,
          color: currentTheme.subText,
          fontSize: 16,
          lineHeight: 1.8,
          maxWidth: 640,
        }}
      >
        為餐廳快速建立 QR Code 菜單
        <br />
        一分鐘生成可分享的線上菜單
      </p>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {[
          ["品牌資訊", "店名、Logo、電話一次填好"],
          ["主題風格", "公開頁與 QR 視覺同步更新"],
          ["正式網址", "生成後可直接複製分享"],
        ].map(([title, desc]) => (
          <div key={title} style={{ padding: 14, borderRadius: 16, border: currentTheme.inputBorder, background: currentTheme.inputBg }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{title}</div>
            <div style={{ marginTop: 6, color: currentTheme.subText, fontSize: 12, lineHeight: 1.7 }}>{desc}</div>
          </div>
        ))}
      </div>

      <FieldBlock label="餐廳名稱">
        <input value={form.restaurant} onChange={(e) => onRestaurantChange(e.target.value)} style={inputStyle} placeholder="例如：友愛熱炒" />
      </FieldBlock>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <FieldBlock label="電話" compact>
          <input value={form.phone} onChange={(e) => onPhoneChange(e.target.value)} style={inputStyle} placeholder="例如：0912-345-678" />
        </FieldBlock>
        <FieldBlock label="營業時間" compact>
          <input value={form.hours} onChange={(e) => onHoursChange(e.target.value)} style={inputStyle} placeholder="例如：17:00 - 01:00" />
        </FieldBlock>
      </div>

      <FieldBlock label="地址">
        <input value={form.address} onChange={(e) => onAddressChange(e.target.value)} style={inputStyle} placeholder="例如：嘉義市西區友愛路100號" />
      </FieldBlock>

      <FieldBlock label="自訂網址代稱">
        <input value={form.customSlug} onChange={(e) => onCustomSlugChange(e.target.value)} style={inputStyle} placeholder="例如：food-168" />
        {form.customSlug ? (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: currentTheme.inputBg,
              border: currentTheme.inputBorder,
              fontSize: 13,
              color: currentTheme.subText,
              wordBreak: "break-all",
            }}
          >
            https://你的網站/menu/{form.customSlug}
          </div>
        ) : null}
        <div style={{ marginTop: 8, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
          可選填，若不填系統會自動將餐廳名稱轉為英文網址，且只能輸入英文、數字與 -。
        </div>
      </FieldBlock>

      <FieldBlock label="餐廳 Logo">
        <div style={{ borderRadius: 16, border: currentTheme.inputBorder, background: currentTheme.inputBg, padding: 14 }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              padding: "10px 16px",
              borderRadius: 12,
              border: currentTheme.inputBorder,
              background: form.theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            <input type="file" accept="image/*" onChange={(e) => onLogoUpload(e.target.files?.[0])} style={{ display: "none" }} />
            上傳 Logo
          </label>
          {form.logoDataUrl ? (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  padding: 8,
                }}
              >
                <img src={form.logoDataUrl} alt="logo preview" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block" }} />
              </div>
              <button onClick={onLogoRemove} style={ghostButtonStyle}>移除 Logo</button>
            </div>
          ) : (
            <div style={{ marginTop: 10, fontSize: 12, color: currentTheme.subText }}>PNG / JPG，建議使用方形圖片</div>
          )}
        </div>
      </FieldBlock>

      <FieldBlock label="菜單風格">
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          {themeOptions.map(({ value, label: title, desc, accent }) => {
            const surface = getThemeCardStyle(value, form.theme);
            return (
              <button key={value} type="button" onClick={() => onThemeChange(value)} style={surface}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 6, height: 30, borderRadius: 999, background: accent, display: "inline-block" }} />
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
                  </div>
                  {form.theme === value ? <span style={{ fontSize: 12, color: "inherit", fontWeight: 700 }}>已選</span> : null}
                </div>
                <div style={{ fontSize: 13, opacity: 0.76, marginTop: 10, textAlign: "left" }}>{desc}</div>
              </button>
            );
          })}
        </div>
      </FieldBlock>

      <FieldBlock label="菜單內容">
        <textarea
          rows={12}
          value={form.menu}
          onChange={(e) => onMenuChange(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, minHeight: 220 }}
          placeholder={`例如：\n鵝肉\n鹽水鵝肉 200\n麻油鵝肉 220\n\n主食\n炒飯 80\n炒麵 80`}
        />
      </FieldBlock>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onGenerate} style={mainButtonStyle}>{creating ? "生成中..." : "生成 QR 菜單"}</button>
        <button onClick={onFillExample} style={ghostButtonStyle}>填入範例菜單</button>
        <button onClick={onClear} style={ghostButtonStyle}>清空</button>
      </div>
    </div>
  );
}

function FieldBlock({ label, children, compact = false }: { label: string; children: ReactNode; compact?: boolean }) {
  return (
    <div style={{ marginTop: compact ? 0 : 18 }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>{label}</div>
      {children}
    </div>
  );
}
