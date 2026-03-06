import Link from "next/link";

type PageProps = {
  params: Promise<{
    name: string;
  }>;
  searchParams: Promise<{
    menu?: string;
  }>;
};

type MenuItem = {
  name: string;
  price: string;
};

export default async function MenuPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const { menu } = await searchParams;

  const restaurant = decodeURIComponent(name || "");
  const menuText = menu ? decodeURIComponent(menu) : "";

  const items: MenuItem[] = menuText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      if (parts.length < 2) {
        return { name: line, price: "" };
      }

      return {
        name: parts.slice(0, -1).join(" "),
        price: parts[parts.length - 1],
      };
    });

  if (!restaurant || !menuText) {
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
        <h1>找不到菜單</h1>
        <p>網址缺少資料</p>
        <Link href="/" style={{ color: "#7ab8ff" }}>
          回生成器
        </Link>
      </main>
    );
  }

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
      <h1 style={{ fontSize: 40, marginBottom: 30 }}>{restaurant}</h1>

      <div>
        {items.map((item, idx) => (
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
            <span>{item.name}</span>
            <span>{item.price}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <Link href="/" style={{ color: "#7ab8ff" }}>
          回生成器
        </Link>
      </div>
    </main>
  );
}