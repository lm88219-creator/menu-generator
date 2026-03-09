import type { CSSProperties } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ROUTES } from "@/lib/routes";
import { downloadPosterImage } from "./poster-utils";
import type { HomeFormState } from "./home-utils";

export function HomeResultCard({
  form,
  qrText,
  copied,
  downloadingPoster,
  setDownloadingPoster,
  currentTheme,
  isMobile,
  mainButtonStyle,
  ghostButtonStyle,
  onCopyUrl,
}: {
  form: HomeFormState;
  qrText: string;
  copied: boolean;
  downloadingPoster: boolean;
  setDownloadingPoster: (value: boolean) => void;
  currentTheme: { cardBorder: string; cardBg: string; subText: string; accent: string; buttonGhostText: string; inputBorder: string };
  isMobile: boolean;
  mainButtonStyle: CSSProperties;
  ghostButtonStyle: CSSProperties;
  onCopyUrl: () => Promise<void>;
}) {
  if (!qrText) return null;

  function downloadQR() {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.restaurant || "menu"}-qrcode.png`;
    a.click();
  }

  async function downloadPoster() {
    if (!qrText) {
      alert("請先生成菜單");
      return;
    }
    setDownloadingPoster(true);
    try {
      await downloadPosterImage(form, qrText);
    } catch (error) {
      console.error(error);
      alert("下載整張菜單圖失敗");
    } finally {
      setDownloadingPoster(false);
    }
  }

  function openShare(url: string) {
    window.open(url, "_blank");
  }

  return (
    <div
      style={{
        marginTop: 26,
        borderRadius: 24,
        padding: 24,
        border: currentTheme.cardBorder,
        background: currentTheme.cardBg,
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr", gap: 24, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "#fff", padding: 26, borderRadius: 26, boxShadow: "0 14px 28px rgba(0,0,0,0.12)" }}>
            <QRCodeCanvas
              id="qr-code"
              value={qrText}
              size={240}
              level="H"
              includeMargin
              imageSettings={
                form.logoDataUrl
                  ? { src: form.logoDataUrl, x: undefined, y: undefined, height: 42, width: 42, excavate: true }
                  : undefined
              }
            />
          </div>
        </div>

        <div>
          <div
            style={{
              display: "inline-flex",
              padding: "8px 12px",
              borderRadius: 999,
              background: form.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              color: currentTheme.subText,
              fontSize: 13,
            }}
          >
            你的公開菜單已建立完成
          </div>

          <h2 style={{ marginTop: 14, marginBottom: 10, fontSize: 30 }}>菜單公開網址</h2>
          <a href={qrText} target="_blank" rel="noreferrer" style={{ color: currentTheme.accent, wordBreak: "break-all", fontSize: 16, lineHeight: 1.7 }}>
            {qrText}
          </a>

          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={onCopyUrl} style={mainButtonStyle}>{copied ? "已複製網址" : "複製網址"}</button>
            <button onClick={downloadQR} style={ghostButtonStyle}>下載 QR Code</button>
            <button onClick={downloadPoster} style={ghostButtonStyle}>{downloadingPoster ? "下載中..." : "下載整張菜單圖"}</button>
            <button onClick={() => openShare(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(qrText)}`)} style={ghostButtonStyle}>分享 LINE</button>
            <button onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(qrText)}`)} style={ghostButtonStyle}>分享 FB</button>
            <a
              href={ROUTES.dashboard}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 18px",
                borderRadius: 14,
                background: form.theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
                color: currentTheme.buttonGhostText,
                textDecoration: "none",
                fontWeight: 700,
                border: currentTheme.inputBorder,
              }}
            >
              返回後台
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
