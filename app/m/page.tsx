"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState("");
  const [menuText, setMenuText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restaurantValue = params.get("restaurant") ?? "";
    const menuValue = params.get("menu") ?? "";

    setRestaurant(restaurantValue);
    setMenuText(menuValue);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main
        style={{
          padding: 24,
          color: "white",
          background: "black",
          minHeight: "100vh",
          fontFamily: "Arial",
        }}
      >
        <p>載入中...</p>
      </main>
    );
  }

  if (!restaurant || !menuText) {
    return (
      <main
        style={{
          padding: 24,
          color: "white",
          background: "black",
          minHeight: "100vh",
          fontFamily: "Arial",
        }}
      >
        <h1>找不到這份菜單</h1>
        <p>網址缺少資料。</p>
        <Link href="/" style={{ color: "#4da3ff" }}>
          回生成器
        </Link>
      </main>
    );
  }

  const lines = menuText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <main
      style={{
        padding: 24,
        color: "white",
        background: "black",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: 16 }}>{restaurant}</h1>
      <h2 style={{ marginBottom: 16 }}>菜單</h2>

      <div style={{ marginTop: 16 }}>
        {lines.map((line, i) => {
          const parts = line.trim().split(/\s+/);
          const price = parts[parts.length - 1];
          const name = parts.slice(0, -1).join(" ");

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                maxWidth: 320,
                marginBottom: 12,
                fontSize: 20,
                borderBottom: "1px solid #333",
                paddingBottom: 6,
              }}
            >
              <span>{name || line}</span>
              <span>{name ? price : ""}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{ color: "#4da3ff" }}>
          回生成器
        </Link>
      </div>
    </main>
  );
}