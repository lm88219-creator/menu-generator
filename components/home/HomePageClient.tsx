"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { normalizeSlug } from "@/lib/menu";
import { getHomeTheme, getPosterThemeTokens, getThemeOptions, getThemeSurface, type ThemeType } from "@/lib/theme";
import { joinPublicUrl } from "@/lib/public-url";


export default function HomePageClient() {
  const [restaurant, setRestaurant] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [menu, setMenu] = useState("");
  const [theme, setTheme] = useState<ThemeType>("warm");
  const [isMobile, setIsMobile] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");

  const [qrText, setQrText] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPoster, setDownloadingPoster] = useState(false);

  const themeOptions = useMemo(() => getThemeOptions(), []);
  const currentTheme = getHomeTheme(theme, "warm");

  useEffect(() => {
    const apply = () => setIsMobile(window.innerWidth < 900);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  async function generateMenu() {
    if (!restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return;
    }

    if (!menu.trim()) {
      alert("請輸入菜單內容");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant,
          phone,
          address,
          hours,
          menuText: menu,
          theme,
          logoDataUrl,
          customSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.id) {
        alert(data?.error || "生成失敗");
        return;
      }

      const path = String(data.publicPath ?? data.shortUrl ?? `/m/${data.id}`);
      const url = String(data.publicUrl ?? joinPublicUrl(path));
      setQrText(url);
    } catch (error) {
      console.error(error);
      alert("生成失敗");
    } finally {
      setCreating(false);
    }
  }

  function fillExample() {
    setRestaurant("友愛熱炒");
    setPhone("0912-345-678");
    setAddress("嘉義市西區友愛路100號");
    setHours("17:00 - 01:00");
    setTheme("warm");
    setCustomSlug("");
    setMenu(`鵝肉
鹽水鵝肉 200
麻油鵝肉 220

主食
炒飯 80
炒麵 80

熱炒
炒蝦球 200
炒螺肉 120
燙青菜 50`);
  }

  function clearAll() {
    setRestaurant("");
    setPhone("");
    setAddress("");
    setHours("");
    setMenu("");
    setTheme("warm");
    setLogoDataUrl("");
    setCustomSlug("");
    setQrText("");
    setCopied(false);
  }

  async function copyUrl() {
    if (!qrText) return;
    await navigator.clipboard.writeText(qrText);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function downloadQR() {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement | null;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${restaurant || "menu"}-qrcode.png`;
    a.click();
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("請上傳圖片檔");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setLogoDataUrl(result);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoDataUrl("");
  }

  function openLineShare() {
    if (!qrText) return;
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      qrText
    )}`;
    window.open(shareUrl, "_blank");
  }

  function openFacebookShare() {
    if (!qrText) return;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      qrText
    )}`;
    window.open(shareUrl, "_blank");
  }

  function parseMenuLines(raw: string) {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function isLikelyCategory(line: string) {
    const parts = line.split(/\s+/);
    return parts.length === 1;
  }

  function getThemePosterColors(selectedTheme: ThemeType) {
    return getPosterThemeTokens(selectedTheme);
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function downloadPoster() {
    if (!qrText) {
      alert("請先生成菜單");
      return;
    }

    setDownloadingPoster(true);

    try {
      const qrCanvas = document.getElementById("qr-code") as HTMLCanvasElement | null;
      if (!qrCanvas) {
        alert("找不到 QR Code");
        return;
      }

      const lines = parseMenuLines(menu);
      const posterTheme = getThemePosterColors(theme);
      const contentWidth = 1080;
      const padding = 72;
      const rowHeight = 52;
      const extraInfoCount = [phone, address, hours].filter(Boolean).length;
      const calculatedHeight =
        420 +
        Math.max(lines.length, 6) * rowHeight +
        extraInfoCount * 32 +
        (logoDataUrl ? 140 : 0) +
        220;

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

// 白色圓形底
ctx.save();
ctx.beginPath();
ctx.arc(canvas.width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
ctx.closePath();
ctx.fillStyle = "#ffffff";
ctx.fill();

// 外框
ctx.strokeStyle = "rgba(0,0,0,0.08)";
ctx.lineWidth = 2;
ctx.stroke();

// 陰影感
ctx.shadowColor = "rgba(0,0,0,0.12)";
ctx.shadowBlur = 18;
ctx.shadowOffsetY = 6;
ctx.restore();

// 裁成圓形後再畫 logo
ctx.save();
ctx.beginPath();
ctx.arc(canvas.width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();

const innerPadding = 14;
ctx.drawImage(
  logoImg,
  logoX + innerPadding,
  logoY + innerPadding,
  logoSize - innerPadding * 2,
  logoSize - innerPadding * 2
);

ctx.restore();

y += 150;
        } catch (error) {
          console.error("logo draw error", error);
        }
      }

      ctx.fillStyle = posterTheme.muted;
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.fillText("DIGITAL MENU", canvas.width / 2, y);

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

      let currentCategory = "";

      for (const line of lines) {
        if (isLikelyCategory(line)) {
          currentCategory = line;
          ctx.fillStyle = posterTheme.accent;
          ctx.font = "bold 28px Arial";
          ctx.fillText(currentCategory, padding, y);
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
    } catch (error) {
      console.error(error);
      alert("下載整張菜單圖失敗");
    } finally {
      setDownloadingPoster(false);
    }
  }

  const inputStyle: React.CSSProperties = {
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

  const ghostButtonStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 12,
    border: currentTheme.inputBorder,
    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
    color: currentTheme.buttonGhostText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  };

  const mainButtonStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    background: theme === "warm" ? "linear-gradient(180deg, #8b5e34, #6f4623)" : theme === "classic" ? "linear-gradient(180deg, #b91c1c, #991b1b)" : "linear-gradient(180deg, #2563eb, #1d4ed8)",
    color: currentTheme.buttonMainText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  };

  const accentMap = Object.fromEntries(themeOptions.map((option) => [option.value, option.accent])) as Record<ThemeType, string>;

  const themeSurfaceMap = Object.fromEntries(themeOptions.map((option) => [option.value, getThemeSurface(option.value)])) as Record<ThemeType, { bg: string; text: string; muted: string; border: string }>;

  const themeCardStyle = (value: ThemeType): React.CSSProperties => ({
    borderRadius: 18,
    padding: 16,
    border: theme === value ? `1px solid ${themeSurfaceMap[value].border}` : "1px solid rgba(0,0,0,0.06)",
    background: themeSurfaceMap[value].bg,
    color: themeSurfaceMap[value].text,
    cursor: "pointer",
    minHeight: 104,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    boxShadow: theme === value ? "0 10px 24px rgba(0,0,0,0.08)" : "none",
  });

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.12fr 0.88fr",
            gap: 18,
            alignItems: "start",
          }}
        >
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
                background:
                  theme === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
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

            <div style={{ marginTop: 18 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>餐廳名稱</div>
              <input
  value={restaurant}
  onChange={(e) => {
    const name = e.target.value;
    setRestaurant(name);

    if (!customSlug) {
      const slug = normalizeSlug(name);
      setCustomSlug(slug);
    }
  }}
                style={inputStyle}
                placeholder="例如：友愛熱炒"
              />
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <div style={{ marginBottom: 8, fontWeight: 700 }}>電話</div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  placeholder="例如：0912-345-678"
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 700 }}>營業時間</div>
                <input
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  style={inputStyle}
                  placeholder="例如：17:00 - 01:00"
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>地址</div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
                placeholder="例如：嘉義市西區友愛路100號"
              />
            </div>


            <div style={{ marginTop: 14 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>自訂網址代稱</div>
              <input
  value={customSlug}
  onChange={(e) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    setCustomSlug(value);
  }}
  style={inputStyle}
  placeholder="例如：FOOD-168"
/>
{customSlug && (
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
    https://你的網站/uu/menu/{customSlug}
  </div>
)}
              <div style={{ marginTop: 8, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
                可選填、若不填，系統會自動將餐廳名稱轉為英文網址(無法輸入中文)
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ marginBottom: 10, fontWeight: 700 }}>餐廳 Logo</div>
              <div
                style={{
                  borderRadius: 16,
                  border: currentTheme.inputBorder,
                  background: currentTheme.inputBg,
                  padding: 14,
                }}
              >
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 44,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: currentTheme.inputBorder,
                    background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                  />
                  上傳 Logo
                </label>
                {logoDataUrl ? (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
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
                      <img
                        src={logoDataUrl}
                        alt="logo preview"
                        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block" }}
                      />
                    </div>
                    <button onClick={removeLogo} style={ghostButtonStyle}>移除 Logo</button>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: currentTheme.subText }}>
                    PNG / JPG，建議使用方形圖片
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ marginBottom: 10, fontWeight: 700 }}>菜單風格</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {themeOptions.map(({ value, label: title, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    style={themeCardStyle(value)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 6, height: 30, borderRadius: 999, background: accentMap[value], display: "inline-block" }} />
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
                      </div>
                      {theme === value ? <span style={{ fontSize: 12, color: themeSurfaceMap[value].muted, fontWeight: 700 }}>已選</span> : null}
                    </div>
                    <div style={{ fontSize: 13, color: themeSurfaceMap[value].muted, marginTop: 10, textAlign: "left" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>菜單內容</div>

              <textarea
                rows={12}
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, minHeight: 220 }}
                placeholder={`例如：
鵝肉
鹽水鵝肉 200
麻油鵝肉 220

主食
炒飯 80
炒麵 80`}
              />
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button onClick={generateMenu} style={mainButtonStyle}>
                {creating ? "生成中..." : "生成 QR 菜單"}
              </button>

              <button onClick={fillExample} style={ghostButtonStyle}>
                填入範例菜單
              </button>

              <button onClick={clearAll} style={ghostButtonStyle}>
                清空
              </button>
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              padding: 18,
              border: currentTheme.cardBorder,
              background: currentTheme.cardBg,
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              position: isMobile ? "static" : "sticky",
              top: 20,
              height: "fit-content",
            }}
          >
            <div
              style={{
                borderRadius: 24,
                padding: 24,
                background:
                  theme === "dark"
                    ? "radial-gradient(circle at top,#1b1b1b 0%,#080808 70%)"
                    : theme === "light"
                    ? "linear-gradient(180deg,#ffffff 0%,#f3f3f3 100%)"
                    : theme === "classic"
                    ? "radial-gradient(circle at top,#ffffff 0%,#fbf7f1 55%,#f6f0e6 100%)"
                    : "linear-gradient(180deg,#fffaf3 0%,#f1e0cb 100%)",
                border:
                  theme === "dark"
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(0,0,0,0.08)",
                color: theme === "dark" ? "#fff" : theme === "light" ? "#111" : theme === "warm" ? "#4e3426" : theme === "ocean" ? "#0f3550" : theme === "forest" ? "#233b2c" : theme === "classic" ? "#111827" : "#5a3141",
                minHeight: isMobile ? "auto" : 520,
                maxWidth: 390,
                margin: "0 auto",
              }}
            >
              <div style={{ textAlign: "center" }}>
                {logoDataUrl ? (
                  <div
  style={{
    width: 92,
    height: 92,
    borderRadius: "50%",
    margin: "0 auto 14px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
    border: "1px solid rgba(0,0,0,0.06)",
    overflow: "hidden",
    padding: 10,
  }}
>
  <img
    src={logoDataUrl}
    alt="logo preview"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
    }}
  />
</div>
                ) : (
                  <div
  style={{
    width: 92,
    height: 92,
    borderRadius: "50%",
    margin: "0 auto 14px",
    background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: theme === "dark" ? "#aaa" : "#666",
    border: theme === "dark"
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.06)",
  }}
>
  LOGO
</div>
                )}

                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 3,
                    opacity: 0.7,
                    marginBottom: 8,
                  }}
                >
                  DIGITAL MENU
                </div>

                <h2 style={{ margin: 0, fontSize: 28 }}>
                  {restaurant || "餐廳名稱"}
                </h2>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    opacity: 0.8,
                    lineHeight: 1.8,
                  }}
                >
                  {phone || "電話"}<br />
                  {address || "地址"}<br />
                  {hours || "營業時間"}
                </div>
              </div>

              <div
                style={{
                  marginTop: 22,
                  borderTop:
                    theme === "dark"
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid rgba(0,0,0,0.08)",
                  paddingTop: 16,
                }}
              >
                {parseMenuLines(menu || "熱炒\n炒飯 80\n炒麵 80").map((line, index) =>
                  isLikelyCategory(line) ? (
                    <div
                      key={`${line}-${index}`}
                      style={{
                        marginTop: index === 0 ? 0 : 14,
                        marginBottom: 6,
                        fontWeight: 700,
                        color:
                          theme === "dark"
                            ? "#f4d58d"
                            : theme === "light"
                            ? "#0b57d0"
                            : theme === "classic"
                            ? "#b91c1c"
                            : "#8b5e34",
                      }}
                    >
                      {line}
                    </div>
                  ) : (
                    <div
                      key={`${line}-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "8px 0",
                        borderBottom:
                          theme === "dark"
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "1px solid rgba(0,0,0,0.06)",
                        fontSize: 15,
                      }}
                    >
                      <span>{line.replace(/\s+\S+$/, "")}</span>
                      <span>{line.match(/\S+$/)?.[0]}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div style={{ marginTop: 18, color: currentTheme.subText, fontSize: 14 }}>
              目前風格：{currentTheme.name}
            </div>
          </div>
        </div>

        {qrText && (
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr",
                gap: 24,
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    padding: 26,
                    borderRadius: 26,
                    boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
                  }}
                >
                  <QRCodeCanvas
                    id="qr-code"
                    value={qrText}
                    size={240}
                    level="H"
                    includeMargin={true}
                    imageSettings={
                      logoDataUrl
                        ? {
                            src: logoDataUrl,
                            x: undefined,
                            y: undefined,
                            height: 42,
                            width: 42,
                            excavate: true,
                          }
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
                    background:
                      theme === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    color: currentTheme.subText,
                    fontSize: 13,
                  }}
                >
                  你的公開菜單已建立完成
                </div>

                <h2 style={{ marginTop: 14, marginBottom: 10, fontSize: 30 }}>
                  菜單公開網址
                </h2>

                <a
                  href={qrText}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: currentTheme.accent,
                    wordBreak: "break-all",
                    fontSize: 16,
                    lineHeight: 1.7,
                  }}
                >
                  {qrText}
                </a>

                <div
                  style={{
                    marginTop: 18,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button onClick={copyUrl} style={mainButtonStyle}>
                    {copied ? "已複製網址" : "複製網址"}
                  </button>

                  <button onClick={downloadQR} style={ghostButtonStyle}>
                    下載 QR Code
                  </button>

                  <button onClick={downloadPoster} style={ghostButtonStyle}>
                    {downloadingPoster ? "下載中..." : "下載整張菜單圖"}
                  </button>

                  <button onClick={openLineShare} style={ghostButtonStyle}>
                    分享 LINE
                  </button>

                  <button onClick={openFacebookShare} style={ghostButtonStyle}>
                    分享 FB
                  </button>
                  <a
                    href="/uu/dashboard"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px 18px",
                      borderRadius: 14,
                      background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
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
        )}
      </div>
    </main>
  );
}

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

function wrapCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split("");
  let line = "";
  let y = startY;

  for (let i = 0; i < words.length; i++) {
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

  if (line) {
    ctx.fillText(line, centerX, y);
  }
}

function getWrappedTextHeight(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number
) {
  const chars = text.split("");
  let line = "";
  let lines = 1;

  for (let i = 0; i < chars.length; i++) {
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