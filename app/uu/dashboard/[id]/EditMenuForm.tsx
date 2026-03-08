"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { parseMenuText, normalizeSlug } from "@/lib/menu";

export type ThemeType = "dark" | "light" | "warm" | "ocean" | "forest" | "rose" | "classic";

type InitialData = {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  menuText: string;
  theme: ThemeType;
  logoDataUrl?: string;
  slug?: string;
  isPublished?: boolean;
};

type MenuItemForm = {
  uid: string;
  category: string;
  name: string;
  price: string;
  note: string;
  soldOut: boolean;
};

const THEME_OPTIONS: Array<{ value: ThemeType; label: string; desc: string; accent: string; preview: [string, string, string] }> = [
  { value: "dark", label: "深色經典", desc: "適合熱炒、宵夜、餐酒館。對比清楚、穩重耐看。", accent: "#6ea8ff", preview: ["#101723", "#172235", "#0d1420"] },
  { value: "light", label: "簡約白", desc: "閱讀感最乾淨，適合一般餐廳與簡潔菜單。", accent: "#d6b267", preview: ["#f7f8fa", "#ffffff", "#eef2f7"] },
  { value: "warm", label: "暖木咖啡", desc: "偏溫暖餐飲感，適合咖啡館、小吃、家常風格。", accent: "#d08a54", preview: ["#2d211a", "#412d21", "#221812"] },
  { value: "ocean", label: "海洋清新", desc: "色調明亮清爽，適合海鮮、健康餐、早午餐。", accent: "#4da3ff", preview: ["#10202d", "#173247", "#0d1923"] },
  { value: "forest", label: "森林自然", desc: "較有自然感，適合便當、蔬食、手作餐飲。", accent: "#6fb17a", preview: ["#142118", "#203126", "#101813"] },
  { value: "rose", label: "玫瑰奶茶", desc: "較柔和有質感，適合甜點、飲料與輕食。", accent: "#d78aa4", preview: ["#2b1a21", "#3a222b", "#1f1418"] },
  { value: "classic", label: "經典餐館", desc: "米白紙感搭配餐館紅，適合熱炒、鵝肉、小吃與家常菜。", accent: "#b91c1c", preview: ["#fbf7f1", "#ffffff", "#f6ebe6"] },
];

function createFormItem(partial?: Partial<MenuItemForm>): MenuItemForm {
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: partial?.category ?? "精選菜單",
    name: partial?.name ?? "",
    price: partial?.price ?? "",
    note: partial?.note ?? "",
    soldOut: partial?.soldOut ?? false,
  };
}

function toFormItems(menuText: string): MenuItemForm[] {
  const parsed = parseMenuText(menuText);
  return parsed.length
    ? parsed.map((item) =>
        createFormItem({
          category: item.category || "精選菜單",
          name: item.name || "",
          price: item.price || "",
          note: item.note || "",
          soldOut: Boolean(item.soldOut),
        })
      )
    : [createFormItem()];
}

function toMenuText(items: MenuItemForm[]) {
  const groups = new Map<string, MenuItemForm[]>();
  items.forEach((item) => {
    const category = item.category.trim() || "精選菜單";
    if (!item.name.trim() && !item.price.trim() && !item.note.trim()) return;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category)!.push(item);
  });

  const sections: string[] = [];
  groups.forEach((groupItems, category) => {
    sections.push(category);
    groupItems.forEach((item) => {
      const name = item.name.trim();
      const price = item.price.trim();
      const note = item.note.trim();
      const soldOut = item.soldOut ? " 售完" : "";
      if (price && note) sections.push(`${name} ${price} | ${note}${soldOut}`.trim());
      else if (price) sections.push(`${name} ${price}${soldOut}`.trim());
      else if (note) sections.push(`${name} | ${note}${soldOut}`.trim());
      else sections.push(`${name}${soldOut}`.trim());
    });
    sections.push("");
  });

  return sections.join("\n").trim();
}

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function sanitizeSlugInput(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function parseDeskInput(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[,，\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function getPreviewTokens(theme: ThemeType) {
  if (theme === "dark") return {
    shell: "linear-gradient(180deg, #0a1018 0%, #111927 100%)",
    panel: "rgba(16, 23, 35, 0.92)",
    soft: "rgba(143, 183, 255, 0.12)",
    border: "rgba(255,255,255,0.08)",
    accent: "#8fb7ff",
    accentSoft: "rgba(143,183,255,0.16)",
    title: "#f4f8ff",
    text: "#eef4ff",
    muted: "#9baccc",
    hero: "linear-gradient(135deg, rgba(143,183,255,0.2), rgba(10,16,24,0.1))",
    priceBg: "rgba(143,183,255,0.12)",
    surface: "rgba(7, 11, 18, 0.66)",
    section: "#d6e4ff",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "warm") return {
    shell: "linear-gradient(180deg, #211812 0%, #32241a 100%)",
    panel: "rgba(65, 46, 33, 0.92)",
    soft: "rgba(208, 138, 84, 0.16)",
    border: "rgba(255,255,255,0.08)",
    accent: "#d9a06e",
    accentSoft: "rgba(217,160,110,0.16)",
    title: "#fff6ee",
    text: "#fff4ea",
    muted: "#dcc0a8",
    hero: "linear-gradient(135deg, rgba(217,160,110,0.22), rgba(62,43,31,0.12))",
    priceBg: "rgba(255,237,219,0.1)",
    surface: "rgba(38, 26, 18, 0.6)",
    section: "#ffe1c3",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "ocean") return {
    shell: "linear-gradient(180deg, #081721 0%, #102838 100%)",
    panel: "rgba(17, 41, 58, 0.94)",
    soft: "rgba(91, 193, 255, 0.16)",
    border: "rgba(255,255,255,0.08)",
    accent: "#76d1ff",
    accentSoft: "rgba(118,209,255,0.16)",
    title: "#effaff",
    text: "#eef9ff",
    muted: "#acd0df",
    hero: "linear-gradient(135deg, rgba(118,209,255,0.22), rgba(11,28,40,0.12))",
    priceBg: "rgba(118,209,255,0.12)",
    surface: "rgba(8, 20, 30, 0.58)",
    section: "#dff6ff",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "forest") return {
    shell: "linear-gradient(180deg, #0d1510 0%, #19251b 100%)",
    panel: "rgba(25, 39, 29, 0.94)",
    soft: "rgba(137, 209, 151, 0.15)",
    border: "rgba(255,255,255,0.08)",
    accent: "#9bdfaa",
    accentSoft: "rgba(155,223,170,0.16)",
    title: "#f1fff4",
    text: "#f0fff4",
    muted: "#b4cfba",
    hero: "linear-gradient(135deg, rgba(155,223,170,0.2), rgba(14,24,17,0.12))",
    priceBg: "rgba(155,223,170,0.12)",
    surface: "rgba(11, 20, 13, 0.56)",
    section: "#dff8e5",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "rose") return {
    shell: "linear-gradient(180deg, #171015 0%, #251820 100%)",
    panel: "rgba(49, 31, 38, 0.94)",
    soft: "rgba(227, 160, 182, 0.16)",
    border: "rgba(255,255,255,0.08)",
    accent: "#f0b2c7",
    accentSoft: "rgba(240,178,199,0.16)",
    title: "#fff4f8",
    text: "#fff2f6",
    muted: "#dfb8c7",
    hero: "linear-gradient(135deg, rgba(240,178,199,0.22), rgba(38,24,31,0.12))",
    priceBg: "rgba(240,178,199,0.12)",
    surface: "rgba(28, 17, 22, 0.56)",
    section: "#ffe2eb",
    line: "rgba(255,255,255,0.06)",
  };
  if (theme === "classic") return {
    shell: "radial-gradient(circle at top, #ffffff 0%, #fbf7f1 45%, #f6f0e6 100%)",
    panel: "rgba(255, 255, 255, 0.92)",
    soft: "rgba(185, 28, 28, 0.08)",
    border: "rgba(17,24,39,0.08)",
    accent: "#b91c1c",
    accentSoft: "rgba(185,28,28,0.12)",
    title: "#111827",
    text: "#1f2937",
    muted: "#6b7280",
    hero: "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.70))",
    priceBg: "rgba(185,28,28,0.08)",
    surface: "rgba(246, 235, 230, 0.72)",
    section: "#7a1212",
    line: "rgba(17,24,39,0.08)",
  };
  return {
    shell: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
    panel: "rgba(255, 255, 255, 0.96)",
    soft: "rgba(211, 177, 107, 0.18)",
    border: "rgba(15,23,42,0.08)",
    accent: "#c7922e",
    accentSoft: "rgba(199,146,46,0.14)",
    title: "#243244",
    text: "#263244",
    muted: "#728097",
    hero: "linear-gradient(135deg, rgba(199,146,46,0.16), rgba(255,255,255,0.82))",
    priceBg: "rgba(199,146,46,0.12)",
    surface: "rgba(245, 247, 250, 0.92)",
    section: "#866225",
    line: "rgba(15,23,42,0.07)",
  };
}

export default function EditMenuForm({ id, initialData }: { id: string; initialData: InitialData }) {
  const [restaurant, setRestaurant] = useState(initialData.restaurant);
  const [phone, setPhone] = useState(initialData.phone);
  const [address, setAddress] = useState(initialData.address);
  const [hours, setHours] = useState(initialData.hours);
  const [formItems, setFormItems] = useState<MenuItemForm[]>(() => toFormItems(initialData.menuText));
  const [menuText, setMenuText] = useState(initialData.menuText);
  const [quickInput, setQuickInput] = useState(initialData.menuText);
  const [bulkDirty, setBulkDirty] = useState(false);
  const [theme, setTheme] = useState<ThemeType>(initialData.theme || "dark");
  const [logoDataUrl, setLogoDataUrl] = useState(initialData.logoDataUrl || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [isPublished, setIsPublished] = useState(initialData.isPublished !== false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deskInput, setDeskInput] = useState("");
  const [selectedDesk, setSelectedDesk] = useState("");

  const safeSlug = normalizeSlug(slug || restaurant) || id;
  const publicPath = `/uu/menu/${safeSlug}`;
  const publicUrl = `${getBaseUrl()}${publicPath}`;
  const deskCodes = useMemo(() => parseDeskInput(deskInput), [deskInput]);
  const soldOutCount = formItems.filter((item) => item.soldOut).length;
  const activeCount = formItems.filter((item) => item.name.trim() && !item.soldOut).length;
  const totalCount = formItems.filter((item) => item.name.trim()).length;
  const categorySummary = useMemo(() => {
    const map = new Map<string, number>();
    formItems.forEach((item) => {
      const name = item.name.trim();
      if (!name) return;
      const key = item.category.trim() || "精選菜單";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [formItems]);
  const selectedTheme = THEME_OPTIONS.find((item) => item.value === theme) || THEME_OPTIONS[0];
  const previewTokens = getPreviewTokens(theme);
  const previewItems = formItems.filter((item) => item.name.trim()).slice(0, 5);
  const previewCategory = categorySummary[0]?.name || "主廚推薦";
  const previewSubtitle = address || phone || hours || "今日精選菜單";
  const deskStorageKey = `uu-desk-codes:${id}`;
  const selectedDeskUrl = selectedDesk ? `${publicUrl}?table=${encodeURIComponent(selectedDesk)}` : "";

  useEffect(() => {
    const nextMenuText = toMenuText(formItems);
    if (nextMenuText !== menuText) setMenuText(nextMenuText);
    if (!bulkDirty && nextMenuText !== quickInput) setQuickInput(nextMenuText);
  }, [formItems, menuText, quickInput, bulkDirty]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(deskStorageKey);
    if (saved) setDeskInput(saved);
  }, [deskStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (deskInput.trim()) window.localStorage.setItem(deskStorageKey, deskInput);
    else window.localStorage.removeItem(deskStorageKey);
  }, [deskInput, deskStorageKey]);

  useEffect(() => {
    if (!deskCodes.length) {
      setSelectedDesk("");
      return;
    }
    if (!selectedDesk || !deskCodes.includes(selectedDesk)) {
      setSelectedDesk(deskCodes[0]);
    }
  }, [deskCodes, selectedDesk]);

  function pushMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  }

  function updateFormItem(index: number, patch: Partial<MenuItemForm>) {
    setFormItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function handleQuickInputChange(value: string) {
    setQuickInput(value);
    setBulkDirty(true);
  }

  function applyQuickInput() {
    const nextItems = toFormItems(quickInput);
    setFormItems(nextItems);
    const nextMenuText = toMenuText(nextItems);
    setMenuText(nextMenuText);
    setQuickInput(nextMenuText);
    setBulkDirty(false);
    pushMessage("已套用整排輸入");
  }

  function addItem(afterCategory?: string) {
    setFormItems((current) => [...current, createFormItem({ category: afterCategory || current[current.length - 1]?.category || "精選菜單" })]);
  }

  function duplicateItem(index: number) {
    setFormItems((current) => {
      const target = current[index];
      if (!target) return current;
      const next = [...current];
      next.splice(index + 1, 0, createFormItem({ ...target }));
      return next;
    });
  }

  function removeItem(index: number) {
    setFormItems((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [createFormItem()];
    });
  }

  async function handleSave() {
    const latestItems = bulkDirty ? toFormItems(quickInput) : formItems;
    if (bulkDirty) {
      setFormItems(latestItems);
      const syncedMenuText = toMenuText(latestItems);
      setMenuText(syncedMenuText);
      setQuickInput(syncedMenuText);
      setBulkDirty(false);
    }
    const finalMenuText = toMenuText(latestItems);

    if (!restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return;
    }
    if (!finalMenuText.trim()) {
      alert("請至少新增一個菜單品項");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant,
          phone,
          address,
          hours,
          menuText: finalMenuText,
          theme,
          logoDataUrl,
          customSlug: slug,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "更新失敗");
        return;
      }
      if (data?.data?.slug) setSlug(data.data.slug);
      setMenuText(finalMenuText);
      pushMessage("已成功儲存");
    } catch {
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  }

  async function copyText(value: string, okText: string) {
    try {
      await navigator.clipboard.writeText(value);
      pushMessage(okText);
    } catch {
      alert("複製失敗");
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請上傳圖片檔");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <div className="editor-shell-v6">
      {message ? <div className="floating-toast">{message}</div> : null}

      <div className="sticky-bar">
        <div className="sticky-bar__meta">
          <div>
            <strong>{restaurant || "未命名店家"}</strong>
            <span>{isPublished ? "公開中" : "未公開"} ・ {totalCount} 項品項</span>
          </div>
        </div>
        <div className="sticky-bar__actions">
          <button type="button" className="btn btn-secondary" onClick={() => copyText(publicUrl, "已複製公開網址")}>複製網址</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-main">
          <section id="shop-info" className="panel">
            <div className="section-head">
              <div>
                <span className="eyebrow">01</span>
                <h2>店家資訊</h2>
                <p>先把公開頁最常用到的資訊集中整理，桌機與手機都會更好閱讀。</p>
              </div>
              <label className="publish-pill">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                <span>{isPublished ? "公開顯示中" : "目前下架"}</span>
              </label>
            </div>

            <div className="hero-summary">
              <div className="hero-summary__title">
                <strong>{restaurant || "未命名店家"}</strong>
                <span>{previewSubtitle}</span>
              </div>
              <div className="hero-summary__chips">
                <span className="chip chip-accent">/{safeSlug}</span>
                <span className="chip">{selectedTheme.label}</span>
                <span className={`chip ${isPublished ? "chip-good" : "chip-muted"}`}>{isPublished ? "公開中" : "未公開"}</span>
              </div>
            </div>

            <div className="two-col">
              <div className="stack-card">
                <div className="field-grid two-up">
                  <Field label="餐廳名稱">
                    <input className="input" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} placeholder="例如：友愛熱炒" />
                  </Field>
                  <Field label="網址 slug" hint="可輸入英文、數字與 -，公開網址會沿用這組 slug。">
                    <input className="input" value={slug} onChange={(e) => setSlug(sanitizeSlugInput(e.target.value))} placeholder="例如：you-ai-re-chao" />
                  </Field>
                  <Field label="電話">
                    <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="例如：0912-345-678" />
                  </Field>
                  <Field label="營業時間">
                    <input className="input" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="例如：17:00 - 01:00" />
                  </Field>
                </div>
                <Field label="地址">
                  <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例如：嘉義市西區友愛路100號" />
                </Field>
              </div>

              <aside className="summary-card">
                <div className="summary-card__head">
                  <strong>公開頁資訊摘要</strong>
                  <span>儲存後會直接同步到客戶看到的公開頁。</span>
                </div>
                <div className="summary-list">
                  <SummaryRow label="公開網址" value={`/${safeSlug}`} />
                  <SummaryRow label="電話" value={phone || "未填寫"} />
                  <SummaryRow label="營業時間" value={hours || "未填寫"} />
                  <SummaryRow label="地址" value={address || "未填寫"} multiline />
                </div>
              </aside>
            </div>
          </section>

          <section id="menu-items" className="panel">
            <div className="section-head compact-gap">
              <div>
                <span className="eyebrow">02</span>
                <h2>菜單品項</h2>
                <p>左邊適合一次貼整份菜單，右邊適合細修。兩邊邏輯不變，但整體間距與層次更清楚。</p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => addItem()}>新增品項</button>
            </div>

            <div className="stats-row">
              <StatCard label="供應中" value={String(activeCount)} />
              <StatCard label="售完" value={String(soldOutCount)} />
              <StatCard label="分類" value={String(categorySummary.length)} />
              <StatCard label="總品項" value={String(totalCount)} />
            </div>

            <div className="category-row">
              {categorySummary.length ? categorySummary.slice(0, 8).map((category) => (
                <span key={category.name} className="chip">{category.name} ・ {category.count}</span>
              )) : <span className="chip chip-muted">尚未建立分類</span>}
            </div>

            <div className="menu-layout">
              <section className="card card-soft">
                <div className="card-head card-head--row">
                  <div>
                    <strong>快速輸入整份菜單</strong>
                    <p>分類請獨立一行，品項後面接價格，備註可用「|」分隔。</p>
                  </div>
                  <div className="mini-actions">
                    <button type="button" className="btn btn-secondary" onClick={applyQuickInput}>套用到逐項編輯</button>
                  </div>
                </div>

                <div className={`sync-note ${bulkDirty ? "is-warning" : ""}`}>
                  {bulkDirty ? "目前有尚未套用到逐項編輯的內容" : "左側內容已和逐項編輯同步"}
                </div>

                <textarea
                  className="textarea textarea-large"
                  value={quickInput}
                  onChange={(e) => handleQuickInputChange(e.target.value)}
                  placeholder={`例如：\n鵝肉\n鹽水鵝肉 200\n麻油鵝肉 220\n\n主食\n炒飯 80\n炒麵 80`}
                />

                <div className="note-grid">
                  <div className="note-item">貼上整份內容後按「套用到逐項編輯」，右邊就會自動整理。</div>
                  <div className="note-item">直接按儲存也可以，系統會先自動套用再儲存。</div>
                </div>
              </section>

              <section className="card structured-card">
                <div className="card-head">
                  <strong>逐項編輯</strong>
                  <p>這裡適合改價格、調分類、標售完，手機上也保留完整操作。</p>
                </div>

                <div className="items-stack">
                  {formItems.map((item, index) => (
                    <article key={item.uid} className="item-card">
                      <div className="item-top">
                        <span className="item-index">#{index + 1}</span>
                        <label className={`sold-pill ${item.soldOut ? "is-active" : ""}`}>
                          <input type="checkbox" checked={item.soldOut} onChange={(e) => updateFormItem(index, { soldOut: e.target.checked })} />
                          <span>{item.soldOut ? "已售完" : "供應中"}</span>
                        </label>
                      </div>

                      <div className="item-grid">
                        <Field label="分類">
                          <input className="input" value={item.category} onChange={(e) => updateFormItem(index, { category: e.target.value })} placeholder="分類" />
                        </Field>
                        <Field label="菜名">
                          <input className="input input-name" value={item.name} onChange={(e) => updateFormItem(index, { name: e.target.value })} placeholder="例如：炒飯" />
                        </Field>
                        <Field label="價格">
                          <div className="price-wrap">
                            <span>$</span>
                            <input className="input price-input" value={item.price} onChange={(e) => updateFormItem(index, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="80" />
                          </div>
                        </Field>
                        <Field label="備註">
                          <input className="input" value={item.note} onChange={(e) => updateFormItem(index, { note: e.target.value })} placeholder="例如：附湯、辣度可調整" />
                        </Field>
                      </div>

                      <div className="item-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => duplicateItem(index)}>複製</button>
                        <button type="button" className="btn btn-secondary" onClick={() => addItem(item.category)}>同分類新增</button>
                        <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>刪除</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>

          <section id="appearance-settings" className="panel">
            <div className="section-head">
              <div>
                <span className="eyebrow">03</span>
                <h2>外觀設定</h2>
                <p>把主題、Logo 和公開頁預覽集中在同區，切換時更容易判斷整體風格。</p>
              </div>
            </div>

            <div className="appearance-layout">
              <div className="stack-card">
                <div className="card-head">
                  <strong>主題挑選</strong>
                  <p>切換後，右側預覽會立即同步色調、卡片層次與價格樣式。</p>
                </div>

                <div className="theme-picker">
                  {THEME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`theme-option ${theme === option.value ? "is-active" : ""}`}
                      onClick={() => setTheme(option.value)}
                    >
                      <div className="theme-preview-strip">
                        {option.preview.map((color, index) => (
                          <span key={`${option.value}-${index}`} style={{ background: color }} />
                        ))}
                      </div>
                      <div className="theme-copy">
                        <strong>{option.label}</strong>
                        <p>{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="stack-card">
                <div className="card-head">
                  <strong>Logo 設定</strong>
                  <p>建議使用正方形或圓形識別，公開頁會更完整。</p>
                </div>

                {logoDataUrl ? (
                  <div className="logo-card">
                    <img src={logoDataUrl} alt="logo preview" className="logo-preview" />
                    <div className="logo-actions">
                      <label className="upload-box">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} />
                        <span>更換 Logo</span>
                      </label>
                      <button type="button" className="btn btn-secondary" onClick={() => setLogoDataUrl("")}>移除 Logo</button>
                    </div>
                  </div>
                ) : (
                  <div className="logo-empty">
                    <label className="upload-box upload-box-full">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} />
                      <span>上傳 Logo</span>
                    </label>
                    <div className="note-item">沒有 Logo 也能正常顯示菜單，之後再補也可以。</div>
                  </div>
                )}
              </div>

              <div className="preview-card preview-card-full">
                <div className="card-head card-head--row">
                  <div>
                    <strong>客戶公開頁預覽</strong>
                    <p>{selectedTheme.label}</p>
                  </div>
                  <span className="accent-dot" style={{ background: selectedTheme.accent }} />
                </div>

                <div className="device-shell">
                  <div className="device-top"><span /><span /><span /></div>
                  <div className="public-preview" style={{ background: previewTokens.shell, color: previewTokens.text, borderColor: previewTokens.border }}>
                    <div className="public-hero" style={{ background: previewTokens.hero, borderColor: previewTokens.border }}>
                      <div className="public-badges">
                        <span style={{ background: previewTokens.accentSoft, color: previewTokens.accent }}>UU MENU</span>
                        <span style={{ background: previewTokens.panel, color: previewTokens.muted, borderColor: previewTokens.border }}>{selectedTheme.label}</span>
                      </div>
                      <strong style={{ color: previewTokens.title }}>{restaurant || "未命名店家"}</strong>
                      <span style={{ color: previewTokens.muted }}>{previewSubtitle}</span>
                    </div>

                    <div className="public-body" style={{ background: previewTokens.surface, borderColor: previewTokens.line }}>
                      <div className="public-section-row">
                        <span className="public-section-chip" style={{ background: previewTokens.soft, color: previewTokens.section }}>{previewCategory}</span>
                        <span style={{ color: previewTokens.muted }}>{logoDataUrl ? "Logo 已套用" : "文字版"}</span>
                      </div>

                      <div className="public-list">
                        {previewItems.length ? previewItems.map((item) => (
                          <div key={item.uid} className="public-item" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                            <div>
                              <strong style={{ color: previewTokens.title }}>{item.name.trim()}</strong>
                              <span style={{ color: previewTokens.muted }}>{item.note.trim() || item.category.trim() || "人氣推薦"}</span>
                            </div>
                            <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>{item.price.trim() ? `$${item.price.trim()}` : "$--"}</b>
                          </div>
                        )) : (
                          <div className="public-item" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                            <div>
                              <strong style={{ color: previewTokens.title }}>招牌炒飯</strong>
                              <span style={{ color: previewTokens.muted }}>先新增品項，這裡會同步預覽主題效果</span>
                            </div>
                            <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>$90</b>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="advanced-tools" className="panel">
            <div className="section-head">
              <div>
                <span className="eyebrow">04</span>
                <h2>進階工具</h2>
                <p>把分享、桌號與其他輔助工具集中到最後，不干擾主要編輯流程。</p>
              </div>
            </div>

            <div className="advanced-layout">
              <section className="card advanced-card">
                <div className="card-head">
                  <strong>桌號 QR 工具</strong>
                  <p>輸入桌號後，右側會立即顯示單一桌號的 QR 預覽，方便逐桌檢查。</p>
                </div>

                <div className="desk-layout">
                  <div className="stack-card stack-card--ghost">
                    <Field label="手動輸入桌號（用空白、逗號或換行分隔）">
                      <textarea
                        className="textarea"
                        value={deskInput}
                        onChange={(e) => setDeskInput(e.target.value)}
                        placeholder="例如：A1 A2 A3\nB1 B2\nVIP1"
                      />
                    </Field>

                    <div className="toolbar">
                      <span className="chip">共 {deskCodes.length} 組</span>
                      <div className="mini-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setDeskInput("")}>清空桌號</button>
                        <button type="button" className="btn btn-secondary" onClick={() => copyText(deskCodes.join(", "), "已複製桌號清單")} disabled={!deskCodes.length}>複製桌號清單</button>
                      </div>
                    </div>

                    {deskCodes.length ? (
                      <div className="desk-chip-grid">
                        {deskCodes.map((tableCode) => (
                          <button
                            key={tableCode}
                            type="button"
                            className={`desk-chip ${selectedDesk === tableCode ? "is-active" : ""}`}
                            onClick={() => setSelectedDesk(tableCode)}
                          >
                            {tableCode}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-box">
                        <strong>尚未輸入桌號</strong>
                        <p>有需要桌卡再輸入即可，沒有用到這個功能可以先略過。</p>
                      </div>
                    )}
                  </div>

                  <aside className="qr-card">
                    <div className="card-head">
                      <strong>目前預覽</strong>
                      <p>{selectedDesk ? `桌號 ${selectedDesk}` : "請先輸入桌號"}</p>
                    </div>
                    {selectedDesk ? (
                      <div className="qr-preview-wrap">
                        <div className="desk-title">桌號 {selectedDesk}</div>
                        <div className="qr-canvas-wrap"><QRCodeCanvas value={selectedDeskUrl} size={178} includeMargin level="H" /></div>
                        <div className="qr-url">{selectedDeskUrl}</div>
                        <button type="button" className="btn btn-primary btn-block" onClick={() => copyText(selectedDeskUrl, `已複製桌號 ${selectedDesk} 網址`)}>複製目前桌號網址</button>
                      </div>
                    ) : (
                      <div className="empty-box">
                        <strong>尚未選擇桌號</strong>
                        <p>輸入桌號後，右側會顯示單一桌號的 QR 預覽。</p>
                      </div>
                    )}
                  </aside>
                </div>
              </section>

              <section className="card quick-card">
                <div className="card-head">
                  <strong>快速工具</strong>
                  <p>保留真正常用的動作，桌機與手機都更順手。</p>
                </div>

                <div className="quick-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => copyText(publicUrl, "已複製公開網址")}>複製公開網址</button>
                  <a className="btn btn-secondary" href={publicPath} target="_blank" rel="noreferrer">開啟客戶公開頁</a>
                  <button type="button" className="btn btn-secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>回到頁面上方</button>
                </div>

                <div className="note-grid note-grid-single">
                  <div className="note-item">外觀設定區選的主題，客戶看到的公開菜單也會同步更新。</div>
                  <div className="note-item">桌號 QR 只有需要桌卡時再使用，平常編輯菜單可以直接略過。</div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .editor-shell-v6 {
          color: #e5ecf6;
        }
        .editor-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
        }
        .editor-main {
          display: grid;
          gap: 20px;
        }
        .panel,
        .card,
        .summary-card,
        .stack-card,
        .preview-card,
        .qr-card {
          background: linear-gradient(180deg, rgba(11, 18, 30, 0.88), rgba(11, 18, 30, 0.78));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 22px 44px rgba(0, 0, 0, 0.2);
        }
        .panel {
          padding: 22px;
        }
        .card,
        .summary-card,
        .stack-card,
        .preview-card,
        .qr-card {
          padding: 18px;
        }
        .sticky-bar {
          position: sticky;
          top: 12px;
          z-index: 20;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(7, 11, 18, 0.82);
          backdrop-filter: blur(14px);
        }
        .sticky-bar__meta strong,
        .section-head h2 {
          display: block;
          font-size: 22px;
          font-weight: 800;
          color: #f8fbff;
        }
        .sticky-bar__meta span,
        .section-head p,
        .card-head p,
        .summary-card__head span,
        .theme-copy p,
        .qr-url,
        .public-hero span,
        .public-item span,
        .summary-row span,
        .field small,
        .empty-box p,
        .hero-summary__title span {
          color: #9eacbf;
        }
        .sticky-bar__actions,
        .mini-actions,
        .item-actions,
        .toolbar,
        .quick-actions,
        .hero-summary__chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.06);
          color: #eef4ff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: rgba(59,130,246,0.45);
          color: white;
        }
        .btn-secondary {
          background: rgba(255,255,255,0.05);
        }
        .btn-danger {
          background: rgba(239, 68, 68, 0.12);
          color: #fecaca;
          border-color: rgba(239,68,68,0.2);
        }
        .btn-block {
          width: 100%;
        }
        .section-head,
        .card-head,
        .summary-card__head,
        .item-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }
        .section-head {
          margin-bottom: 18px;
        }
        .compact-gap {
          margin-bottom: 14px;
        }
        .eyebrow {
          display: inline-block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
          color: #7fb0ff;
        }
        .publish-pill,
        .sold-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 13px;
          font-weight: 700;
          color: #edf3fd;
          cursor: pointer;
        }
        .sold-pill.is-active {
          background: rgba(250, 204, 21, 0.12);
          color: #fde68a;
          border-color: rgba(250,204,21,0.2);
        }
        .publish-pill input,
        .sold-pill input,
        .upload-box input {
          display: none;
        }
        .hero-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 20px;
          margin-bottom: 16px;
          background: linear-gradient(135deg, rgba(59,130,246,0.18), rgba(14,23,38,0.35));
          border: 1px solid rgba(125, 170, 255, 0.18);
        }
        .hero-summary__title strong {
          display: block;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 4px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: #eaf1fb;
          font-size: 12px;
          font-weight: 700;
        }
        .chip-accent { background: rgba(59,130,246,0.16); border-color: rgba(59,130,246,0.24); }
        .chip-good { background: rgba(34,197,94,0.14); border-color: rgba(34,197,94,0.18); }
        .chip-muted { opacity: 0.72; }
        .two-col,
        .appearance-layout,
        .advanced-layout,
        .menu-layout,
        .desk-layout {
          display: grid;
          gap: 16px;
        }
        .two-col { grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr); }
        .appearance-layout { grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr); }
        .advanced-layout { grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr); }
        .menu-layout { grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr); align-items: start; }
        .desk-layout { grid-template-columns: minmax(0, 1fr) minmax(280px, 320px); align-items: start; }
        .stack-card,
        .summary-card,
        .card-soft,
        .structured-card,
        .advanced-card,
        .quick-card,
        .preview-card,
        .qr-card,
        .stack-card--ghost {
          display: grid;
          gap: 16px;
        }
        .stack-card--ghost {
          background: rgba(255,255,255,0.03);
          box-shadow: none;
        }
        .field-grid {
          display: grid;
          gap: 14px;
        }
        .field-grid.two-up {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .field {
          display: grid;
          gap: 8px;
        }
        .field > span {
          font-size: 13px;
          font-weight: 700;
          color: #d9e7fb;
        }
        .input,
        .textarea,
        select.input {
          width: 100%;
          min-height: 48px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #f5f8ff;
          outline: none;
          font-size: 15px;
          box-sizing: border-box;
        }
        .input::placeholder,
        .textarea::placeholder {
          color: #7f8ea4;
        }
        .textarea {
          min-height: 132px;
          resize: vertical;
        }
        .textarea-large {
          min-height: 440px;
        }
        .summary-list,
        .note-grid,
        .theme-picker,
        .items-stack,
        .public-list {
          display: grid;
          gap: 12px;
        }
        .summary-row {
          display: grid;
          gap: 6px;
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .summary-row strong {
          color: #f4f8ff;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }
        .stats-row,
        .category-row,
        .desk-chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
        }
        .stat-card {
          min-width: 124px;
          padding: 14px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .stat-card span {
          display: block;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .stat-card strong {
          color: #fff;
          font-size: 24px;
          font-weight: 800;
        }
        .sync-note,
        .note-item,
        .empty-box {
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          color: #dbe8fb;
          font-size: 13px;
          line-height: 1.55;
        }
        .sync-note.is-warning {
          background: rgba(250,204,21,0.1);
          color: #fde68a;
          border-color: rgba(250,204,21,0.18);
        }
        .item-card {
          padding: 16px;
          border-radius: 20px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.07);
          display: grid;
          gap: 14px;
        }
        .item-index {
          display: inline-flex;
          min-width: 40px;
          min-height: 32px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(59,130,246,0.14);
          color: #bfd7ff;
          font-size: 12px;
          font-weight: 800;
        }
        .item-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1.5fr 160px 1.2fr;
        }
        .input-name {
          min-width: 0;
        }
        .price-wrap {
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr);
          align-items: center;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          overflow: hidden;
        }
        .price-wrap span {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #a8c7ff;
          font-weight: 800;
          background: rgba(59,130,246,0.08);
        }
        .price-input {
          border: 0;
          border-radius: 0;
          background: transparent;
        }
        .theme-option {
          display: grid;
          grid-template-columns: 88px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
          width: 100%;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: inherit;
          text-align: left;
          cursor: pointer;
        }
        .theme-option.is-active {
          border-color: rgba(96, 165, 250, 0.34);
          background: rgba(59,130,246,0.1);
        }
        .theme-preview-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .theme-preview-strip span {
          display: block;
          height: 52px;
          border-radius: 12px;
        }
        .theme-copy strong,
        .card-head strong,
        .summary-card__head strong,
        .empty-box strong,
        .desk-title,
        .public-item strong,
        .public-hero strong {
          color: #fff;
          font-weight: 800;
        }
        .logo-card,
        .logo-empty,
        .qr-preview-wrap {
          display: grid;
          gap: 14px;
          justify-items: center;
        }
        .logo-preview {
          width: 140px;
          height: 140px;
          object-fit: cover;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.06);
        }
        .logo-actions {
          display: grid;
          gap: 10px;
          width: 100%;
        }
        .upload-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px dashed rgba(255,255,255,0.16);
          font-weight: 700;
          cursor: pointer;
          width: 100%;
        }
        .upload-box-full {
          min-height: 84px;
        }
        .preview-card-full {
          grid-column: 1 / -1;
        }
        .accent-dot {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          box-shadow: 0 0 0 6px rgba(255,255,255,0.05);
        }
        .device-shell {
          margin: 0 auto;
          max-width: 520px;
          padding: 12px;
          border-radius: 32px;
          background: #0b111a;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .device-top {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 10px;
        }
        .device-top span {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
        }
        .public-preview {
          padding: 14px;
          border-radius: 24px;
          border: 1px solid;
          display: grid;
          gap: 14px;
        }
        .public-hero,
        .public-body,
        .public-item {
          border: 1px solid;
          border-radius: 20px;
        }
        .public-hero {
          padding: 16px;
          display: grid;
          gap: 10px;
        }
        .public-badges,
        .public-section-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .public-badges span,
        .public-section-chip {
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 0 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid transparent;
        }
        .public-body {
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .public-item {
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .public-item b {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          font-size: 13px;
        }
        .desk-chip {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          color: #eef5ff;
          font-weight: 700;
          cursor: pointer;
        }
        .desk-chip.is-active {
          background: rgba(59,130,246,0.16);
          border-color: rgba(59,130,246,0.24);
          color: #dbeafe;
        }
        .qr-canvas-wrap {
          display: flex;
          justify-content: center;
          padding: 12px;
          border-radius: 24px;
          background: white;
        }
        .desk-title {
          font-size: 18px;
        }
        .qr-url {
          width: 100%;
          word-break: break-all;
          font-size: 12px;
          text-align: center;
          line-height: 1.55;
        }
        .floating-toast {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 30;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(15, 118, 110, 0.92);
          color: #ecfeff;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 20px 30px rgba(0,0,0,0.24);
        }
        .note-grid-single {
          margin-top: 8px;
        }
        @media (max-width: 1180px) {
          .two-col,
          .appearance-layout,
          .advanced-layout,
          .menu-layout,
          .desk-layout,
          .item-grid,
          .field-grid.two-up {
            grid-template-columns: 1fr;
          }
          .preview-card-full {
            grid-column: auto;
          }
        }
        @media (max-width: 720px) {
          .panel {
            padding: 16px;
            border-radius: 20px;
          }
          .card,
          .summary-card,
          .stack-card,
          .preview-card,
          .qr-card {
            padding: 14px;
            border-radius: 18px;
          }
          .sticky-bar {
            top: 8px;
            padding: 12px;
            flex-direction: column;
            align-items: stretch;
          }
          .sticky-bar__actions .btn,
          .quick-actions .btn,
          .item-actions .btn,
          .mini-actions .btn {
            flex: 1 1 0;
          }
          .section-head,
          .card-head,
          .summary-card__head,
          .item-top,
          .hero-summary,
          .public-item,
          .toolbar,
          .public-section-row,
          .public-badges {
            flex-direction: column;
            align-items: stretch;
          }
          .sticky-bar__meta strong,
          .section-head h2 {
            font-size: 20px;
          }
          .hero-summary__title strong {
            font-size: 18px;
          }
          .textarea-large {
            min-height: 300px;
          }
          .stat-card {
            flex: 1 1 calc(50% - 10px);
            min-width: calc(50% - 10px);
          }
          .device-shell {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function SummaryRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong style={multiline ? { whiteSpace: "pre-wrap" } : undefined}>{value}</strong>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
