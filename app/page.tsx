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

      const fullUrl = `${window.location.origin}${data.url}`;
      setQrText(fullUrl);
    } finally {
      setCreating(false);
    }
  }

  function fillExample() {
    setRestaurant("友愛熱炒");
    setMenu(`炒蝦球 200
炒螺肉 120
炒飯 80
燙青菜 50`);
  }

  function clearAll() {
    setRestaurant("");
    setMenu("");
    setQrText("");
  }

  async function copyUrl() {
    if (!qrText) return;

    await navigator.clipboard.writeText(qrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "Arial",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 720, margin: "auto" }}>
        <h1 style={{ fontSize: 32 }}>餐廳 QR Code 菜單生成器</h1>

        <p style={{ color: "#aaa" }}>
          輸入餐廳名稱與菜單，每行格式：菜名 空格 價格
        </p>

        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 8 }}>餐廳名稱</div>

          <input
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              background: "#111",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
            }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 8 }}>菜單</div>

          <textarea
            rows={8}
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              background: "#111",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
            }}
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={generateMenu}>生成菜單</button>

          <button onClick={fillExample}>填入範例</button>

          <button onClick={clearAll}>清空</button>
        </div>

        {qrText && (
          <div style={{ marginTop: 30 }}>
            <h3>掃描 QR Code 查看菜單</h3>

            <div
              style={{
                background: "#fff",
                padding: 12,
                display: "inline-block",
                borderRadius: 10,
              }}
            >
              <QRCodeCanvas value={qrText} size={220} />
            </div>

            <div style={{ marginTop: 10 }}>
              <a href={qrText} target="_blank">
                {qrText}
              </a>
            </div>

            <div style={{ marginTop: 10 }}>
              <button onClick={copyUrl}>
                {copied ? "已複製網址" : "複製網址"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}