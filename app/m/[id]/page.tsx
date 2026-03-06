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

  const infoCardStyle: React.CSSProperties = {
    borderRadius: 24,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(10px)",
  };

  const actionStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1a1a1a 0%, #000 45%, #000 100%)",
        color: "#fff",
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
              color: "#bbb",
              fontSize: 14,
              letterSpacing: 2,
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

        <div style={infoCardStyle}>
          <div
            style={{
              display: "grid",
              gap: 14,
              fontSize: 18,
              lineHeight: 1.8,
            }}
          >
            {data.phone && (
              <div>
                <span style={{ color: "#aaa" }}>📞 電話</span>
                <div>
                  <a
                    href={`tel:${data.phone}`}
                    style={{
                      color: "#7cc4ff",
                      textDecoration: "none",
                    }}
                  >
                    {data.phone}
                  </a>
                </div>
              </div>
            )}

            {data.address && (
              <div>
                <span style={{ color: "#aaa" }}>📍 地址</span>
                <div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      data.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#7cc4ff",
                      textDecoration: "none",
                    }}
                  >
                    {data.address}
                  </a>
                </div>
              </div>
            )}

            {data.hours && (
              <div>
                <span style={{ color: "#aaa" }}>🕒 營業時間（最後點餐時間0:30）</span>
                <div>{data.hours}</div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            borderRadius: 24,
            padding: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(10px)",
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
                      marginTop: index === 0 ? 0 : 28,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 14px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                    >
                      {item.category}
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 500,
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${item.price}
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
          <a href="/" style={actionStyle}>
            ← 返回首頁
          </a>

          {data.phone && (
            <a href={`tel:${data.phone}`} style={actionStyle}>
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
              style={actionStyle}
            >
              📍 開啟地圖
            </a>
          )}
        </div>
      </div>
    </main>
  );
}