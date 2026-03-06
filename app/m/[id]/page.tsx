import { getMenu } from "@/lib/store";

export default function Page({ params }: { params: { id: string } }) {
  const data = getMenu(params.id);

  if (!data) {
    return (
      <main style={{ padding: 20 }}>
        <h1>找不到菜單</h1>
      </main>
    );
  }

  const lines = data.menuText.split("\n");

  let currentCategory = "";
  const items: { category: string; name: string; price: string }[] = [];

  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;

    const parts = text.split(" ");

    if (parts.length === 1) {
      // 只有一個字 → 當分類
      currentCategory = parts[0];
    } else {
      const price = parts.pop();
      const name = parts.join(" ");

      items.push({
        category: currentCategory,
        name,
        price: price || "",
      });
    }
  }

  let lastCategory = "";

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 20,
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>{data.restaurant}</h1>

      {data.phone && <div>電話：{data.phone}</div>}
      {data.address && <div>地址：{data.address}</div>}
      {data.hours && <div>營業時間：{data.hours}</div>}

      <div style={{ marginTop: 30 }}>

        {items.map((item, i) => {
          const showCategory = item.category !== lastCategory;
          lastCategory = item.category;

          return (
            <div key={i}>
              {showCategory && item.category && (
                <h2
                  style={{
                    marginTop: 30,
                    marginBottom: 10,
                    borderBottom: "1px solid #444",
                    paddingBottom: 5,
                  }}
                >
                  {item.category}
                </h2>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #222",
                }}
              >
                <span>{item.name}</span>
                <span>{item.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}