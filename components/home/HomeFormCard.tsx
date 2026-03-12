import type { CSSProperties, ReactNode } from "react";
import type { ThemeType } from "@/lib/theme";
import type { HomeFormState, HomeThemeOption } from "./home-utils";
import { MenuImageUpload } from "./MenuImageUpload";

export function HomeFormCard({
  form,
  isMobile,
  currentTheme,
  themeOptions,
  inputStyle,
  ghostButtonStyle,
  mainButtonStyle,
  creating,
  recognizing,
  recognitionNotice,
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
  onRecognizeImage,
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
  recognizing: boolean;
  recognitionNotice: string;
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
  onRecognizeImage: (file: File | null | undefined) => Promise<void>;
}) {
  const selectedTheme = themeOptions.find((item) => item.value === form.theme) ?? themeOptions[0];

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
        先填店名、貼上菜單、挑好風格。現在也能先上傳菜單圖片，自動辨識後幫你把資料帶進表單。
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
          ["先填基本資料", "店名、菜單、主題先完成就能生成"],
          ["圖片可先辨識", "菜單圖會先轉成草稿，再帶入表單"],
          ["生成後直接分享", "公開網址與 QR Code 會一起產生"],
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

      <FieldBlock label="菜單風格">
        <div style={{ position: "relative" }}>
          <select value={form.theme} onChange={(e) => onThemeChange(e.target.value as ThemeType)} style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 52 }}>
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: currentTheme.subText,
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            ▼
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 14,
            border: currentTheme.inputBorder,
            background: currentTheme.inputBg,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 800 }}>{selectedTheme.label}</div>
            <div style={{ marginTop: 4, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>{selectedTheme.desc}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {selectedTheme.preview.map((color, index) => (
              <span key={`${selectedTheme.value}-${index}`} style={{ width: 20, height: 20, borderRadius: 999, background: color, border: "1px solid rgba(0,0,0,0.08)" }} />
            ))}
          </div>
        </div>
      </FieldBlock>

      <FieldBlock label="菜單圖片辨識">
        <MenuImageUpload
          currentTheme={currentTheme}
          recognizing={recognizing}
          recognitionNotice={recognitionNotice}
          onRecognizeImage={onRecognizeImage}
        />
      </FieldBlock>

      <FieldBlock label="菜單內容">
        <textarea
          rows={12}
          value={form.menu}
          onChange={(e) => onMenuChange(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, minHeight: 220 }}
          placeholder={`例如：
鵝肉
鹽水鵝肉 200
麻油鵝肉 220

主食
炒飯 80
炒麵 80`}
        />
      </FieldBlock>

      <details className="uu-home-advanced-panel">
        <summary className="uu-home-advanced-summary">進階設定</summary>

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
          <input value={form.customSlug} onChange={(e) => onCustomSlugChange(e.target.value)} style={inputStyle} placeholder="例如：you-ai-hotpot" />
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
            預設網址： https://你的網站/menu/{form.customSlug || "自動依店名產生"}
          </div>
          <div style={{ marginTop: 8, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
            預設會依店名自動產生，只有想自訂公開網址時才需要修改。
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
      </details>

      <div className="uu-home-helper-panel" style={{ color: currentTheme.subText }}>
        <strong style={{ color: currentTheme.text }}>建議流程</strong>
        <span>店名與菜單先完成即可生成，圖片辨識完也記得再看一下草稿，確認後再建立公開頁。</span>
      </div>

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
