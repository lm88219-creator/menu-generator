import { getMenu } from "@/lib/store";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

  const theme = data.theme ?? "dark";

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

  const pageBackground =
    theme === "light"
      ? "#ffffff"
      : theme === "warm"
      ? "#f6f1e7"
      : "radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)";

  const pageTextColor = theme === "light" || theme === "warm" ? "#111" : "#fff";

  const cardBackground =
    theme === "light"
      ? "#f8f8f8"
      : theme === "warm"
      ? "rgba(255,248,240,0.9)"
      : "rgba(255,255,255,0.03)";

  const cardBorder =
    theme === "light" || theme === "warm"
      ? "1px solid rgba(0,0,0,0.08)"
      : "1px solid rgba(255,255,255,0.08)";

  const mutedColor = theme === "light" || theme === "warm" ? "#666" : "#aaa";
  const lineColor =
    theme === "light" || theme === "warm"
      ? "rgba(0,0,0,0.12)"
      : "rgba(255,255,255,0.12)";
  const rowBorder =
    theme === "light" || theme === "warm"
      ? "1px solid rgba(0,0,0,0.08)"
      : "1px solid rgba(255,255,255,0.08)";

  const linkColor = theme === "light" || theme === "warm" ? "#0b57d0" : "#7cc4ff";

  const cardStyle: React.CSSProperties = {
    borderRadius: 24,
    padding: 24,
    border: cardBorder,
    background: cardBackground,
    backdropFilter: "blur(10px)",
  };

  const secondaryActionStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    background: theme === "light" || theme === "warm" ? "#ffffff" : "rgba(255,255,255,0.08)",
    color: pageTextColor,
    textDecoration: "none",
    border:
      theme === "light" || theme === "warm"
        ? "1px solid rgba(0,0,0,0.08)"
        : "1px solid rgba(255,255,255,0.06)",
  };

  const primaryActionStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    background: theme === "light" || theme === "warm" ? "#111" : "#fff",
    color: theme === "light" || theme === "warm" ? "#fff" : "#000",
    textDecoration: "none",
    fontWeight: 700,
    border:
      theme === "light" || theme === "warm"
        ? "1px solid rgba(0,0,0,0.1)"
        : "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: pageBackground,
        color: pageTextColor,
        padding: "24px 16px 60px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              color: mutedColor,
              fontSize: 13,
              letterSpacing: 3,
              marginBottom: 10,
            }}
          >
            DIGITAL MENU
          </div>

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
                <div style={{ color: mutedColor, fontSize: 14, marginBottom: 4 }}>
                  📞 電話
                </div>
                <a
                  href={`tel:${data.phone}`}
                  style={{
                    color: linkColor,
                    textDecoration: "none",
                    fontSize: 18,
                  }}
                >
                  {data.phone}
                </a>
              </div>
            )}

            {data.address && (
              <div>
                <div style={{ color: mutedColor, fontSize: 14, marginBottom: 4 }}>
                  📍 地址
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    data.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: linkColor,
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
                <div style={{ color: mutedColor, fontSize: 14, marginBottom: 4 }}>
                  🕒 營業時間
                </div>
                <div style={{ fontSize: 18 }}>{data.hours}</div>
                <div style={{ color: mutedColor, fontSize: 14, marginTop: 4 }}>
                  最後點餐時間：0:30
                </div>
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
                          background: lineColor,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.category}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: lineColor,
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
                    borderBottom: rowBorder,
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
                      borderBottom: `1px dashed ${lineColor.replace("0.12", "0.2")}`,
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