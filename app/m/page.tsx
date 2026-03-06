type PageProps = {
  searchParams: {
    restaurant?: string;
    menu?: string;
  };
};

export default function MenuPage({ searchParams }: PageProps) {
  const restaurant = searchParams.restaurant ?? "";
  const menuText = searchParams.menu ?? "";

  if (!restaurant || !menuText) {
    return (
      <main
        style={{
          padding: 24,
          color: "white",
          background: "black",
          minHeight: "100vh",
        }}
      >
        <h1>找不到這份菜單</h1>
        <p>網址缺少資料。</p>
        <a href="/" style={{ color: "#4da3ff" }}>
          回生成器
        </a>
      </main>
    );
  }

  const lines = menuText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <main
      style={{
        padding: 24,
        color: "white",
        background: "black",
        minHeight: "100vh",
      }}
    >
      <h1>{restaurant}</h1>
      <h2>菜單</h2>

      <div style={{ marginTop: 16 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ marginBottom: 8, fontSize: 20 }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <a href="/" style={{ color: "#4da3ff" }}>
          回生成器
        </a>
      </div>
    </main>
  );
}