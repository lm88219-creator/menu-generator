"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const [restaurant, setRestaurant] = useState("");
  const [menu, setMenu] = useState("");
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
    setCopied(false);

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant, menuText: menu }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "生成失敗");
        return;
      }

      if (!data?.url) {
        alert("沒有拿到 url（API 回傳異常）");
        return;
      }

      const fullUrl = `${window.location.origin}${data.url}`;
      setQrText(fullUrl);
    } catch (error) {
      console.error(error);
      alert("發生錯誤，請稍後再試");
    } finally {
      setCreating(false);
    }
  }

  async function copyUrl() {
    if (!qrText) return;

    try {
      await navigator.clipboard.writeText(qrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
      alert("複製失敗");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            border: "1px solid #222",
            borderRadius: 20,
            padding: 24,
            background: "#0b0b0b",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
          }}
        >
          <h1
            style={{
              fontSize: 32,
              margin: "0 0 8px 0",
              lineHeight: 1.2,
            }}
          >
            餐廳 QR Code 菜單生成器
          </h1>

          <p
            style={{
              margin: 0,
              color: "#aaa",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            輸入餐廳名稱與菜單內容，立即產生可分享網址與 QR Code
          </p>

          <div style={{ marginTop: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 15,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              餐廳名稱
            </label>
            <input
              placeholder="例如：友愛熱炒"
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #2a2a2a",
                background: "#111",
                color: "#fff",
                outline: "none",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 15,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              菜單內容
            </label>
            <div
              style={{
                color: "#999",
                fontSize: 13,
                marginBottom: 8,
                lineHeight: 1.5,
              }}
            >
              每行一項，格式：菜名 空格 價格
            </div>

            <textarea
              placeholder={`炒蝦球 200
炒螺肉 120
炒飯 80
燙青菜 50`}
              rows={8}
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #2a2a2a",
                background: "#111",
                color: "#fff",
                outline: "none",
                fontSize: 16,
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <button
              onClick={generateMenu}
              disabled={creating}
              style={{
                padding: "14px 20px",
                borderRadius: 12,
                border: "none",
                background: creating ? "#444" : "#fff",
                color: creating ? "#ddd" : "#000",
                cursor: creating ? "not-allowed" : "pointer",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {creating ? "生成中..." : "生成 QR 菜單"}
            </button>
          </div>
        </div>

        {qrText && (
          <div
            style={{
              marginTop: 20,
              border: "1px solid #222",
              borderRadius: 20,
              padding: 24,
              background: "#0b0b0b",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
              }}
            >
              ✅ 生成成功
            </div>

            <div
              style={{
                color: "#aaa",
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              掃描 QR Code 或直接開啟網址查看菜單
            </div>

            <div
              style={{
                display: "inline-block",
                background: "#fff",
                padding: 14,
                borderRadius: 16,
              }}
            >
              <QRCodeCanvas value={qrText} size={220} />
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 12,
                background: "#111",
                border: "1px solid #222",
                wordBreak: "break-all",
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: "#aaa", fontSize: 13, marginBottom: 4 }}>
                菜單網址
              </div>
              <a
                href={qrText}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#7ab8ff", textDecoration: "none" }}
              >
                {qrText}
              </a>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              <button
                onClick={copyUrl}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #2a2a2a",
                  background: "#151515",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {copied ? "已複製網址" : "複製網址"}
              </button>

              <a
                href={qrText}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #2a2a2a",
                  background: "#151515",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                開啟菜單頁
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}