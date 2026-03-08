"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function getPublicBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) {
    return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  }
  return window.location.origin;
}


type ThemeType = "dark" | "light" | "warm" | "ocean" | "forest" | "rose" | "classic";

export default function DeskCardButton({
  restaurant,
  publicUrl,
  theme = "dark",
  logoDataUrl = "",
  phone = "",
  hours = "",
}: {
  restaurant: string;
  publicUrl: string;
  theme?: ThemeType;
  logoDataUrl?: string;
  phone?: string;
  hours?: string;
}) {
  const [loading, setLoading] = useState(false);

  function getThemeCardStyle(selectedTheme: ThemeType) {
    if (selectedTheme === "light") {
      return {
        bg: "#f6f6f6",
        card: "#ffffff",
        title: "#111111",
        sub: "#666666",
        accent: "#0b57d0",
        border: "#dddddd",
      };
    }

    if (selectedTheme === "warm") {
      return {
        bg: "#efe1cf",
        card: "#fffaf3",
        title: "#4a3326",
        sub: "#7b6756",
        accent: "#8b5e34",
        border: "#d9c3ae",
      };
    }

    if (selectedTheme === "ocean") {
      return {
        bg: "#dff4ff",
        card: "#ffffff",
        title: "#0f3550",
        sub: "#4d7289",
        accent: "#118ab2",
        border: "#b7dcee",
      };
    }

    if (selectedTheme === "forest") {
      return {
        bg: "#e4f0e5",
        card: "#fbfffb",
        title: "#233b2c",
        sub: "#5c7564",
        accent: "#2f6b3f",
        border: "#c4d8c8",
      };
    }

    if (selectedTheme === "rose") {
      return {
        bg: "#fdebf1",
        card: "#fffafc",
        title: "#5a3141",
        sub: "#8b6573",
        accent: "#b35c7a",
        border: "#ebc8d5",
      };
    }

    if (selectedTheme === "classic") {
      return {
        bg: "#f6f0e6",
        card: "#ffffff",
        title: "#111827",
        sub: "#6b7280",
        accent: "#b91c1c",
        border: "#ead9cf",
      };
    }

    return {
      bg: "#111111",
      card: "#1b1b1b",
      title: "#ffffff",
      sub: "#aaaaaa",
      accent: "#f4d58d",
      border: "#3a3a3a",
    };
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function downloadDeskCard() {
    try {
      setLoading(true);

      const fullUrl = `${getPublicBaseUrl()}${publicUrl}`;
      const themeStyle = getThemeCardStyle(theme);

      const qrWrapper = document.createElement("div");
      qrWrapper.style.position = "fixed";
      qrWrapper.style.left = "-99999px";
      qrWrapper.style.top = "0";
      document.body.appendChild(qrWrapper);

      const qrCanvas = document.createElement("canvas");
      qrCanvas.width = 10;
      qrCanvas.height = 10;
      qrWrapper.appendChild(qrCanvas);

      const temp = document.createElement("div");
      qrWrapper.appendChild(temp);

      const qrSize = 320;

      const renderCanvas = document.createElement("canvas");
      renderCanvas.width = 1240;
      renderCanvas.height = 1748; // 近似 A5 直式視覺桌牌
      const ctx = renderCanvas.getContext("2d");

      if (!ctx) {
        alert("無法建立桌牌圖片");
        return;
      }

      const qrRenderHost = document.createElement("div");
      qrWrapper.appendChild(qrRenderHost);

      const qrRealCanvas = document.createElement("canvas");
      qrRealCanvas.id = `desk-qr-${Date.now()}`;
      qrRenderHost.appendChild(qrRealCanvas);

      const qrSvgWrap = document.createElement("div");
      qrSvgWrap.style.position = "fixed";
      qrSvgWrap.style.left = "-99999px";
      qrSvgWrap.style.top = "0";
      document.body.appendChild(qrSvgWrap);

      const qrMount = document.createElement("div");
      qrSvgWrap.appendChild(qrMount);

      import("react-dom/client").then(async ({ createRoot }) => {
        const root = createRoot(qrMount);
        root.render(
          <QRCodeCanvas
            value={fullUrl}
            size={qrSize}
            level="H"
            includeMargin={true}
            imageSettings={
              logoDataUrl
                ? {
                    src: logoDataUrl,
                    x: undefined,
                    y: undefined,
                    height: 52,
                    width: 52,
                    excavate: true,
                  }
                : undefined
            }
          />
        );

        await new Promise((resolve) => setTimeout(resolve, 300));

        const generatedQr = qrMount.querySelector("canvas") as HTMLCanvasElement | null;

        if (!generatedQr) {
          alert("QR Code 生成失敗");
          root.unmount();
          qrSvgWrap.remove();
          qrWrapper.remove();
          return;
        }

        ctx.fillStyle = themeStyle.bg;
        ctx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

        const cardX = 70;
        const cardY = 70;
        const cardW = renderCanvas.width - 140;
        const cardH = renderCanvas.height - 140;

        ctx.fillStyle = themeStyle.card;
        roundRect(ctx, cardX, cardY, cardW, cardH, 42);
        ctx.fill();

        ctx.strokeStyle = themeStyle.border;
        ctx.lineWidth = 2;
        roundRect(ctx, cardX, cardY, cardW, cardH, 42);
        ctx.stroke();

        let y = 170;

        if (logoDataUrl) {
          try {
            const logoImg = await loadImage(logoDataUrl);
            const logoSize = 150;
            const centerX = renderCanvas.width / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.shadowColor = "rgba(0,0,0,0.12)";
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            const padding = 18;
            ctx.drawImage(
              logoImg,
              centerX - logoSize / 2 + padding,
              y + padding,
              logoSize - padding * 2,
              logoSize - padding * 2
            );
            ctx.restore();

            y += 190;
          } catch (error) {
            console.error("logo draw failed", error);
          }
        }

        ctx.textAlign = "center";

        ctx.fillStyle = themeStyle.accent;
        ctx.font = "bold 28px Arial";
        ctx.fillText("SCAN TO VIEW MENU", renderCanvas.width / 2, y);

        y += 62;

        ctx.fillStyle = themeStyle.title;
        ctx.font = "bold 66px Arial";
        ctx.fillText(restaurant || "餐廳菜單", renderCanvas.width / 2, y);

        y += 56;

        ctx.fillStyle = themeStyle.sub;
        ctx.font = "32px Arial";
        ctx.fillText("掃描 QR Code 查看最新菜單", renderCanvas.width / 2, y);

        y += 56;

        const infoLine = [phone, hours].filter(Boolean).join("  ｜  ");
        if (infoLine) {
          ctx.fillStyle = themeStyle.sub;
          ctx.font = "26px Arial";
          ctx.fillText(infoLine, renderCanvas.width / 2, y);
          y += 60;
        }

        const qrBoxSize = 430;
        const qrBoxX = renderCanvas.width / 2 - qrBoxSize / 2;

        ctx.fillStyle = "#ffffff";
        roundRect(ctx, qrBoxX - 26, y - 26, qrBoxSize + 52, qrBoxSize + 52, 28);
        ctx.fill();

        ctx.drawImage(generatedQr, qrBoxX, y, qrBoxSize, qrBoxSize);

        y += qrBoxSize + 80;

        ctx.fillStyle = themeStyle.title;
        ctx.font = "bold 34px Arial";
        ctx.fillText("MENU", renderCanvas.width / 2, y);

        y += 54;

        ctx.fillStyle = themeStyle.sub;
        ctx.font = "24px Arial";
        ctx.fillText("請使用手機相機或 LINE 掃描", renderCanvas.width / 2, y);

        y += 70;

        ctx.strokeStyle = themeStyle.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(180, y);
        ctx.lineTo(renderCanvas.width - 180, y);
        ctx.stroke();

        y += 60;

        ctx.fillStyle = themeStyle.sub;
        ctx.font = "20px Arial";
        ctx.fillText(fullUrl, renderCanvas.width / 2, y);

        const a = document.createElement("a");
        a.href = renderCanvas.toDataURL("image/png");
        a.download = `${restaurant || "menu"}-desk-card.png`;
        a.click();

        root.unmount();
        qrSvgWrap.remove();
        qrWrapper.remove();
      });
    } catch (error) {
      console.error(error);
      alert("桌牌下載失敗");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  return (
    <button
      onClick={downloadDeskCard}
      disabled={loading}
      style={{
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.06)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "產生桌牌中..." : "下載桌牌"}
    </button>
  );
}