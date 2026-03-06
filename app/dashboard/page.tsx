import Link from "next/link";

const mockMenus = [
  {
    id: "a1b2c3",
    name: "友愛熱炒｜晚餐菜單",
    theme: "黑色餐廳風",
    updatedAt: "2026-03-06 18:30",
    status: "已發布",
  },
  {
    id: "d4e5f6",
    name: "友愛熱炒｜宵夜菜單",
    theme: "溫暖咖啡風",
    updatedAt: "2026-03-05 22:10",
    status: "已發布",
  },
  {
    id: "g7h8i9",
    name: "友愛熱炒｜春季限定菜單",
    theme: "簡約白色",
    updatedAt: "2026-03-04 14:20",
    status: "草稿",
  },
];

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1a1a1a 0%, #0b0b0b 45%, #000 100%)",
        color: "#fff",
        padding: "32px 16px 60px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                color: "#bdbdbd",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              Restaurant Dashboard
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.2,
                fontWeight: 800,
              }}
            >
              我的菜單後台
            </h1>

            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: "#a9a9a9",
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              管理你的餐廳菜單、公開連結與 QR Code。
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              返回首頁
            </Link>

            <Link
              href="/"
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                background: "#fff",
                color: "#000",
                textDecoration: "none",
                fontWeight: 700,
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
              }}
            >
              ＋ 新增菜單
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard title="總菜單數" value="3" sub="目前建立的菜單數量" />
          <StatCard title="已發布" value="2" sub="可公開分享的菜單" />
          <StatCard title="草稿" value="1" sub="尚未正式發布" />
        </div>

        <div
          style={{
            borderRadius: 28,
            padding: 24,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>我的菜單</div>
              <div style={{ color: "#a9a9a9", fontSize: 14, marginTop: 6 }}>
                這裡會顯示你建立過的所有菜單
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                color: "#cfcfcf",
                fontSize: 13,
              }}
            >
              目前為展示版列表
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {mockMenus.map((menu) => {
              const publicUrl = `/m/${menu.id}`;

              return (
                <div
                  key={menu.id}
                  style={{
                    borderRadius: 22,
                    padding: 20,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            lineHeight: 1.4,
                          }}
                        >
                          {menu.name}
                        </div>

                        <span
                          style={{
                            display: "inline-flex",
                            padding: "6px 10px",
                            borderRadius: 999,
                            background:
                              menu.status === "已發布"
                                ? "rgba(34,197,94,0.16)"
                                : "rgba(250,204,21,0.16)",
                            color:
                              menu.status === "已發布" ? "#86efac" : "#fde68a",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {menu.status}
                        </span>
                      </div>

                      <div
                        style={{
                          color: "#a9a9a9",
                          fontSize: 14,
                          lineHeight: 1.8,
                        }}
                      >
                        <div>主題：{menu.theme}</div>
                        <div>最後更新：{menu.updatedAt}</div>
                        <div>
                          公開連結：
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#f4d58d",
                              marginLeft: 6,
                              textDecoration: "none",
                              wordBreak: "break-all",
                            }}
                          >
                            {publicUrl}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <ActionButton href={publicUrl} label="查看公開頁" primary />
                      <ActionButton href="/" label="編輯" />
                      <button
                        style={{
                          padding: "12px 16px",
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.06)",
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        padding: 22,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ color: "#a9a9a9", fontSize: 14, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ color: "#8f8f8f", fontSize: 13 }}>{sub}</div>
    </div>
  );
}

function ActionButton({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "12px 16px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 14,
        background: primary ? "#fff" : "rgba(255,255,255,0.08)",
        color: primary ? "#000" : "#fff",
        border: primary ? "none" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: primary ? "0 10px 24px rgba(0,0,0,0.16)" : "none",
      }}
    >
      {label}
    </Link>
  );
}