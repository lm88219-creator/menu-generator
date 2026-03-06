export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMenu } from "@/lib/store";
import EditMenuForm from "./EditMenuForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DashboardEditPage({ params }: PageProps) {
  const { id } = await params;
  const menu = await getMenu(id);

  if (!menu) {
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
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              borderRadius: 28,
              padding: 28,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                color: "#bdbdbd",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              Menu Editor
            </div>

            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>
              找不到這份菜單
            </h1>

            <p style={{ color: "#a9a9a9", lineHeight: 1.8, marginTop: 12 }}>
              這份菜單可能已被刪除，或網址 ID 不存在。
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <Link href="/dashboard" style={ghostButtonStyle}>
                ← 返回後台
              </Link>
              <Link href="/" style={primaryButtonStyle}>
                ＋ 新增菜單
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const publicPath = menu.slug ? `/menu/${encodeURIComponent(menu.slug)}` : `/m/${id}`;

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
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
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
              Menu Editor Pro
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.2,
                fontWeight: 800,
              }}
            >
              編輯菜單
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
              修改餐廳資訊、菜單內容、Logo 與主題風格，並即時預覽公開頁效果。
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard" style={ghostButtonStyle}>
              ← 返回後台
            </Link>
            <Link href={publicPath} target="_blank" style={primaryButtonStyle}>
              查看公開頁
            </Link>
          </div>
        </div>

        <EditMenuForm
          id={id}
          initialData={{
            restaurant: menu.restaurant ?? "",
            phone: menu.phone ?? "",
            address: menu.address ?? "",
            hours: menu.hours ?? "",
            menuText: menu.menuText ?? "",
            theme: menu.theme ?? "dark",
            logoDataUrl: menu.logoDataUrl ?? "",
            slug: menu.slug ?? "",
          }}
        />
      </div>
    </main>
  );
}

const ghostButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
};

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: 14,
  textDecoration: "none",
  background: "#fff",
  color: "#000",
  fontSize: 14,
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
};