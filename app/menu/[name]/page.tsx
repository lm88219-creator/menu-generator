"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MenuItem = {
  name: string;
  price: string;
};

export default function MenuPage({ params }: { params: { name: string } }) {
  const [menuText, setMenuText] = useState("");
  const [loaded, setLoaded] = useState(false);

  const restaurant = decodeURIComponent(params.name);

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
        return {
          name: parts.slice(0, -1).join(" "),
          price: parts[parts.length - 1],
        };
      });
  }, [menuText]);

  if (!loaded) return <div>載入中...</div>;

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
      <h1 style={{ fontSize: 40 }}>{restaurant}</h1>

      <div style={{ marginTop: 30 }}>
        {items.map((i, idx) => (
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
            <span>{i.name}</span>
            <span>{i.price}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <Link href="/">回生成器</Link>
      </div>
    </main>
  );
}