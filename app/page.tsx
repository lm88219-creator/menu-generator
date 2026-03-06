"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const [restaurant, setRestaurant] = useState("");
  const [menu, setMenu] = useState("");
  const [qrText, setQrText] = useState("");
  const [creating, setCreating] = useState(false);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant, menuText: menu }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "生成失敗");
        return;
      }

      if (!data?.id) {
        alert("沒有拿到 id（API 回傳異常）");
        return;
      }

      const url = `${window.location.origin}/m/${data.id}`;
      setQrText(url);
      } 
      
      finally {
      setCreating(false);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>餐廳 QR Code 菜單生成器 TEST123</h1>

      <p>餐廳名稱</p>
      <input
        placeholder="例如：友愛熱炒"
        style={{ padding: 8, width: 300 }}
        value={restaurant}
        onChange={(e) => setRestaurant(e.target.value)}
      />

      <p style={{ marginTop: 12 }}>菜單（每行：菜名 空格 價格）</p>
      <textarea
        placeholder={`炒蝦球 200
炒螺肉 120
炒飯 80`}
        rows={6}
        style={{ padding: 8, width: 300 }}
        value={menu}
        onChange={(e) => setMenu(e.target.value)}
      />

      <br />
      <br />

      <button onClick={generateMenu} style={{ padding: 10 }} disabled={creating}>
        {creating ? "生成中..." : "生成菜單"}
      </button>

      {qrText && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            ✅ 掃描 QR Code 查看菜單
          </div>

          <QRCodeCanvas value={qrText} size={180} />

          <div style={{ marginTop: 10, wordBreak: "break-all", maxWidth: 420 }}>
            網址：{" "}
            <a href={qrText} target="_blank" rel="noreferrer">
              {qrText}
            </a>
          </div>
        </div>
      )}
    </main>
  );
}