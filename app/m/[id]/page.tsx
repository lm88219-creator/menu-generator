import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("menu page fetch error:", error);
  }

  if (!data) {
    return (
      <main
        style={{
          padding: 40,
          color: "white",
          background: "black",
          minHeight: "100vh",
        }}
      >
        <h1>找不到菜單</h1>
        <br />
        <Link href="/">回生成器</Link>
      </main>
    );
  }

  const items = String(data.menu_text || "")
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean)
    .map((line: string) => {
      const parts = line.split(/\s+/);
      const price = parts.pop() ?? "";
      const name = parts.join(" ");
      return { name, price };
    });

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
      <h1>{data.restaurant}</h1>

      <div style={{ marginTop: 10 }}>
        {data.phone && <div>電話：{data.phone}</div>}
        {data.address && <div>地址：{data.address}</div>}
        {data.hours && <div>營業時間：{data.hours}</div>}
      </div>

      <div style={{ marginTop: 30 }}>
        {items.map((item: { name: string; price: string }, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #333",
              padding: "10px 0",
            }}
          >
            <span>{item.name}</span>
            <span>{item.price}</span>
          </div>
        ))}
      </div>
    </main>
  );
}