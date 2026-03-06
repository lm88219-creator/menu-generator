export const dynamic = "force-dynamic";

import Link from "next/link";
import DeleteButton from "./DeleteButton";
import DeskCardButton from "./DeskCardButton";
import { listMenus } from "@/lib/store";
import { getConfiguredSiteUrl } from "@/lib/site";

type SearchParamsShape = {
  q?: string;
  theme?: string;
};

type PageProps = {
  searchParams?: Promise<SearchParamsShape> | SearchParamsShape;
};

function getThemeName(theme?: string) {
  if (theme === "light") return "簡約白色";
  if (theme === "warm") return "溫暖咖啡風";
  if (theme === "ocean") return "海洋清新風";
  if (theme === "forest") return "森林自然風";
  if (theme === "rose") return "玫瑰奶茶風";
  return "黑色餐廳風";
}

function formatDateTime(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-TW", {
    hour12: false,
  });
}

function getRelativeText(value?: number) {
  if (!value) return "—";
  const diff = Date.now() - value;

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))} 分鐘前`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)} 小時前`;
  }

  return `${Math.floor(diff / day)} 天前`;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = String(resolvedSearchParams?.q ?? "").trim().toLowerCase();
  const themeFilter = String(resolvedSearchParams?.theme ?? "").trim();

  const menus = await listMenus();
  const publicBaseUrl = getConfiguredSiteUrl();

  const filteredMenus = menus.filter((menu) => {
    const matchKeyword =
      !q ||
      menu.restaurant?.toLowerCase().includes(q) ||
      menu.id?.toLowerCase().includes(q) ||
      menu.slug?.toLowerCase().includes(q) ||
      menu.phone?.toLowerCase().includes(q) ||
      menu.address?.toLowerCase().includes(q);

    const matchTheme = !themeFilter || menu.theme === themeFilter;

    return matchKeyword && matchTheme;
  });

  const latestUpdated = menus[0]?.updatedAt;
  const totalMenus = menus.length;
  const filteredCount = filteredMenus.length;
  const withLogoCount = menus.filter((menu) => Boolean(menu.logoDataUrl)).length;

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
              Restaurant Dashboard Pro
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
              管理菜單、快速搜尋、複製公開連結、查看品牌風格。
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
          <StatCard title="總菜單數" value={String(totalMenus)} sub="目前建立的全部菜單" />
          <StatCard title="目前篩選結果" value={String(filteredCount)} sub="依搜尋與主題篩選後" />
          <StatCard
            title="有 Logo 的菜單"
            value={String(withLogoCount)}
            sub={latestUpdated ? `最近更新：${getRelativeText(latestUpdated)}` : "尚無資料"}
          />
        </div>

        <form
          action="/dashboard"
          method="GET"
          style={{
            borderRadius: 24,
            padding: 18,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 0.7fr auto auto",
              gap: 12,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              name="q"
              defaultValue={resolvedSearchParams?.q ?? ""}
              placeholder="搜尋餐廳名稱 / 菜單 ID / 電話 / 地址"
              style={inputStyle}
            />

            <select
              name="theme"
              defaultValue={resolvedSearchParams?.theme ?? ""}
              style={inputStyle}
            >
              <option value="">全部主題</option>
              <option value="dark">黑色餐廳風</option>
              <option value="light">簡約白色</option>
              <option value="warm">溫暖咖啡風</option>
              <option value="ocean">海洋清新風</option>
              <option value="forest">森林自然風</option>
              <option value="rose">玫瑰奶茶風</option>
            </select>

            <button type="submit" style={primaryButtonStyle}>
              搜尋
            </button>

            <Link href="/dashboard" style={ghostButtonStyle}>
              清除
            </Link>
          </div>
        </form>

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
                顯示你建立過的所有菜單，並可快速管理
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
              已升級：搜尋 / 篩選 / Logo / 快速操作
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {filteredMenus.length === 0 ? (
              <div
                style={{
                  borderRadius: 22,
                  padding: 28,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#a9a9a9",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                  找不到符合條件的菜單
                </div>
                <div style={{ marginBottom: 16 }}>
                  你可以換個關鍵字，或清除篩選後再試一次。
                </div>
                <Link href="/dashboard" style={ghostButtonStyle}>
                  清除篩選
                </Link>
              </div>
            ) : (
              filteredMenus.map((menu) => {
                const publicUrl = menu.slug ? `/menu/${encodeURIComponent(menu.slug)}` : `/m/${menu.id}`;
                const displayPublicUrl = publicBaseUrl ? `${publicBaseUrl}${publicUrl}` : publicUrl;

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
                        gap: 18,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          minWidth: 280,
                          display: "flex",
                          gap: 16,
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {menu.logoDataUrl ? (
                            <img
                              src={menu.logoDataUrl}
                              alt={`${menu.restaurant} logo`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                background: "#fff",
                                padding: 8,
                                boxSizing: "border-box",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#8f8f8f",
                                letterSpacing: 1,
                              }}
                            >
                              NO LOGO
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
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
                              {menu.restaurant || "未命名菜單"}
                            </div>

                            <span
                              style={{
                                display: "inline-flex",
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: "rgba(34,197,94,0.16)",
                                color: "#86efac",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              已發布
                            </span>

                            <span
                              style={{
                                display: "inline-flex",
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.08)",
                                color: "#ddd",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {getThemeName(menu.theme)}
                            </span>
                          </div>

                          <div
                            style={{
                              color: "#a9a9a9",
                              fontSize: 14,
                              lineHeight: 1.9,
                              wordBreak: "break-word",
                            }}
                          >
                            <div>菜單 ID：{menu.id}</div>
                            {menu.slug ? <div>自訂網址：{displayPublicUrl}</div> : null}
                            <div>建立時間：{formatDateTime(menu.createdAt)}</div>
                            <div>最後更新：{formatDateTime(menu.updatedAt)}</div>
                            {menu.phone ? <div>電話：{menu.phone}</div> : null}
                            {menu.address ? <div>地址：{menu.address}</div> : null}
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
                                {displayPublicUrl}
                              </a>
                            </div>
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
  <ActionButton href={`/dashboard/${menu.id}`} label="編輯" />

  <DeskCardButton
    restaurant={menu.restaurant || "餐廳菜單"}
    publicUrl={publicUrl}
    theme={(menu.theme ?? "dark") as "dark" | "light" | "warm" | "ocean" | "forest" | "rose"}
    logoDataUrl={menu.logoDataUrl ?? ""}
    phone={menu.phone ?? ""}
    hours={menu.hours ?? ""}
  />

  <DeleteButton id={menu.id} publicUrl={publicUrl} />
</div>
                    </div>
                  </div>
                );
              })
            )}
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 14,
  border: "none",
  background: "#fff",
  color: "#000",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const ghostButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 18px",
  borderRadius: 14,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  boxSizing: "border-box",
};