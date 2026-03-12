import { useMemo, useRef } from "react";
import type { HomeRecognitionSummary } from "./home-utils";

type Props = {
  currentTheme: {
    inputBg: string;
    inputBorder: string;
    subText: string;
    text: string;
  };
  recognizing: boolean;
  recognitionNotice: string;
  recognitionSummary: HomeRecognitionSummary | null;
  onRecognizeImage: (file: File | null | undefined) => Promise<void>;
  onClearRecognition: () => void;
  onToggleField: (field: string) => void;
  onUpdateField: (field: string, value: string) => void;
  onToggleMenuItem: (id: string) => void;
  onUpdateMenuItem: (id: string, patch: { name?: string; price?: string; category?: string }) => void;
  onDeleteMenuItem: (id: string) => void;
  onAddMenuItem: () => void;
  onApplySelected: () => void;
};

function getStatusLabel(status: "ready" | "review" | "missing") {
  if (status === "ready") return "可套用";
  if (status === "review") return "待確認";
  return "未抓到";
}

export function MenuImageUpload({
  currentTheme,
  recognizing,
  recognitionNotice,
  recognitionSummary,
  onRecognizeImage,
  onClearRecognition,
  onToggleField,
  onUpdateField,
  onToggleMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onAddMenuItem,
  onApplySelected,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const confidenceTone = useMemo(() => {
    if (!recognitionSummary?.confidenceAverage) return currentTheme.subText;
    if (recognitionSummary.confidenceAverage >= 85) return "#15803d";
    if (recognitionSummary.confidenceAverage >= 68) return "#a16207";
    return "#b91c1c";
  }, [currentTheme.subText, recognitionSummary]);

  const selectedFieldCount = recognitionSummary?.fieldStatus.filter((item) => item.selected && item.filled).length ?? 0;
  const selectedItemCount = recognitionSummary?.menuItems.filter((item) => item.selected && item.name.trim()).length ?? 0;
  const canApply = selectedFieldCount > 0 || selectedItemCount > 0;

  return (
    <div
      style={{
        borderRadius: 16,
        border: currentTheme.inputBorder,
        background: currentTheme.inputBg,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: currentTheme.text }}>半自動 AI 辨識</div>
          <div style={{ marginTop: 6, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
            不是直接 OCR 抓字，而是把菜單圖片送給 AI Vision 理解後，先整理成可編輯的候選結果，再由你勾選匯入。
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {recognitionSummary ? (
            <button
              type="button"
              onClick={onClearRecognition}
              disabled={recognizing}
              style={{
                minHeight: 42,
                padding: "10px 14px",
                borderRadius: 12,
                border: currentTheme.inputBorder,
                background: "transparent",
                color: currentTheme.text,
                cursor: recognizing ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              清除結果
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={recognizing}
            style={{
              minHeight: 42,
              padding: "10px 16px",
              borderRadius: 12,
              border: currentTheme.inputBorder,
              background: currentTheme.inputBg,
              color: currentTheme.text,
              cursor: recognizing ? "wait" : "pointer",
              fontWeight: 700,
            }}
          >
            {recognizing ? "AI 分析中..." : recognitionSummary ? "重新選擇圖片" : "上傳菜單圖片"}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          await onRecognizeImage(file);
          e.currentTarget.value = "";
        }}
      />

      <div style={{ marginTop: 10, color: currentTheme.subText, fontSize: 12, lineHeight: 1.7 }}>
        建議上傳正面、完整、清楚的菜單照。AI 會先整理店名、電話、地址、營業時間、分類與品項，再交給你確認。
      </div>

      {recognitionNotice ? (
        <div
          style={{
            marginTop: 10,
            borderRadius: 12,
            border: currentTheme.inputBorder,
            background: "rgba(255,255,255,0.52)",
            padding: "10px 12px",
            color: currentTheme.subText,
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {recognitionNotice}
        </div>
      ) : null}

      {recognitionSummary ? (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 140px) minmax(0, 1fr)",
              gap: 12,
              alignItems: "start",
            }}
          >
            <div
              style={{
                borderRadius: 14,
                border: currentTheme.inputBorder,
                overflow: "hidden",
                background: "rgba(255,255,255,0.74)",
              }}
            >
              <img src={recognitionSummary.previewUrl} alt="menu preview" style={{ width: "100%", display: "block", aspectRatio: "1 / 1", objectFit: "cover" }} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <strong style={{ fontSize: 14, color: currentTheme.text }}>{recognitionSummary.fileName}</strong>
                <span style={{ padding: "4px 10px", borderRadius: 999, border: currentTheme.inputBorder, color: currentTheme.text, fontSize: 12, fontWeight: 800 }}>
                  {recognitionSummary.sourceLabel}
                </span>
                <span style={{ padding: "4px 10px", borderRadius: 999, border: currentTheme.inputBorder, color: confidenceTone, fontSize: 12, fontWeight: 800 }}>
                  信心 {recognitionSummary.confidenceLabel}
                  {recognitionSummary.confidenceAverage ? ` ${recognitionSummary.confidenceAverage}%` : ""}
                </span>
                <span style={{ padding: "4px 10px", borderRadius: 999, border: currentTheme.inputBorder, color: currentTheme.subText, fontSize: 12, fontWeight: 700 }}>
                  候選菜單 {recognitionSummary.menuCount} 筆
                </span>
                <span style={{ padding: "4px 10px", borderRadius: 999, border: currentTheme.inputBorder, color: currentTheme.subText, fontSize: 12, fontWeight: 700 }}>
                  已勾選 基本資料 {selectedFieldCount} 項 / 菜單 {selectedItemCount} 筆
                </span>
              </div>

              <div style={{ marginTop: 10, color: currentTheme.subText, fontSize: 12, lineHeight: 1.7 }}>{recognitionSummary.note}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {recognitionSummary.fieldStatus.map((item) => (
              <div
                key={item.field}
                style={{
                  borderRadius: 14,
                  border: currentTheme.inputBorder,
                  background: item.selected ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.42)",
                  padding: 12,
                  opacity: item.filled ? 1 : 0.72,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: currentTheme.text }}>{item.label}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {typeof item.confidence === "number" && item.confidence > 0 ? (
                      <span style={{ fontSize: 11, fontWeight: 800, color: item.confidence >= 80 ? "#15803d" : item.confidence >= 60 ? "#a16207" : "#b91c1c" }}>
                        {item.confidence}%
                      </span>
                    ) : null}
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.status === "ready" ? "#15803d" : item.status === "review" ? "#0f172a" : "#b91c1c" }}>
                      {getStatusLabel(item.status)}
                    </span>
                  </span>
                </div>
                <label style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, color: currentTheme.subText, fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => item.filled && onToggleField(item.field)}
                    disabled={!item.filled}
                  />
                  匯入這個欄位
                </label>
                <input
                  value={item.value}
                  onChange={(e) => onUpdateField(item.field, e.target.value)}
                  placeholder={`編輯${item.label}`}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: currentTheme.inputBorder,
                    background: "rgba(255,255,255,0.78)",
                    color: currentTheme.text,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ borderRadius: 14, border: currentTheme.inputBorder, background: "rgba(255,255,255,0.45)", padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: currentTheme.text }}>菜單候選結果</div>
                <div style={{ marginTop: 4, color: currentTheme.subText, fontSize: 12, lineHeight: 1.7 }}>
                  可以先預覽、修改、刪除，再決定哪些菜單品項要匯入表單。
                </div>
              </div>
              <button
                type="button"
                onClick={onAddMenuItem}
                style={{
                  minHeight: 38,
                  padding: "8px 14px",
                  borderRadius: 12,
                  border: currentTheme.inputBorder,
                  background: "rgba(255,255,255,0.78)",
                  color: currentTheme.text,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                + 新增一筆
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {recognitionSummary.menuItems.length ? (
                recognitionSummary.menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: 12,
                      border: currentTheme.inputBorder,
                      background: item.selected ? "rgba(255,255,255,0.74)" : "rgba(255,255,255,0.5)",
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: currentTheme.subText }}>
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => onToggleMenuItem(item.id)}
                          disabled={!item.name.trim()}
                        />
                        匯入第 {index + 1} 筆
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {typeof item.confidence === "number" && item.confidence > 0 ? (
                          <span style={{ fontSize: 11, fontWeight: 800, color: item.confidence >= 80 ? "#15803d" : item.confidence >= 60 ? "#a16207" : "#b91c1c" }}>
                            {item.confidence}%
                          </span>
                        ) : null}
                        <span style={{ fontSize: 12, fontWeight: 800, color: item.status === "ready" ? "#15803d" : item.status === "review" ? "#0f172a" : "#b91c1c" }}>
                          {getStatusLabel(item.status)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteMenuItem(item.id)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#b91c1c",
                            cursor: "pointer",
                            fontWeight: 800,
                          }}
                        >
                          刪除
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1.2fr 110px", gap: 8 }}>
                      <input
                        value={item.category}
                        onChange={(e) => onUpdateMenuItem(item.id, { category: e.target.value })}
                        placeholder="分類"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: currentTheme.inputBorder, background: "rgba(255,255,255,0.78)", color: currentTheme.text, fontSize: 13, boxSizing: "border-box" }}
                      />
                      <input
                        value={item.name}
                        onChange={(e) => onUpdateMenuItem(item.id, { name: e.target.value })}
                        placeholder="菜名"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: currentTheme.inputBorder, background: "rgba(255,255,255,0.78)", color: currentTheme.text, fontSize: 13, boxSizing: "border-box" }}
                      />
                      <input
                        value={item.price}
                        onChange={(e) => onUpdateMenuItem(item.id, { price: e.target.value })}
                        placeholder="價格"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: currentTheme.inputBorder, background: "rgba(255,255,255,0.78)", color: currentTheme.text, fontSize: 13, boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>這張圖片還沒有整理出可用的菜單候選結果，你可以手動新增後再匯入。</div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={onApplySelected}
              disabled={!canApply}
              style={{
                minHeight: 42,
                padding: "10px 16px",
                borderRadius: 12,
                border: currentTheme.inputBorder,
                background: canApply ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.38)",
                color: currentTheme.text,
                cursor: canApply ? "pointer" : "not-allowed",
                fontWeight: 800,
              }}
            >
              匯入已勾選結果
            </button>
            <div style={{ color: currentTheme.subText, fontSize: 12, lineHeight: 1.7 }}>建議先確認基本資料，再檢查菜單候選筆數與分類是否正確。</div>
          </div>

          {recognitionSummary.warnings.length ? (
            <div style={{ borderRadius: 14, border: currentTheme.inputBorder, background: "rgba(255,255,255,0.48)", padding: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: currentTheme.text }}>辨識提醒</div>
              <div style={{ marginTop: 6, color: currentTheme.subText, fontSize: 12, lineHeight: 1.75 }}>
                {recognitionSummary.warnings.map((warning, index) => (
                  <div key={`${warning}-${index}`}>• {warning}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
