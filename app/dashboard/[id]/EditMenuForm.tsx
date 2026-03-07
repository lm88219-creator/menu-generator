"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

type ThemeType = "dark" | "light" | "warm" | "ocean" | "forest" | "rose";

type InitialData = {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  menuText: string;
  theme: ThemeType;
  logoDataUrl: string;
  slug?: string;
  isPublished?: boolean;
};

type MenuRow = {
  category: string;
  name: string;
  price: string;
  note: string;
  soldOut: boolean;
};

function normalizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-\s]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function menuTextToRows(raw: string): MenuRow[] {
  const rows: MenuRow[] = [];
  let currentCategory = "精選菜單";
  raw.split("\n").map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const parts = line.split(/\s+/);
    if (parts.length === 1) {
      currentCategory = line.replace(/^#/, "");
      return;
    }
    const soldOut = /售完/i.test(line);
    const clean = line.replace(/(?:\(|（)?售完(?:\)|）)?/g, "").trim();
    const match = clean.match(/^(.*?)(?:\s+)(\d+)(?:\s*[|｜\/／-]\s*(.+))?$/);
    rows.push({ category: currentCategory, name: match?.[1] ?? clean, price: match?.[2] ?? "", note: match?.[3] ?? "", soldOut });
  });
  return rows.length ? rows : [{ category: "精選菜單", name: "", price: "", note: "", soldOut: false }];
}

function rowsToMenuText(rows: MenuRow[]) {
  const cleaned = rows.filter((row) => row.name.trim());
  let currentCategory = "";
  const lines: string[] = [];
  cleaned.forEach((row) => {
    const category = row.category.trim() || "精選菜單";
    if (category !== currentCategory) {
      lines.push(category);
      currentCategory = category;
    }
    const segments = [row.name.trim()];
    if (row.price.trim()) segments.push(row.price.trim());
    if (row.note.trim()) segments.push(`｜ ${row.note.trim()}`);
    if (row.soldOut) segments.push("售完");
    lines.push(segments.join(" "));
  });
  return lines.join("\n");
}

function getPublicBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  return typeof window === "undefined" ? "" : window.location.origin;
}

function expandTables(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return [] as string[];
  const range = trimmed.match(/^(\d+)\s*[~\-]\s*(\d+)\s*桌?$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    const [min, max] = start <= end ? [start, end] : [end, start];
    return Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
  }
  return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function EditMenuForm({ id, initialData }: { id: string; initialData: InitialData }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(initialData.restaurant);
  const [phone, setPhone] = useState(initialData.phone);
  const [address, setAddress] = useState(initialData.address);
  const [hours, setHours] = useState(initialData.hours);
  const [menuText, setMenuText] = useState(initialData.menuText);
  const [theme, setTheme] = useState<ThemeType>(initialData.theme);
  const [logoDataUrl, setLogoDataUrl] = useState(initialData.logoDataUrl);
  const [slug, setSlug] = useState(initialData.slug ?? "");
  const [isPublished, setIsPublished] = useState(initialData.isPublished !== false);
  const [mode, setMode] = useState<"text" | "form">("text");
  const [rows, setRows] = useState<MenuRow[]>(() => menuTextToRows(initialData.menuText));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tableInput, setTableInput] = useState("A1,A2,A3");

  const safeSlug = normalizeSlug(slug || restaurant);
  const publicPath = `/uu/menu/${encodeURIComponent(safeSlug || id)}`;
  const publicUrl = `${getPublicBaseUrl()}${publicPath}`;
  const tableLinks = expandTables(tableInput);

  const currentTheme = useMemo(() => ({ text: theme === "dark" ? "#fff" : "#111", sub: theme === "dark" ? "#a9a9a9" : "#666", card: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", inputBg: theme === "dark" ? "rgba(255,255,255,0.05)" : "#fff" }), [theme]);

  function syncToForm() {
    setRows(menuTextToRows(menuText));
    setMode("form");
  }

  function syncToText(nextRows = rows) {
    setMenuText(rowsToMenuText(nextRows));
    setMode("text");
  }

  function updateRow(index: number, patch: Partial<MenuRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { category: prev[prev.length - 1]?.category || "精選菜單", name: "", price: "", note: "", soldOut: false }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("請上傳圖片檔");
    if (file.size > 1024 * 1024) return alert("Logo 請控制在 1MB 內");
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    const finalMenuText = mode === "form" ? rowsToMenuText(rows) : menuText;
    if (!restaurant.trim()) return alert("請輸入餐廳名稱");
    if (!finalMenuText.trim()) return alert("請輸入菜單內容");
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restaurant, phone, address, hours, menuText: finalMenuText, theme, logoDataUrl, customSlug: slug, isPublished }) });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || "更新失敗");
      setMenuText(finalMenuText);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20 }}>
      <section style={{ borderRadius: 24, padding: 22, background: currentTheme.card, border: currentTheme.border }}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input value={restaurant} onChange={(e) => { setRestaurant(e.target.value); if (!slug) setSlug(normalizeSlug(e.target.value)); }} placeholder="餐廳名稱" style={inputStyle(currentTheme)} />
            <input value={slug} onChange={(e) => setSlug(normalizeSlug(e.target.value))} placeholder="網址代號 slug" style={inputStyle(currentTheme)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="電話" style={inputStyle(currentTheme)} />
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="營業時間" style={inputStyle(currentTheme)} />
          </div>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="地址" style={inputStyle(currentTheme)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
            <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)} style={inputStyle(currentTheme)}>
              <option value="dark">黑色餐廳風</option><option value="light">簡約白色</option><option value="warm">溫暖咖啡風</option><option value="ocean">海洋清新風</option><option value="forest">森林自然風</option><option value="rose">玫瑰奶茶風</option>
            </select>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: currentTheme.text }}><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> 上架公開</label>
          </div>
          <label style={{ color: currentTheme.sub, fontSize: 14 }}>Logo（1MB 內）<input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "block", marginTop: 8 }} /></label>
          {logoDataUrl ? <button onClick={() => setLogoDataUrl("")} style={miniButton}>移除 Logo</button> : null}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22, marginBottom: 12, flexWrap: "wrap" }}>
          <button onClick={() => setMode("text")} style={mode === "text" ? activeTab : tabStyle}>文字輸入</button>
          <button onClick={syncToForm} style={mode === "form" ? activeTab : tabStyle}>表單輸入</button>
          {mode === "form" ? <button onClick={() => syncToText()} style={tabStyle}>表單轉文字</button> : null}
        </div>

        {mode === "text" ? (
          <textarea value={menuText} onChange={(e) => setMenuText(e.target.value)} rows={18} placeholder={`熱炒\n炒蝦球 200\n炒螺肉 120`} style={{ ...inputStyle(currentTheme), minHeight: 380, resize: "vertical" }} />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((row, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.65fr 1fr auto auto", gap: 8, alignItems: "center" }}>
                <input value={row.category} onChange={(e) => updateRow(index, { category: e.target.value })} placeholder="分類" style={smallInput(currentTheme)} />
                <input value={row.name} onChange={(e) => updateRow(index, { name: e.target.value })} placeholder="品名" style={smallInput(currentTheme)} />
                <input value={row.price} onChange={(e) => updateRow(index, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="價格" style={smallInput(currentTheme)} />
                <input value={row.note} onChange={(e) => updateRow(index, { note: e.target.value })} placeholder="備註" style={smallInput(currentTheme)} />
                <label style={{ color: currentTheme.text, fontSize: 13 }}><input type="checkbox" checked={row.soldOut} onChange={(e) => updateRow(index, { soldOut: e.target.checked })} /> 售完</label>
                <button onClick={() => removeRow(index)} style={miniDanger}>刪除</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={addRow} style={miniButton}>＋ 新增品項</button>
              <button onClick={() => syncToText(rows)} style={miniButton}>同步回文字</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          <button onClick={handleSave} disabled={saving} style={saveButton}>{saving ? "儲存中..." : saved ? "已儲存" : "儲存變更"}</button>
          <Link href={publicPath} target="_blank" style={previewButton}>查看公開頁</Link>
        </div>
      </section>

      <section style={{ display: "grid", gap: 20 }}>
        <div style={{ borderRadius: 24, padding: 22, background: currentTheme.card, border: currentTheme.border }}>
          <div style={{ color: currentTheme.sub, fontSize: 13, marginBottom: 10 }}>公開網址</div>
          <div style={{ wordBreak: "break-all", color: currentTheme.text, fontWeight: 700 }}>{publicUrl}</div>
          <div style={{ marginTop: 12, color: currentTheme.sub, fontSize: 13 }}>slug 只允許 a-z / 0-9 / -</div>
          <div style={{ marginTop: 16 }}><QRCodeCanvas value={publicUrl} size={180} includeMargin /></div>
        </div>

        <div style={{ borderRadius: 24, padding: 22, background: currentTheme.card, border: currentTheme.border }}>
          <h3 style={{ margin: 0, marginBottom: 12 }}>桌號 QR 產生</h3>
          <input value={tableInput} onChange={(e) => setTableInput(e.target.value)} placeholder="A1,A2,A3 或 1~20桌" style={inputStyle(currentTheme)} />
          <div style={{ display: "grid", gap: 10, marginTop: 14, maxHeight: 380, overflow: "auto" }}>
            {tableLinks.map((table) => {
              const url = `${publicUrl}?table=${encodeURIComponent(table)}`;
              return (
                <div key={table} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, alignItems: "center", border: currentTheme.border, borderRadius: 18, padding: 12 }}>
                  <QRCodeCanvas value={url} size={72} includeMargin />
                  <div>
                    <div style={{ fontWeight: 800, color: currentTheme.text }}>桌號 {table}</div>
                    <div style={{ color: currentTheme.sub, fontSize: 12, wordBreak: "break-all" }}>{url}</div>
                  </div>
                </div>
              );
            })}
            {!tableLinks.length ? <div style={{ color: currentTheme.sub }}>輸入桌號後會在這裡產生 QR。</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

const tabStyle: React.CSSProperties = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" };
const activeTab: React.CSSProperties = { ...tabStyle, background: "#fff", color: "#000", fontWeight: 800 };
const saveButton: React.CSSProperties = { padding: "12px 18px", borderRadius: 14, border: "none", background: "#fff", color: "#000", cursor: "pointer", fontWeight: 800 };
const previewButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", color: "#fff", textDecoration: "none", fontWeight: 700 };
const miniButton: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" };
const miniDanger: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,120,120,0.24)", background: "rgba(255,80,80,0.10)", color: "#ffd4d4", cursor: "pointer" };
function inputStyle(theme: { text: string; inputBg: string }) { return { width: "100%", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: theme.inputBg, color: theme.text, fontSize: 15, outline: "none", boxSizing: "border-box" } as React.CSSProperties; }
function smallInput(theme: { text: string; inputBg: string }) { return { ...inputStyle(theme), padding: "10px 12px", fontSize: 14 }; }
