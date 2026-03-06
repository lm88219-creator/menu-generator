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
          background: "#000",
          color: "#fff",
          padding: "32px 20px",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: 28, margin: 0 }}>找不到菜單</h1>
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

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "32px 20px 60px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginTop: 0,
          marginBottom: 20,
        }}
      >
        {data.restaurant}
      </h1>

      <div style={{ lineHeight: 1.9, fontSize: 18 }}>
        {data.phone && (
          <div>
            📞 電話：
            <a
              href={`tel:${data.phone}`}
              style={{
                color: "#7cc4ff",
                marginLeft: 6,
                textDecoration: "none",
              }}
            >
              {data.phone}
            </a>
          </div>
        )}

        {data.address && (
          <div>
            📍 地址：
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                data.address
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#7cc4ff",
                marginLeft: 6,
                textDecoration: "none",
              }}
            >
              {data.address}
            </a>
          </div>
        )}

        {data.hours ? <div>🕒 營業時間：{data.hours}(最後點餐時間0:30)</div> : null}
      </div>

      <div style={{ marginTop: 36 }}>
        {items.map((item, index) => {
          const showCategory = item.category !== lastCategory;
          lastCategory = item.category;

          return (
            <div key={`${item.category}-${item.name}-${index}`}>
              {showCategory && item.category ? (
                <h2
                  style={{
                    marginTop: 28,
                    marginBottom: 10,
                    fontSize: 24,
                    fontWeight: 700,
                    borderBottom: "1px solid #333",
                    paddingBottom: 8,
                  }}
                >
                  {item.category}
                </h2>
              ) : null}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: "1px solid #222",
                  fontSize: 18,
                }}
              >
                <span>{item.name}</span>
                <span style={{ whiteSpace: "nowrap" }}>{item.price}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 36,
          paddingTop: 20,
          borderTop: "1px solid #222",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          ← 返回首頁
        </a>

        {data.phone && (
          <a
            href={`tel:${data.phone}`}
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
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
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            📍 開啟地圖
          </a>
        )}
      </div>
    </main>
  );
}