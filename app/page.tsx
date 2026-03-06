"use client";

import { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type ThemeType = "dark" | "light" | "warm";

export default function Home() {
  const [restaurant, setRestaurant] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [menu, setMenu] = useState("");
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [logoDataUrl, setLogoDataUrl] = useState("");

  const [qrText, setQrText] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPoster, setDownloadingPoster] = useState(false);

  const themeMap = useMemo(
    () => ({
      dark: {
        name: "黑色餐廳風",
        pageBg: "radial-gradient(circle at top,#1a1a1a 0%,#000 45%,#000 100%)",
        cardBg: "rgba(255,255,255,0.04)",
        cardBorder: "1px solid rgba(255,255,255,0.08)",
        text: "#fff",
        subText: "#a9a9a9",
        accent: "#f4d58d",
        inputBg: "rgba(255,255,255,0.05)",
        inputBorder: "1px solid rgba(255,255,255,0.08)",
        buttonMainBg: "#fff",
        buttonMainText: "#000",
        buttonGhostBg: "rgba(255,255,255,0.08)",
        buttonGhostText: "#fff",
      },
      light: {
        name: "簡約白色",
        pageBg: "linear-gradient(180deg,#f8f8f8 0%,#eeeeee 100%)",
        cardBg: "rgba(255,255,255,0.9)",
        cardBorder: "1px solid rgba(0,0,0,0.08)",
        text: "#111",
        subText: "#666",
        accent: "#0b57d0",
        inputBg: "#fff",
        inputBorder: "1px solid rgba(0,0,0,0.08)",
        buttonMainBg: "#111",
        buttonMainText: "#fff",
        buttonGhostBg: "#fff",
        buttonGhostText: "#111",
      },
      warm: {
        name: "溫暖咖啡風",
        pageBg: "linear-gradient(180deg,#f6efe5 0%,#eadbc8 100%)",
        cardBg: "rgba(255,250,244,0.9)",
        cardBorder: "1px solid rgba(88,54,24,0.12)",
        text: "#3e2d20",
        subText: "#7b6756",
        accent: "#8b5e34",
        inputBg: "rgba(255,255,255,0.78)",
        inputBorder: "1px solid rgba(88,54,24,0.12)",
        buttonMainBg: "#4e3426",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.65)",
        buttonGhostText: "#3e2d20",
      },
    }),
    []
  );

  const currentTheme = themeMap[theme];

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
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.id) {
        alert(data?.error || "生成失敗");
        return;
      }

      const url = `${window.location.origin}/m/${data.id}`;
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
    setTheme("dark");
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
    setTheme("dark");
    setLogoDataUrl("");
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
    if (selectedTheme === "light") {
      return {
        bg: "#f5f5f5",
        card: "#ffffff",
        title: "#111111",
        text: "#222222",
        muted: "#666666",
        line: "#d9d9d9",
        accent: "#0b57d0",
      };
    }

    if (selectedTheme === "warm") {
      return {
        bg: "#efe1cf",
        card: "#fffaf3",
        title: "#4a3326",
        text: "#4a3326",
        muted: "#7b6756",
        line: "#d9c3ae",
        accent: "#8b5e34",
      };
    }

    return {
      bg: "#111111",
      card: "#1b1b1b",
      title: "#ffffff",
      text: "#f3f3f3",
      muted: "#aaaaaa",
      line: "#3a3a3a",
      accent: "#f4d58d",
    };
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
    padding: "14px 16px",
    borderRadius: 14,
    border: currentTheme.inputBorder,
    background: currentTheme.inputBg,
    color: currentTheme.text,
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  };

  const ghostButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    borderRadius: 14,
    border: currentTheme.inputBorder,
    background: currentTheme.buttonGhostBg,
    color: currentTheme.buttonGhostText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  };

  const mainButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    borderRadius: 14,
    border: "none",
    background: currentTheme.buttonMainBg,
    color: currentTheme.buttonMainText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  };

  const themeCardStyle = (value: ThemeType): React.CSSProperties => ({
    borderRadius: 18,
    padding: 16,
    border:
      theme === value
        ? `2px solid ${currentTheme.accent}`
        : currentTheme.inputBorder,
    background:
      value === "dark"
        ? "linear-gradient(180deg,#202020 0%,#090909 100%)"
        : value === "light"
        ? "linear-gradient(180deg,#ffffff 0%,#f0f0f0 100%)"
        : "linear-gradient(180deg,#f8efe3 0%,#e7d2b8 100%)",
    color: value === "dark" ? "#fff" : value === "light" ? "#111" : "#4e3426",
    cursor: "pointer",
    minHeight: 108,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 24,
          }}
        >
          <div
            style={{
              borderRadius: 30,
              padding: 32,
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
              }}
            >
              商業級 QR 菜單生成器
            </div>

            <h1 style={{ fontSize: 42, margin: "16px 0 0" }}>30 秒生成餐廳數位菜單</h1>

            <p
              style={{
                marginTop: 10,
                color: currentTheme.subText,
                fontSize: 16,
                lineHeight: 1.8,
              }}
            >
              輸入餐廳資訊、上傳 Logo、選擇風格，立即產生可公開分享的菜單網址與 QR Code。
            </p>

            <div style={{ marginTop: 28 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>餐廳名稱</div>
              <input
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                style={inputStyle}
                placeholder="例如：友愛熱炒"
              />
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
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

            <div style={{ marginTop: 18 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>地址</div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
                placeholder="例如：嘉義市西區友愛路100號"
              />
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ marginBottom: 10, fontWeight: 700 }}>餐廳 Logo</div>

              <div
                style={{
                  borderRadius: 18,
                  border: currentTheme.inputBorder,
                  background: currentTheme.inputBg,
                  padding: 16,
                }}
              >
                <label
  style={{
    display: "block",
    borderRadius: 16,
    border: "2px dashed rgba(0,0,0,0.15)",
    padding: "24px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(255,255,255,0.5)",
  }}
>
  <input
    type="file"
    accept="image/*"
    onChange={handleLogoUpload}
    style={{ display: "none" }}
  />

  {logoDataUrl ? (
    <div
  style={{
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: "#fff",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    border: "1px solid rgba(0,0,0,0.06)",
    overflow: "hidden",
    padding: 10,
  }}
>
  <img
    src={logoDataUrl}
    alt="logo"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
      objectPosition: "center",
      display: "block",
    }}
  />
</div>
  ) : (
    <div>
      <div style={{ fontWeight: 600 }}>點擊上傳餐廳 Logo</div>
      <div style={{ fontSize: 12, opacity: 0.6 }}>
        PNG / JPG 建議方形圖片
      </div>
    </div>
  )}
</label>

                {logoDataUrl && (
                  <div
                    style={{
                      marginTop: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
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
      objectPosition: "center",
      display: "block",
    }}
  />
</div>

                    <button onClick={removeLogo} style={ghostButtonStyle}>
                      移除 Logo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ marginBottom: 10, fontWeight: 700 }}>菜單風格</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <div onClick={() => setTheme("dark")} style={themeCardStyle("dark")}>
                  <div style={{ fontWeight: 700 }}>黑色餐廳風</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>質感、夜店、燈箱感</div>
                </div>

                <div onClick={() => setTheme("light")} style={themeCardStyle("light")}>
                  <div style={{ fontWeight: 700 }}>簡約白色</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>乾淨、清楚、百搭</div>
                </div>

                <div onClick={() => setTheme("warm")} style={themeCardStyle("warm")}>
                  <div style={{ fontWeight: 700 }}>溫暖咖啡風</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>木質、餐館、溫暖感</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>菜單內容</div>

              <textarea
                rows={12}
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
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
                marginTop: 24,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button onClick={generateMenu} style={mainButtonStyle}>
                {creating ? "生成中..." : "生成 QR 菜單"}
              </button>

              <button onClick={fillExample} style={ghostButtonStyle}>
                填入範例
              </button>

              <button onClick={clearAll} style={ghostButtonStyle}>
                清空
              </button>
            </div>
          </div>

          <div
            style={{
              borderRadius: 30,
              padding: 28,
              border: currentTheme.cardBorder,
              background: currentTheme.cardBg,
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              position: "sticky",
              top: 20,
              height: "fit-content",
            }}
          >
            <div style={{ fontSize: 14, color: currentTheme.subText, marginBottom: 8 }}>
              即時預覽
            </div>

            <div
              style={{
                borderRadius: 24,
                padding: 24,
                background:
                  theme === "dark"
                    ? "radial-gradient(circle at top,#1b1b1b 0%,#080808 70%)"
                    : theme === "light"
                    ? "linear-gradient(180deg,#ffffff 0%,#f3f3f3 100%)"
                    : "linear-gradient(180deg,#fffaf3 0%,#f1e0cb 100%)",
                border:
                  theme === "dark"
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(0,0,0,0.08)",
                color: theme === "dark" ? "#fff" : theme === "light" ? "#111" : "#4e3426",
                minHeight: 580,
              }}
            >
              <div style={{ textAlign: "center" }}>
                {logoDataUrl ? (
                  <img
                    src={logoDataUrl}
                    alt="logo preview"
                    style={{
                      width: 84,
                      height: 84,
                      objectFit: "cover",
                      borderRadius: 22,
                      marginBottom: 14,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                    }}
                  />
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
              borderRadius: 30,
              padding: 32,
              border: currentTheme.cardBorder,
              background: currentTheme.cardBg,
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.9fr 1.1fr",
                gap: 24,
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    padding: 20,
                    borderRadius: 26,
                    boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
                  }}
                >
                  <QRCodeCanvas
                    id="qr-code"
                    value={qrText}
                    size={220}
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