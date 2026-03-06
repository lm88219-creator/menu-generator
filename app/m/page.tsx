"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MenuItem = {
  name: string;
  price: string;
};

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [menuText, setMenuText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRestaurant(params.get("restaurant") ?? "");
    setPhone(params.get("phone") ?? "");
    setAddress(params.get("address") ?? "");
    setHours(params.get("hours") ?? "");
    setMenuText(params.get("menu") ?? "");
    setLoaded(true);
  }, []);

  const items = useMemo<MenuItem[]>(() => {
    return menuText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/);
        if (parts.length < 2) {
          return { name: line, price: "" };
        }

        const price = parts[parts.length - 1];
        const name = parts.slice(0, -1).join(" ");
        return { name, price };
      });
  }, [menuText]);

  if (!loaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
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
          background: "#000",
          color: "#fff",
          padding: "32px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            border: "1px solid #222",
            borderRadius: 20,
            padding: 24,
            background: "#0b0b0b",
          }}
        >
          <h1 style={{ marginTop: 0 }}>找不到這份菜單</h1>
          <p style={{ color: "#aaa", lineHeight: 1.7 }}>網址缺少資料。</p>
          <Link href="/" style={{ color: "#7ab8ff", textDecoration: "none" }}>
            回生成器
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "24px 16px 40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #222",
            borderRadius: 24,
            padding: 24,
            background: "#0b0b0b",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#9a9a9a",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            MENU
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.2,
            }}
          >
            {restaurant}
          </h1>

          {(phone || address || hours) && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 14,
                background: "#111",
                border: "1px solid #1f1f1f",
                color: "#cfcfcf",
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              {phone && <div>電話：{phone}</div>}
              {address && <div>地址：{address}</div>}
              {hours && <div>營業時間：{hours}</div>}
            </div>
          )}

          <div
            style={{
              marginTop: 18,
              height: 1,
              background: "#222",
            }}
          />

          <div style={{ marginTop: 18 }}>
            {items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom:
                    index === items.length - 1 ? "none" : "1px solid #1d1d1d",
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </span>

                <span
                  style={{
                    flex: 1,
                    borderBottom: "1px dashed #333",
                    transform: "translateY(-2px)",
                  }}
                />

                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "#7ab8ff",
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            回生成器
          </Link>
        </div>
      </div>
    </main>
  );
}