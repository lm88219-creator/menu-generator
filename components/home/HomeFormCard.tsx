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
  const lineCount = String(form.menu || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean).length;

  return (
    <div
      className="uu-home-panel"
      style={{
        borderRadius: 24,
        padding: 24,
        border: currentTheme.cardBorder,
        background: currentTheme.cardBg,
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div className="uu-home-panel-head">
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
          START HERE
        </div>

        <h2 style={{ fontSize: isMobile ? 30 : 38, margin: "16px 0 0", lineHeight: 1.08 }}>先把店家資訊與菜單填完整</h2>

        <p
          style={{
            marginTop: 12,
            color: currentTheme.subText,
            fontSize: 15,
            lineHeight: 1.8,
            maxWidth: 700,
          }}
        >
          這一區專門處理建立流程。先填店名、基本資訊、菜單與主題，生成後就能立刻拿到公開網址與 QR Code。
        </p>
      </div>

      <div className="uu-home-checklist" style={{ border: currentTheme.inputBorder, background: currentTheme.inputBg }}>
        <div>
          <strong>建立流程</strong>
          <span>1. 店家資料 → 2. 菜單內容 → 3. 主題與 Logo → 4. 生成公開頁</span>
        </div>
        <div>
          <strong>目前菜單行數</strong>
          <span>{lineCount} 行</span>
        </div>
      </div>

      <SectionTitle title="店家基本資料" desc="公開頁與 QR Code 會優先使用這些內容。" />

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
        <div className="uu-home-slug-help" style={{ background: currentTheme.inputBg, border: currentTheme.inputBorder }}>
          <strong>公開網址預覽</strong>
          <span>{form.customSlug ? `https://你的網站/menu/${form.customSlug}` : "未填寫時，系統會自動依店名轉成網址 slug。"}</span>
        </div>
        <div style={{ marginTop: 8, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
          只能輸入英文、數字與 -。若之後修改 slug，舊連結與舊 QR Code 也要一起更新。
        </div>
      </FieldBlock>

      <SectionTitle title="品牌外觀" desc="先挑好主題，再決定要不要放 Logo。" />

      <FieldBlock label="餐廳 Logo">
        <div className="uu-home-logo-box" style={{ border: currentTheme.inputBorder, background: currentTheme.inputBg }}>
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
            {form.logoDataUrl ? "更換 Logo" : "上傳 Logo"}
          </label>
          {form.logoDataUrl ? (
            <div className="uu-home-logo-preview-wrap">
              <div className="uu-home-logo-preview">
                <img src={form.logoDataUrl} alt="logo preview" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block" }} />
              </div>
              <button onClick={onLogoRemove} style={ghostButtonStyle}>移除 Logo</button>
            </div>
          ) : (
            <div style={{ marginTop: 10, fontSize: 12, color: currentTheme.subText }}>PNG / JPG，建議使用正方形，公開頁看起來會比較穩定。</div>
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

      <SectionTitle title="菜單內容" desc="分類獨立一行，品項建議使用「名稱 空格 價格」格式。" />

      <FieldBlock label="菜單內容">
        <textarea
          rows={12}
          value={form.menu}
          onChange={(e) => onMenuChange(e.target.value)}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, minHeight: 240 }}
          placeholder={`例如：\n鵝肉\n鹽水鵝肉 200\n麻油鵝肉 220\n\n主食\n炒飯 80\n炒麵 80`}
        />
        <div className="uu-home-menu-tips" style={{ color: currentTheme.subText }}>
          <span>分類：單獨一行，例如「熱炒」</span>
          <span>品項：名稱後面接價格，例如「炒螺肉 120」</span>
          <span>備註：可用「｜」或「/」補充，例如「蝦仁炒飯 90｜加大 +10」</span>
        </div>
      </FieldBlock>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onGenerate} style={mainButtonStyle}>{creating ? "生成中..." : "生成 QR 菜單"}</button>
        <button onClick={onFillExample} style={ghostButtonStyle}>填入範例菜單</button>
        <button onClick={onClear} style={ghostButtonStyle}>清空</button>
      </div>
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="uu-home-section-title">
      <strong>{title}</strong>
      <span>{desc}</span>
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
