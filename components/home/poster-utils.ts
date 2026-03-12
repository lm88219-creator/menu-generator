import { getPosterThemeTokens, type ThemeType } from "@/lib/theme";
import { isLikelyCategory, parseMenuLines, type HomeFormState } from "./home-utils";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapCenterText(ctx: CanvasRenderingContext2D, text: string, centerX: number, startY: number, maxWidth: number, lineHeight: number) {
  const words = text.split("");
  let line = "";
  let y = startY;

  for (let i = 0; i < words.length; i += 1) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, centerX, y);
      line = words[i];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) ctx.fillText(line, centerX, y);
}

function getWrappedTextHeight(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number) {
  const chars = text.split("");
  let line = "";
  let lines = 1;

  for (let i = 0; i < chars.length; i += 1) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      line = chars[i];
      lines += 1;
    } else {
      line = testLine;
    }
  }

  return lines * lineHeight;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function downloadPosterImage(form: HomeFormState, qrText: string) {
  const qrCanvas = document.getElementById("qr-code") as HTMLCanvasElement | null;
  if (!qrCanvas) {
    alert("找不到 QR Code");
    return;
  }

  const { restaurant, phone, address, hours, menu, theme, logoDataUrl } = form;
  const lines = parseMenuLines(menu);
  const posterTheme = getPosterThemeTokens(theme as ThemeType);
  const contentWidth = 1080;
  const padding = 72;
  const rowHeight = 52;
  const extraInfoCount = [phone, address, hours].filter(Boolean).length;
  const calculatedHeight = 420 + Math.max(lines.length, 6) * rowHeight + extraInfoCount * 32 + (logoDataUrl ? 140 : 0) + 220;

  const canvas = document.createElement("canvas");
  canvas.width = contentWidth;
  canvas.height = Math.max(calculatedHeight, 1500);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    alert("無法建立圖片");
    return;
  }

  ctx.fillStyle = posterTheme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cardX = 48;
  const cardY = 48;
  const cardW = canvas.width - 96;
  const cardH = canvas.height - 96;

  ctx.fillStyle = posterTheme.card;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28, true, false);

  let y = 110;

  if (logoDataUrl) {
    try {
      const logoImg = await loadImage(logoDataUrl);
      const logoSize = 120;
      const logoX = canvas.width / 2 - logoSize / 2;
      const logoY = y;

      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowColor = "rgba(0,0,0,0.12)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const innerPadding = 14;
      ctx.drawImage(logoImg, logoX + innerPadding, logoY + innerPadding, logoSize - innerPadding * 2, logoSize - innerPadding * 2);
      ctx.restore();
      y += 150;
    } catch (error) {
      console.error("logo draw error", error);
    }
  }

  ctx.fillStyle = posterTheme.muted;
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText("MENU", canvas.width / 2, y);
  y += 52;

  ctx.fillStyle = posterTheme.title;
  ctx.font = "bold 54px Arial";
  ctx.fillText(restaurant || "餐廳菜單", canvas.width / 2, y);
  y += 48;

  ctx.fillStyle = posterTheme.text;
  ctx.font = "28px Arial";

  if (phone) {
    ctx.fillText(`電話｜${phone}`, canvas.width / 2, y);
    y += 38;
  }
  if (address) {
    wrapCenterText(ctx, `地址｜${address}`, canvas.width / 2, y, 780, 34);
    y += getWrappedTextHeight(ctx, `地址｜${address}`, 780, 34);
  }
  if (hours) {
    ctx.fillText(`營業時間｜${hours}`, canvas.width / 2, y);
    y += 38;
  }

  y += 28;
  ctx.strokeStyle = posterTheme.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(canvas.width - padding, y);
  ctx.stroke();

  y += 54;
  ctx.textAlign = "left";

  for (const line of lines) {
    if (isLikelyCategory(line)) {
      ctx.fillStyle = posterTheme.accent;
      ctx.font = "bold 28px Arial";
      ctx.fillText(line, padding, y);
      y += 42;
      continue;
    }

    const parts = line.split(/\s+/);
    const price = parts.pop() ?? "";
    const name = parts.join(" ");

    ctx.fillStyle = posterTheme.text;
    ctx.font = "26px Arial";
    ctx.fillText(name, padding, y);

    ctx.fillStyle = posterTheme.muted;
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(price ? `$${price}` : "", canvas.width - padding, y);

    ctx.strokeStyle = posterTheme.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y + 18);
    ctx.lineTo(canvas.width - padding, y + 18);
    ctx.stroke();

    ctx.textAlign = "left";
    y += 48;
  }

  y += 24;
  const qrSize = 220;
  const qrX = canvas.width / 2 - qrSize / 2;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrX - 18, y - 18, qrSize + 36, qrSize + 36, 24, true, false);
  ctx.drawImage(qrCanvas, qrX, y, qrSize, qrSize);
  y += qrSize + 52;

  ctx.fillStyle = posterTheme.muted;
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  wrapCenterText(ctx, qrText, canvas.width / 2, y, 820, 30);

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${restaurant || "menu"}-poster.png`;
  a.click();
}
