import { useMemo, useRef } from "react";

type RecognitionFieldStatus = {
  field: string;
  label: string;
  value: string;
  filled: boolean;
  selected: boolean;
  applied: boolean;
  confidence?: number;
};

type RecognitionSummary = {
  fileName: string;
  previewUrl: string;
  menuCount: number;
  confidenceAverage: number;
  confidenceLabel: string;
  warnings: string[];
  fieldStatus: RecognitionFieldStatus[];
};

type Props = {
  currentTheme: {
    inputBg: string;
    inputBorder: string;
    subText: string;
    text: string;
  };
  recognizing: boolean;
  recognitionNotice: string;
  recognitionSummary: RecognitionSummary | null;
  onRecognizeImage: (file: File | null | undefined) => Promise<void>;
  onClearRecognition: () => void;
  onToggleField: (field: string) => void;
  onApplySelected: () => void;
};

export function MenuImageUpload({
  currentTheme,
  recognizing,
  recognitionNotice,
  recognitionSummary,
  onRecognizeImage,
  onClearRecognition,
  onToggleField,
  onApplySelected,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const confidenceTone = useMemo(() => {
    if (!recognitionSummary?.confidenceAverage) return currentTheme.subText;
    if (recognitionSummary.confidenceAverage >= 82) return "#15803d";
    if (recognitionSummary.confidenceAverage >= 60) return "#a16207";
    return "#b91c1c";
  }, [currentTheme.subText, recognitionSummary]);

  const selectedCount = recognitionSummary?.fieldStatus.filter((item) => item.selected && item.filled).length ?? 0;
  const appliedCount = recognitionSummary?.fieldStatus.filter((item) => item.applied && item.filled).length ?? 0;

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
          <div style={{ fontWeight: 800, fontSize: 14, color: currentTheme.text }}>上傳菜單圖片自動辨識</div>
          <div style={{ marginTop: 6, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
            會先做圖片清晰化、多區塊切圖辨識，再整理店名、電話、地址、營業時間與菜單草稿。辨識完可先勾選要套用的欄位。
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {recognitionSummary ? (
            <button
              type="button"
              onClick={onClearRecognition}
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
              disabled={recognizing}
            >
              清除摘要
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
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
            disabled={recognizing}
          >
            {recognizing ? "辨識中..." : recognitionSummary ? "重新選擇圖片" : "選擇圖片"}
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
        建議使用字體清楚、正面拍攝、反光少的圖片。現在會額外切分區塊辨識，雙欄菜單也比較容易抓到。
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
        <div
          style={{
            marginTop: 14,
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
              <span style={{ padding: "4px 10px", borderRadius: 999, border: currentTheme.inputBorder, color: confidenceTone, fontSize: 12, fontWeight: 800 }}>
                辨識信心 {recognitionSummary.confidenceLabel}
                {recognitionSummary.confidenceAverage ? ` ${recognitionSummary.confidenceAverage}%` : ""}
              </span>
              <span style={{ padding: "4px 10px", borderRadius: 999, border: currentTheme.inputBorder, color: currentTheme.subText, fontSize: 12, fontWeight: 700 }}>
                抓到 {recognitionSummary.menuCount} 筆菜單
              </span>
              <span style={{ padding: "4px 10px", borderRadius: 999, border: currentTheme.inputBorder, color: currentTheme.subText, fontSize: 12, fontWeight: 700 }}>
                已選 {selectedCount} 欄 / 已套用 {appliedCount} 欄
              </span>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
              {recognitionSummary.fieldStatus.map((item) => (
                <label
                  key={item.field}
                  style={{
                    borderRadius: 14,
                    border: currentTheme.inputBorder,
                    background: item.selected ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.42)",
                    padding: 12,
                    display: "block",
                    cursor: item.filled ? "pointer" : "default",
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
                      <span style={{ fontSize: 12, fontWeight: 800, color: item.applied ? "#15803d" : item.filled ? "#0f172a" : "#b91c1c" }}>
                        {item.applied ? "已套用" : item.filled ? "待確認" : "未抓到"}
                      </span>
                    </span>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => item.filled && onToggleField(item.field)}
                      disabled={!item.filled}
                      style={{ marginTop: 2 }}
                    />
                    <div style={{ color: currentTheme.subText, fontSize: 12, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {item.value || "尚未辨識到內容"}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={onApplySelected}
                disabled={!selectedCount}
                style={{
                  minHeight: 42,
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: currentTheme.inputBorder,
                  background: selectedCount ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.38)",
                  color: currentTheme.text,
                  cursor: selectedCount ? "pointer" : "not-allowed",
                  fontWeight: 800,
                }}
              >
                套用已勾選欄位
              </button>
              <div style={{ color: currentTheme.subText, fontSize: 12, lineHeight: 1.7, alignSelf: "center" }}>
                建議先勾餐廳資訊，再確認菜單草稿是否完整，最後再套用到表單。
              </div>
            </div>

            {recognitionSummary.warnings.length ? (
              <div style={{ marginTop: 12, borderRadius: 14, border: currentTheme.inputBorder, background: "rgba(255,255,255,0.48)", padding: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: currentTheme.text }}>辨識提醒</div>
                <div style={{ marginTop: 6, color: currentTheme.subText, fontSize: 12, lineHeight: 1.75 }}>
                  {recognitionSummary.warnings.map((item, index) => (
                    <div key={`${item}-${index}`}>• {item}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
