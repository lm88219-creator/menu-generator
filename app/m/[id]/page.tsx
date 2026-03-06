import { getMenu } from "@/lib/store"
import Link from "next/link"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = getMenu(id)

  if (!data) {
    return (
      <main style={{ padding: 40, color: "white", background: "black" }}>
        找不到菜單
        <br />
        <Link href="/">回生成器</Link>
      </main>
    )
  }

  const lines = data.menuText.split("\n")

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
  {lines.map((line: string, i: number) => {
    const parts = line.trim().split(" ")
    const price = parts.pop() ?? ""
    const itemName = parts.join(" ")

    return (
      <div
        key={i}
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #333",
          padding: "10px 0",
        }}
      >
        <span>{itemName}</span>
        <span>{price}</span>
      </div>
    )
  })}
</div>
    </main>
  )
}