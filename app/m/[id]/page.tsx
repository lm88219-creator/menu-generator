import Link from "next/link";
import { getMenu } from "@/lib/store";

function parseMenu(menuText: string) {
  return menuText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      const priceStr = parts.pop() ?? "";
      const name = parts.join(" ").trim();
      const price = Number(priceStr);

      return {
        name,
        price: Number.isNaN(price) ? null : price,
      };
    });
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getMenu(id);

  if (!data) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial" }}>
        <h2>找不到這份菜單</h2>
        <p>可能是 id 不存在，或資料尚未建立。</p>
        <Link href="/">回生成器</Link>
      </main>
    );
  }

  const items = parseMenu(data.menuText);

  return (
    <main style={{ padding: 24, fontFamily: "Arial", maxWidth: 520 }}>
      <h1 style={{ marginBottom: 8 }}>{data.restaurant}</h1>
      <div style={{ opacity: 0.7, marginBottom: 16 }}>菜單</div>

      <div style={{ borderTop: "1px solid #333" }}>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #333",
            }}
          >
            <div>{it.name}</div>
            <div>{it.price === null ? "" : `$${it.price}`}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <Link href="/">← 回生成器</Link>
      </div>
    </main>
  );
}