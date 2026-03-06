import { getMenu } from "@/lib/store";
import type { CSSProperties } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ThemeType = "dark" | "light" | "warm";

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = await getMenu(id);

  if (!data) {
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
            maxWidth: 760,
            margin: "0 auto",
            borderRadius: 24,
            padding: 28,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <h1 style={{ fontSize: 30, margin: 0 }}>找不到菜單</h1>
          <p style={{ color: "#aaa", marginTop: 12 }}>
            這份菜單可能不存在，或網址有誤。
          </p>

          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: 18,
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            ← 返回首頁
          </a>
        </div>
      </main>
    );
  }

  const theme = (data.theme ?? "dark") as ThemeType;

  const lines = data.menuText.split("\n");

  let currentCategory = "";
  const items: { category: string; name: string; price: string }[] = [];

  for (const rawLine of lines) {
    const text = rawLine.trim();
    if (!text) continue;

    const parts = text.split(/\s+/);

    if (parts.length === 1) {
      currentCategory = parts[0];
    } else {
      const price = parts.pop() ?? "";
      const name = parts.join(" ");

      items.push({
        category: currentCategory,
        name,
        price,
      });
    }
  }

  let lastCategory = "";

  const themeStyles = {
    dark: {
      pageBackground:
        "radial-gradient(circle at top, #1d1d1d 0%, #050505 50%, #000 100%)",
      pageTextColor: "#fff",
      cardBackground: "rgba(255,255,255,0.04)",
      cardBorder: "1px solid rgba(255,255,255,0.08)",
      mutedColor: "#a9a9a9",
      lineColor: "rgba(255,255,255,0.12)",
      rowBorder: "1px solid rgba(255,255,255,0.08)",
      linkColor: "#f4d58d",
      accent: "#f4d58d",
      heroBadgeBg: "rgba(255,255,255,0.08)",
      secondaryBg: "rgba(255,255,255,0.08)",
      primaryBg: "#fff",
      primaryText: "#000",
    },
    light: {
      pageBackground: "linear-gradient(180deg,#f7f7f7 0%,#ececec 100%)",
      pageTextColor: "#111",
      cardBackground: "rgba(255,255,255,0.92)",
      cardBorder: "1px solid rgba(0,0,0,0.08)",
      mutedColor: "#666",
      lineColor: "rgba(0,0,0,0.12)",
      rowBorder: "1px solid rgba(0,0,0,0.08)",
      linkColor: "#0b57d0",
      accent: "#0b57d0",
      heroBadgeBg: "rgba(0,0,0,0.05)",
      secondaryBg: "#ffffff",
      primaryBg: "#111",
      primaryText: "#fff",
    },
    warm: {
      pageBackground: "linear-gradient(180deg,#f6eee2 0%,#eadbc8 100%)",
      pageTextColor: "#3e2d20",
      cardBackground: "rgba(255,250,244,0.92)",
      cardBorder: "1px solid rgba(88,54,24,0.12)",
      mutedColor: "#7b6756",
      lineColor: "rgba(88,54,24,0.16)",
      rowBorder: "1px solid rgba(88,54,24,0.1)",
      linkColor: "#8b5e34",
      accent: "#8b5e34",
      heroBadgeBg: "rgba(88,54,24,0.08)",
      secondaryBg: "rgba(255,255,255,0.72)",
      primaryBg: "#4e3426",
      primaryText: "#fff",
    },
  }[theme];

  const cardStyle: CSSProperties = {
    borderRadius: 28,
    padding: 26,
    border: themeStyles.cardBorder,
    background: themeStyles.cardBackground,
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  };

  const secondaryActionStyle: CSSProperties = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 14,
    background: themeStyles.secondaryBg,
    color: themeStyles.pageTextColor,
    textDecoration: "none",
    border: themeStyles.cardBorder,
    fontWeight: 600,
  };

  const primaryActionStyle: CSSProperties = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 14,
    background: themeStyles.primaryBg,
    color: themeStyles.primaryText,
    textDecoration: "none",
    fontWeight: 700,
    border: "none",
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: themeStyles.pageBackground,
        color: themeStyles.pageTextColor,
        padding: "24px 16px 60px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: themeStyles.mutedColor,
              fontSize: 13,
              letterSpacing: 3,
              marginBottom: 14,
              padding: "8px 14px",
              borderRadius: 999,
              background: themeStyles.heroBadgeBg,
            }}
          >
            DIGITAL MENU
          </div>

          {data.logoDataUrl ? (
            <div style={{ marginBottom: 14 }}>
              <img
                src={data.logoDataUrl}
                alt={`${data.restaurant} logo`}
                style={{
                  width: 88,
                  height: 88,
                  objectFit: "contain"
                  borderRadius: 24,
                  boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                }}
              />
            </div>
          ) : null}

          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {data.restaurant}
          </h1>

          <p
            style={{
              marginTop: 10,
              color: themeStyles.mutedColor,
              fontSize: 15,
            }}
          >
            掃碼即看，手機友善的餐廳數位菜單
          </p>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: "grid",
              gap: 18,
              fontSize: 18,
              lineHeight: 1.8,
            }}
          >
            {data.phone && (
              <div>
                <div style={{ color: themeStyles.mutedColor, fontSize: 14, marginBottom: 4 }}>
                  📞 電話
                </div>
                <a
                  href={`tel:${data.phone}`}
                  style={{
                    color: themeStyles.linkColor,
                    textDecoration: "none",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {data.phone}
                </a>
              </div>
            )}

            {data.address && (
              <div>
                <div style={{ color: themeStyles.mutedColor, fontSize: 14, marginBottom: 4 }}>
                  📍 地址
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    data.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: themeStyles.linkColor,
                    textDecoration: "none",
                    fontSize: 18,
                  }}
                >
                  {data.address}
                </a>
              </div>
            )}

            {data.hours && (
              <div>
                <div style={{ color: themeStyles.mutedColor, fontSize: 14, marginBottom: 4 }}>
                  🕒 營業時間
                </div>
                <div style={{ fontSize: 18 }}>{data.hours}</div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            marginTop: 24,
          }}
        >
          {items.map((item, index) => {
            const showCategory = item.category !== lastCategory;
            lastCategory = item.category;

            return (
              <div key={`${item.category}-${item.name}-${index}`}>
                {showCategory && item.category ? (
                  <div
                    style={{
                      marginTop: index === 0 ? 0 : 30,
                      marginBottom: 12,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: themeStyles.lineColor,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: 2,
                          whiteSpace: "nowrap",
                          color: themeStyles.accent,
                        }}
                      >
                        {item.category}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: themeStyles.lineColor,
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: themeStyles.rowBorder,
                  }}
                >
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      borderBottom: `1px dashed ${themeStyles.lineColor}`,
                      transform: "translateY(2px)",
                    }}
                  />

                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      minWidth: 60,
                      textAlign: "right",
                    }}
                  >
                    {item.price ? `$${item.price}` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {data.phone && (
            <a href={`tel:${data.phone}`} style={primaryActionStyle}>
              📞 撥打電話
            </a>
          )}

          {data.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                data.address
              )}`}
              target="_blank"
              rel="noreferrer"
              style={secondaryActionStyle}
            >
              📍 開啟地圖
            </a>
          )}

          <a href="/" style={secondaryActionStyle}>
            ← 返回首頁
          </a>
        </div>
      </div>
    </main>
  );
}