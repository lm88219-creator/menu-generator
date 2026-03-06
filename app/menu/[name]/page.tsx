"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type MenuItem = {
  name: string;
  price: string;
};

export default function MenuPage() {
  const params = useParams();
  const rawName = params?.name;

  const restaurant = Array.isArray(rawName)
    ? decodeURIComponent(String(rawName[0] || ""))
    : decodeURIComponent(String(rawName || ""));

  const [menuText, setMenuText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setMenuText(p.get("menu") ?? "");
    setLoaded(true);
  }, []);

  const items = useMemo<MenuItem[]>(() => {
    return menuText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const parts = l.split(/\s+/);
        if (parts.length < 2) {
          return { name: l, price: "" };
        }

        return {
          name: parts.slice(0, -1).join(" "),
          price: parts[parts.length - 1],
        };
      });
  }, [menuText]);

  if (!loaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial",
        }}
      >
        載入中...
      </main>
    );
  }

  if (!restaurant || !menuText) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "black",
          color: "white",
          padding: 40,
          fontFamily: "Arial",
        }}
      >
        <h1>找不到菜單</h1>
        <p>網址缺少資料</p>
        <Link href="/">回生成器</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: 40,
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: 40, marginBottom: 30 }}>{restaurant}</h1>

      <div>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid #333",
              fontSize: 20,
            }}
          >
            <span>{item.name}</span>
            <span>{item.price}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <Link href="/" style={{ color: "#7ab8ff" }}>
          回生成器
        </Link>
      </div>
    </main>
  );
}