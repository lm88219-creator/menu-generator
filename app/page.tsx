"use client";

import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type MenuStyle = "dark" | "light" | "warm";

function getStyleConfig(style: MenuStyle) {
  switch (style) {
    case "light":
      return {
        pageBg: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
        cardBg: "rgba(255,255,255,0.92)",
        cardBorder: "1px solid rgba(15,23,42,0.08)",
        text: "#0f172a",
        subText: "#334155",
        muted: "#475569",
        accent: "#0f172a",
        accentSoft: "rgba(15,23,42,0.08)",
        sectionBg: "rgba(15,23,42,0.04)",
        inputBg: "#ffffff",
        inputBorder: "1px solid rgba(15,23,42,0.12)",
      };
    case "warm":
      return {
        pageBg: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)",
        cardBg: "rgba(255,255,255,0.9)",
        cardBorder: "1px solid rgba(154,52,18,0.12)",
        text: "#7c2d12",
        subText: "#9a3412",
        muted: "#c2410c",
        accent: "#ea580c",
        accentSoft: "rgba(234,88,12,0.12)",
        sectionBg: "rgba(234,88,12,0.06)",
        inputBg: "#fffaf5",
        inputBorder: "1px solid rgba(154,52,18,0.12)",
      };
    case "dark":
    default:
      return {
        pageBg: "radial-gradient(circle at top, #1f2937 0%, #0f172a 45%, #020617 100%)",
        cardBg: "rgba(15,23,42,0.78)",
        cardBorder: "1px solid rgba(255,255,255,0.08)",
        text: "#f8fafc",
        subText: "rgba(248,250,252,0.88)",
        muted: "rgba(248,250,252,0.68)",
        accent: "#f59e0b",
        accentSoft: "rgba(245,158,11,0.12)",
        sectionBg: "rgba(255,255,255,0.04)",
        inputBg: "rgba(255,255,255,0.06)",
        inputBorder: "1px solid rgba(255,255,255,0.1)",
      };
  }
}

export default function Home() {
  const [restaurant, setRestaurant] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [menuText, setMenuText] = useState("");
  const [style, setStyle] = useState<MenuStyle>("dark");

  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  const [qrText, setQrText] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const theme = useMemo(() => getStyleConfig(style), [style]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setLogoDataUrl(result);
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  }

  async function generateMenu() {
    if (!restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return;
    }

    if (!menuText.trim()) {
      alert("請輸入菜單內容");
      return;
    }

    setCreating(true);
    setCopied(false);

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
          menuText,
          style,
          logo: logoDataUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "生成失敗");
        return;
      }

      const url = `${window.location.origin}/m/${data.id}`;
      setQrText(url);
    } catch (err) {
      alert("生成失敗，請稍後再試");
    } finally {
      setCreating(false);
    }
  }

  async function copyLink() {
    if (!qrText) return;
    await navigator.clipboard.writeText(qrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        color: theme.text,
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 24,
        }}
      >
        <section
          style={{
            background: theme.cardBg,
            border: theme.cardBorder,
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                background: theme.accentSoft,
                color: theme.accent,
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              菜單生成器
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.2,
                fontWeight: 800,
                color: theme.text,
              }}
            >
              建立你的餐廳 QR Code 菜單
            </h1>

            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                color: theme.muted,
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              輸入店家資料、菜單內容與 Logo，就能快速生成公開網址與 QR Code。
            </p>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <input
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              placeholder="餐廳名稱"
              style={inputStyle(theme)}
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="電話"
              style={inputStyle(theme)}
            />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="地址"
              style={inputStyle(theme)}
            />

            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="營業時間"
              style={inputStyle(theme)}
            />

            <textarea
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              placeholder={`例如：
招牌炒飯 80
蝦仁炒飯 90
牛肉炒麵 100`}
              rows={10}
              style={{
                ...inputStyle(theme),
                resize: "vertical",
                minHeight: 220,
                lineHeight: 1.7,
              }}
            />

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                background: theme.sectionBg,
                border: theme.cardBorder,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: theme.text,
                }}
              >
                菜單風格
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { key: "dark", label: "深色質感" },
                  { key: "light", label: "簡約明亮" },
                  { key: "warm", label: "溫暖餐館" },
                ].map((item) => {
                  const active = style === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setStyle(item.key as MenuStyle)}
                      style={{
                        border: active ? `2px solid ${theme.accent}` : theme.cardBorder,
                        background: active ? theme.accentSoft : theme.inputBg,
                        color: theme.text,
                        borderRadius: 14,
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                background: theme.sectionBg,
                border: theme.cardBorder,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: theme.text,
                }}
              >
                上傳 Logo
              </div>

              <label
                style={{
                  display: "block",
                  borderRadius: 16,
                  border: "2px dashed rgba(128,128,128,0.35)",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.35)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.subText,
                    marginBottom: 6,
                  }}
                >
                  點我上傳 Logo
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: theme.muted,
                  }}
                >
                  支援 PNG / JPG / WebP
                </div>
              </label>

              {logoPreview ? (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.muted,
                      marginBottom: 8,
                    }}
                  >
                    Logo 預覽
                  </div>

                  {/* 這裡就是 Logo 自動置中重點 */}
                  <div
                    style={{
                      width: 220,
                      height: 220,
                      margin: "0 auto",
                      borderRadius: 18,
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: 16,
                    }}
                  >
                    <img
                      src={logoPreview}
                      alt="logo preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        objectPosition: "center",
                        display: "block",
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <button
              onClick={generateMenu}
              disabled={creating}
              style={{
                border: "none",
                background: theme.accent,
                color: style === "light" ? "#ffffff" : "#0f172a",
                borderRadius: 16,
                padding: "16px 18px",
                fontSize: 16,
                fontWeight: 800,
                cursor: creating ? "not-allowed" : "pointer",
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? "生成中..." : "生成公開菜單"}
            </button>
          </div>
        </section>

        <section
          style={{
            background: theme.cardBg,
            border: theme.cardBorder,
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            backdropFilter: "blur(14px)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: 24,
              fontWeight: 800,
              color: theme.text,
            }}
          >
            預覽
          </h2>

          <div
            style={{
              borderRadius: 24,
              padding: 24,
              background: theme.sectionBg,
              border: theme.cardBorder,
            }}
          >
            {logoPreview ? (
              <div
                style={{
                  width: 120,
                  height: 120,
                  margin: "0 auto 16px auto",
                  borderRadius: 999,
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: 12,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                }}
              >
                <img
                  src={logoPreview}
                  alt="logo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "center",
                    display: "block",
                  }}
                />
              </div>
            ) : null}

            <div
              style={{
                textAlign: "center",
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 8,
                color: theme.text,
              }}
            >
              {restaurant || "你的餐廳名稱"}
            </div>

            {(phone || address || hours) && (
              <div
                style={{
                  textAlign: "center",
                  color: theme.muted,
                  fontSize: 14,
                  lineHeight: 1.8,
                  marginBottom: 18,
                }}
              >
                {phone ? <div>電話：{phone}</div> : null}
                {address ? <div>地址：{address}</div> : null}
                {hours ? <div>營業時間：{hours}</div> : null}
              </div>
            )}

            <div
              style={{
                marginTop: 18,
                borderTop: theme.cardBorder,
                paddingTop: 18,
                whiteSpace: "pre-wrap",
                color: theme.subText,
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              {menuText || "菜單內容會顯示在這裡"}
            </div>
          </div>

          {qrText ? (
            <div
              style={{
                marginTop: 22,
                padding: 20,
                borderRadius: 20,
                background: theme.sectionBg,
                border: theme.cardBorder,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  marginBottom: 14,
                  fontSize: 16,
                  fontWeight: 800,
                  color: theme.text,
                }}
              >
                已生成公開網址
              </div>

              <div
                style={{
                  display: "inline-block",
                  background: "#ffffff",
                  padding: 14,
                  borderRadius: 18,
                }}
              >
                <QRCodeCanvas value={qrText} size={180} />
              </div>

              <div
                style={{
                  marginTop: 14,
                  wordBreak: "break-all",
                  color: theme.subText,
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {qrText}
              </div>

              <button
                onClick={copyLink}
                style={{
                  marginTop: 14,
                  border: "none",
                  background: theme.accent,
                  color: style === "light" ? "#ffffff" : "#0f172a",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {copied ? "已複製連結" : "複製公開網址"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function inputStyle(theme: ReturnType<typeof getStyleConfig>): React.CSSProperties {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: theme.inputBorder,
    background: theme.inputBg,
    color: theme.text,
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
  };
}