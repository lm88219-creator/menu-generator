import { useRef } from "react";

type Props = {
  currentTheme: {
    inputBg: string;
    inputBorder: string;
    subText: string;
    text: string;
  };
  recognizing: boolean;
  recognitionNotice: string;
  onRecognizeImage: (file: File | null | undefined) => Promise<void>;
};

export function MenuImageUpload({ currentTheme, recognizing, recognitionNotice, onRecognizeImage }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

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
            可先上傳菜單照片或截圖，系統會先辨識文字，再自動填入店名、電話、地址、營業時間與菜單內容草稿。
          </div>
        </div>
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
          {recognizing ? "辨識中..." : "選擇圖片"}
        </button>
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
        建議使用字體清楚、正面拍攝的圖片。辨識結果會先填入草稿，你仍可再手動修正。
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
    </div>
  );
}
