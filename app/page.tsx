"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const [restaurant, setRestaurant] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [menu, setMenu] = useState("");
  const [theme, setTheme] = useState("dark");

  const [qrText, setQrText] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setQrText("");
    setCopied(false);
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(qrText);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function downloadQR() {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;

    if (!canvas) return;

    const url = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const a = document.createElement("a");
    a.href = url;
    a.download = "menu-qrcode.png";
    a.click();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 16,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 18px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 15,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top,#1a1a1a 0%,#000 45%,#000 100%)",
        color: "#fff",
        padding: "40px 16px",
        fontFamily: "Arial",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            borderRadius: 28,
            padding: 32,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h1 style={{ fontSize: 44, margin: 0 }}>QR Code 菜單生成器</h1>

          <p style={{ marginTop: 10, color: "#aaa", fontSize: 16 }}>
            輸入餐廳資訊與菜單，立即產生可分享的 QR Code 菜單
          </p>

          {/* 餐廳名稱 */}

          <div style={{ marginTop: 30 }}>
            <div style={{ marginBottom: 6 }}>餐廳名稱</div>
            <input
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 電話 */}

          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 6 }}>電話</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 地址 */}

          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 6 }}>地址</div>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 營業時間 */}

          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 6 }}>營業時間</div>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 菜單風格 */}

          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 6 }}>菜單風格</div>

            <div style={{ position: "relative" }}>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  cursor: "pointer",
                  paddingRight: 44,
                }}
              >
                <option value="dark">黑色餐廳風</option>
                <option value="light">簡約白色</option>
                <option value="warm">溫暖咖啡風</option>
              </select>

              <span
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#aaa",
                }}
              >
                ▼
              </span>
            </div>
          </div>

          {/* 菜單 */}

          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 6 }}>菜單</div>

            <textarea
              rows={10}
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 按鈕 */}

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button onClick={generateMenu} style={buttonStyle}>
              {creating ? "生成中..." : "生成 QR 菜單"}
            </button>

            <button onClick={fillExample} style={buttonStyle}>
              填入範例
            </button>

            <button onClick={clearAll} style={buttonStyle}>
              清空
            </button>
          </div>
        </div>

        {qrText && (
          <div
            style={{
              marginTop: 30,
              borderRadius: 28,
              padding: 32,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              textAlign: "center",
            }}
          >
            <h2>菜單 QR Code</h2>

            <div
              style={{
                marginTop: 10,
                background: "#fff",
                display: "inline-block",
                padding: 16,
                borderRadius: 16,
              }}
            >
              <QRCodeCanvas id="qr-code" value={qrText} size={220} />
            </div>

            <div style={{ marginTop: 20 }}>
              <a
                href={qrText}
                target="_blank"
                style={{ color: "#7cc4ff", wordBreak: "break-all" }}
              >
                {qrText}
              </a>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent:"center"}}>
              <button onClick={copyUrl} style={buttonStyle}>
                {copied ? "已複製網址" : "複製網址"}
              </button>

              <button onClick={downloadQR} style={buttonStyle}>
                下載 QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}