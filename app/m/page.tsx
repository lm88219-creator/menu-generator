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
          background:
            "radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)",
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
          background:
            "radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)",
          color: "#fff",
          padding: "32px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28,
            padding: 28,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(8px)",
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: 34 }}>找不到這份菜單</h1>
          <p style={{ color: "#bdbdbd", lineHeight: 1.8, marginBottom: 18 }}>
            網址缺少資料。
          </p>
          <Link href="/" style={{ color: "#8cc8ff", textDecoration: "none" }}>
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
        background:
          "radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)",
        color: "#fff",
        padding: "36px 16px 56px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 30,
            padding: 28,
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#c8b27d",
              letterSpacing: 2,
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            MENU
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 44,
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            {restaurant}
          </h1>

          <div
            style={{
              marginTop: 12,
              color: "#a8a8a8",
              fontSize: 15,
              lineHeight: 1.8,
            }}
          >
            歡迎掃描查看最新菜單與店家資訊
          </div>

          {(phone || address || hours) && (
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {phone && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9f9f9f",
                      marginBottom: 8,
                      letterSpacing: 1,
                    }}
                  >
                    電話
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{phone}</div>
                </div>
              )}

              {address && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9f9f9f",
                      marginBottom: 8,
                      letterSpacing: 1,
                    }}
                  >
                    地址
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>
                    {address}
                  </div>
                </div>
              )}

              {hours && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9f9f9f",
                      marginBottom: 8,
                      letterSpacing: 1,
                    }}
                  >
                    營業時間
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{hours}</div>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#b8b8b8",
                marginBottom: 10,
                letterSpacing: 1,
              }}
            >
              今日菜單
            </div>

            <div
              style={{
                borderRadius: 22,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.22)",
              }}
            >
              {items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "18px 18px",
                    borderBottom:
                      index === items.length - 1
                        ? "none"
                        : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      fontSize: 22,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      borderBottom: "1px dashed rgba(255,255,255,0.18)",
                    }}
                  />

                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#f4f4f4",
                      letterSpacing: 0.5,
                      minWidth: 64,
                      textAlign: "right",
                    }}
                  >
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "#8cc8ff",
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