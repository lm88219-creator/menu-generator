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
    ? parsed.map((item) => createFormItem({
        category: item.category || "精選菜單",
        name: item.name || "",
        price: item.price || "",
        note: item.note || "",
        soldOut: Boolean(item.soldOut),
      }))
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
  const previewItems = formItems.filter((item) => item.name.trim()).slice(0, 4);
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
    setFormItems((current) => [
      ...current,
      createFormItem({ category: afterCategory || current[current.length - 1]?.category || "精選菜單" }),
    ]);
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
    <div className="uu-editor-v4-shell">
      <section className="uu-panel uu-editor-v4-topbar">
        <div className="uu-editor-v4-topbar-main">
          <div>
            <h2 className="uu-simple-title">{restaurant || "未命名店家"}</h2>
            <p className="uu-admin-copy">把主要編輯步驟集中成清楚的四段，滑動時更容易知道自己改到哪裡。</p>
          </div>
          <div className="uu-editor-v4-stats uu-editor-v4-stats-refined">
            <div className="uu-editor-v4-stat-card">
              <span>全部品項</span>
              <strong>{formItems.length}</strong>
            </div>
            <div className="uu-editor-v4-stat-card">
              <span>供應中</span>
              <strong>{activeCount}</strong>
            </div>
            <div className="uu-editor-v4-stat-card">
              <span>售完</span>
              <strong>{soldOutCount}</strong>
            </div>
          </div>
        </div>

        <div className="uu-editor-v4-topbar-side">
          <div className="uu-editor-v4-anchor-nav uu-editor-v4-anchor-nav-refined">
            <a href="#shop-info" className="uu-editor-v4-anchor-link">
              <span>01</span>
              <strong>店家資訊</strong>
            </a>
            <a href="#menu-items" className="uu-editor-v4-anchor-link is-primary">
              <span>02</span>
              <strong>菜單品項</strong>
            </a>
            <a href="#appearance-settings" className="uu-editor-v4-anchor-link">
              <span>03</span>
              <strong>外觀設定</strong>
            </a>
            <a href="#advanced-tools" className="uu-editor-v4-anchor-link">
              <span>04</span>
              <strong>進階工具</strong>
            </a>
          </div>
          {message ? <div className="uu-editor-v4-topbar-message"><span className="uu-inline-hint is-success">{message}</span></div> : null}
        </div>
      </section>

      <div className="uu-editor-v4-layout uu-editor-v4-layout-single">
        <div className="uu-editor-v4-main">
          <section id="shop-info" className="uu-simple-section uu-editor-v4-section uu-editor-v4-shop-section">
            <div className="uu-section-head uu-editor-v4-section-head-pro">
              <div>
                <h2>店家資訊</h2>
                <p>把公開頁會用到的品牌資訊整理成清楚欄位，店名、網址與聯絡方式更容易一次確認。</p>
              </div>
              <label className="uu-switch-row uu-editor-v4-publish-toggle uu-editor-v4-publish-toggle-pro">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                <span>{isPublished ? "公開顯示中" : "目前下架"}</span>
              </label>
            </div>

            <div className="uu-editor-v4-shop-grid">
              <div className="uu-editor-v4-shop-maincard">
                <div className="uu-form-grid-2 uu-editor-v4-shop-formgrid">
                  <Field label="餐廳名稱"><input className="uu-input" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} placeholder="例如：友愛熱炒" /></Field>
                  <label className="uu-field uu-editor-v4-shop-form-note-field">
                    <span>網址 slug</span>
                    <input className="uu-input" value={slug} onChange={(e) => setSlug(sanitizeSlugInput(e.target.value))} placeholder="例如：you-ai-re-chao" />
                    <small>可輸入英文、數字與 -，公開網址會沿用這組 slug。</small>
                  </label>
                  <Field label="電話"><input className="uu-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="例如：0912-345-678" /></Field>
                  <Field label="營業時間"><input className="uu-input" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="例如：17:00 - 01:00" /></Field>
                </div>

                <Field label="地址"><input className="uu-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例如：嘉義市西區友愛路100號" /></Field>
              </div>

              <aside className="uu-editor-v4-shop-sidecard">
                <div className="uu-editor-v4-shop-sidehead">
                  <span>公開頁資訊摘要</span>
                  <strong>{restaurant || "未命名店家"}</strong>
                </div>
                <div className="uu-editor-v4-shop-sidegrid">
                  <div><span>目前網址</span><strong>/{safeSlug}</strong></div>
                  <div><span>電話</span><strong>{phone || "未填寫"}</strong></div>
                  <div><span>營業時間</span><strong>{hours || "未填寫"}</strong></div>
                  <div><span>地址</span><strong>{address || "未填寫"}</strong></div>
                </div>
              </aside>
            </div>

          </section>

          <section id="menu-items" className="uu-simple-section uu-editor-v4-section uu-editor-v4-menu-section">
            <div className="uu-section-head uu-editor-v4-section-head-pro uu-menu-editor-section-head-refined">
              <div>
                <h2>菜單品項</h2>
                <p>改成以「快速輸入」為主流程，先貼整份菜單再批次整理，最後再到右邊微調單一品項。</p>
              </div>
            </div>

            <div className="uu-menu-editor-slimbar uu-menu-editor-slimbar-refined">
              <div className="uu-menu-editor-slimbar-copy">
                <strong>{activeCount} 項供應中</strong>
                <span>{categorySummary.length ? `已整理 ${categorySummary.length} 個分類` : "新增第一個品項後，這裡會自動整理分類"}</span>
              </div>
              <div className="uu-menu-editor-category-tags">
                {categorySummary.length ? categorySummary.slice(0, 6).map((category) => (
                  <span key={category.name}>{category.name} ・ {category.count}</span>
                )) : <span>尚未建立分類</span>}
              </div>
            </div>

            <div className={`uu-menu-editor-sync-hint uu-menu-editor-sync-hint-standalone ${bulkDirty ? "is-warning" : ""}`}>{bulkDirty ? "左側內容尚未套用到逐項編輯" : "左側與逐項編輯已同步"}</div>

            <div className="uu-menu-editor-dual-layout uu-menu-editor-dual-layout-a">
              <section className="uu-menu-editor-bulk-card uu-menu-editor-bulk-card-a">
                <div className="uu-menu-editor-bulk-innerbox">
                  <div className="uu-menu-editor-bulk-head uu-menu-editor-bulk-head-a">
                    <div>
                      <strong>快速輸入整份菜單</strong>
                      <span>先把原始菜單貼在這裡，確認後按「套用到逐項編輯」，系統會自動拆成分類、菜名與價格。</span>
                    </div>
                  </div>

                  <div className="uu-menu-editor-toolbar uu-menu-editor-toolbar-a uu-menu-editor-toolbar-a-dual">
                    <button type="button" className="uu-btn uu-btn-primary uu-btn-compact" onClick={applyQuickInput}>套用到逐項編輯</button>
                    <button type="button" className="uu-btn uu-btn-secondary uu-btn-compact" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
                  </div>

                  <textarea
                    className="uu-textarea uu-menu-editor-bulk-textarea uu-menu-editor-bulk-textarea-a"
                    value={quickInput}
                    onChange={(e) => handleQuickInputChange(e.target.value)}
                    placeholder={`例如：
鵝肉
鹽水鵝肉 200
麻油鵝肉 220

主食
炒飯 80
炒麵 80`}
                  />

                  <div className="uu-menu-editor-bulk-footnote uu-menu-editor-bulk-footnote-a">
                    <span>分類請獨立一行，品項後面接價格，備註可用「|」分隔。</span>
                    <span>儲存時若左側有未套用內容，系統會自動先套用再儲存。</span>
                  </div>
                </div>
              </section>

              <div className="uu-menu-editor-structured-panel uu-menu-editor-structured-panel-a">
                <div className="uu-menu-editor-structured-head">
                  <div>
                    <strong>右側結果預覽與微調</strong>
                    <span>保留精簡微調區，讓你快速改價格、備註或臨時補一兩項。</span>
                  </div>
                  <div className="uu-menu-editor-structured-actions">
                    <button type="button" className="uu-btn uu-btn-secondary uu-btn-compact" onClick={() => addItem()}>＋ 新增品項</button>
                    <button type="button" className="uu-btn uu-btn-primary uu-btn-compact" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
                  </div>
                </div>

                <div className="uu-items-stack uu-menu-editor-stack uu-menu-editor-stack-refined">
                  {formItems.map((item, index) => (
                    <article key={item.uid} className="uu-menu-item-row-card uu-menu-item-row-card-minimal is-focused">
                      <div className="uu-menu-item-row-grid uu-menu-item-row-grid-minimal">
                        <input className="uu-input uu-input-compact" value={item.category} onChange={(e) => updateFormItem(index, { category: e.target.value })} placeholder="分類" aria-label={`第 ${index + 1} 項分類`} />
                        <input className="uu-input uu-input-compact uu-menu-item-name-input-minimal" value={item.name} onChange={(e) => updateFormItem(index, { name: e.target.value })} placeholder="菜名" aria-label={`第 ${index + 1} 項菜名`} />
                        <div className="uu-price-input-wrap uu-price-input-wrap-pro uu-price-input-wrap-compact">
                          <span>$</span>
                          <input className="uu-input uu-input-compact" value={item.price} onChange={(e) => updateFormItem(index, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="價格" aria-label={`第 ${index + 1} 項價格`} />
                        </div>
                        <input className="uu-input uu-input-compact" value={item.note} onChange={(e) => updateFormItem(index, { note: e.target.value })} placeholder="備註" aria-label={`第 ${index + 1} 項備註`} />
                        <label className="uu-menu-item-toggle-cell uu-menu-item-toggle-cell-minimal" aria-label={`第 ${index + 1} 項供應中`}>
                          <input type="checkbox" checked={!item.soldOut} onChange={(e) => updateFormItem(index, { soldOut: !e.target.checked })} />
                        </label>
                        <div className="uu-menu-item-delete-cell uu-menu-item-delete-cell-minimal">
                          <button type="button" className="uu-btn uu-btn-secondary uu-btn-icon-only" onClick={() => duplicateItem(index)} aria-label={`複製第 ${index + 1} 項`}>複製</button>
                          <button type="button" className="uu-btn uu-btn-danger uu-btn-icon-only" onClick={() => removeItem(index)} aria-label={`刪除第 ${index + 1} 項`}>刪除</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="appearance-settings" className="uu-simple-section uu-editor-v4-section uu-editor-v4-appearance-section">
            <div className="uu-section-head">
              <div>
                <h2>外觀設定</h2>
                <p>把風格挑選、Logo 與公開頁預覽整合成一個品牌設定區，選主題時更直覺也更容易判斷效果。</p>
              </div>
            </div>

            <div className="uu-editor-v4-appearance-layout">
              <div className="uu-editor-v4-appearance-main">
                <div className="uu-editor-v4-appearance-overview uu-editor-v4-appearance-overview-pro">
                  <div className="uu-editor-v4-appearance-intro">
                    <span className="uu-chip">目前主題：{selectedTheme.label}</span>
                    <p>{selectedTheme.desc}</p>
                    <div className="uu-editor-v4-appearance-tags">
                      <span>公開頁同步套用</span>
                      <span>{logoDataUrl ? "含 Logo" : "未使用 Logo"}</span>
                      <span>預覽即時更新</span>
                    </div>
                  </div>
                  <div className="uu-editor-v4-theme-note-accent" style={{ background: selectedTheme.accent }} />
                </div>

                <div className="uu-editor-v4-theme-selector-card uu-editor-v4-theme-selector-card-pro">
                  <div className="uu-editor-v4-subhead">
                    <div>
                      <span>主題挑選</span>
                      <strong>用更精簡的下拉選單快速切換公開頁風格</strong>
                    </div>
                    <div className="uu-editor-theme-preview uu-editor-theme-preview-inline uu-editor-theme-preview-inline-pro">
                      {selectedTheme.preview.map((color, index) => (
                        <span key={`${selectedTheme.value}-${index}`} style={{ background: color }} />
                      ))}
                    </div>
                  </div>
                  <div className="uu-editor-v4-theme-select-wrap uu-editor-v4-theme-select-wrap-pro">
                    <label className="uu-field uu-field-theme-select-pro">
                      <span>選擇公開頁主題</span>
                      <div className="uu-theme-select-shell">
                        <select className="uu-input uu-theme-select uu-theme-select-pro" value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)}>
                          {THEME_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <small>切換後，右側預覽會立即同步目前主題的色調、卡片層次與價格樣式。</small>
                    </label>
                    <div className="uu-editor-v4-theme-select-side uu-editor-v4-theme-select-side-pro">
                      <strong>{selectedTheme.label}</strong>
                      <p>{selectedTheme.desc}</p>
                      <div className="uu-editor-v4-theme-select-tags">
                        <span>公開頁同步</span>
                        <span>價格色塊同步</span>
                        <span>{logoDataUrl ? "Logo 已帶入" : "文字版更乾淨"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="uu-editor-v4-theme-note-card uu-editor-v4-theme-preview-card">
                  <div className="uu-editor-v4-theme-note-head">
                    <div>
                      <span>客戶公開頁預覽</span>
                      <strong>{selectedTheme.label}</strong>
                    </div>
                    <div className="uu-editor-v4-theme-note-accent" style={{ background: selectedTheme.accent }} />
                  </div>
                  <div className="uu-editor-v4-public-preview-device">
                    <div className="uu-editor-v4-public-preview-device-top">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="uu-editor-v4-public-preview uu-editor-v4-public-preview-pro" style={{ background: previewTokens.shell, color: previewTokens.text, borderColor: previewTokens.border }}>
                    <div className="uu-editor-v4-public-preview-hero uu-editor-v4-public-preview-hero-themed" style={{ background: previewTokens.hero, borderColor: previewTokens.border }}>
                      <div className="uu-editor-v4-public-preview-brand-row">
                        <div className="uu-editor-v4-public-preview-badge" style={{ background: previewTokens.accentSoft, color: previewTokens.accent }}>UU MENU</div>
                        <div className="uu-editor-v4-public-preview-theme-dot" style={{ background: selectedTheme.accent }} />
                      </div>
                      <div className="uu-editor-v4-public-preview-hero-copy">
                        <strong style={{ color: previewTokens.title }}>{restaurant || "未命名店家"}</strong>
                        <span style={{ color: previewTokens.muted }}>{previewSubtitle}</span>
                      </div>
                      <div className="uu-editor-v4-public-preview-mini-meta">
                        <span style={{ background: previewTokens.panel, borderColor: previewTokens.border, color: previewTokens.muted }}>{selectedTheme.label}</span>
                        <span style={{ background: previewTokens.panel, borderColor: previewTokens.border, color: previewTokens.muted }}>{logoDataUrl ? "品牌 Logo 已套用" : "乾淨文字版"}</span>
                      </div>
                    </div>

                    <div className="uu-editor-v4-public-preview-shell" style={{ background: previewTokens.surface, borderColor: previewTokens.line }}>
                      <div className="uu-editor-v4-public-preview-headerline">
                        <div className="uu-editor-v4-public-preview-section-chip" style={{ background: previewTokens.soft, color: previewTokens.section }}>{previewCategory}</div>
                        <div className="uu-editor-v4-public-preview-headerline-text" style={{ color: previewTokens.muted }}>{hours || "每日營業 11:00 - 20:00"}</div>
                      </div>
                      <div className="uu-editor-v4-public-preview-list">
                        {previewItems.map((item) => (
                          <div key={item.uid} className="uu-editor-v4-public-preview-item uu-editor-v4-public-preview-item-pro" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                            <div>
                              <strong style={{ color: previewTokens.title }}>{item.name.trim()}</strong>
                              <span style={{ color: previewTokens.muted }}>{item.note.trim() || item.category.trim() || "人氣推薦"}</span>
                            </div>
                            <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>{item.price.trim() ? `$${item.price.trim()}` : "$--"}</b>
                          </div>
                        ))}
                        {!previewItems.length ? (
                          <div className="uu-editor-v4-public-preview-item uu-editor-v4-public-preview-item-pro" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                            <div>
                              <strong style={{ color: previewTokens.title }}>招牌炒飯</strong>
                              <span style={{ color: previewTokens.muted }}>先新增品項，這裡會同步預覽主題效果</span>
                            </div>
                            <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>$90</b>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  </div>
                  <div className="uu-editor-v4-theme-checklist">
                    <div><strong>字體閱讀性</strong><span>主色與背景已一起調整，不容易看起來太花。</span></div>
                    <div><strong>品牌一致性</strong><span>Logo、主題與公開頁會同步呈現同一種風格。</span></div>
                    <div><strong>手機版觀感</strong><span>公開頁在手機上也會沿用這組配色與質感設定。</span></div>
                  </div>
                </div>
              </div>

              <div className="uu-editor-v4-appearance-side">
                <section className="uu-editor-v4-asset-card uu-editor-v4-logo-pro-card">
                  <div className="uu-section-head uu-section-head-tight">
                    <div>
                      <h3>Logo 設定</h3>
                      <p>建議使用正方形或圓形識別，客人頁面看起來會更專業。</p>
                    </div>
                  </div>
                  <div className="uu-editor-v4-logo-panel">
                    {logoDataUrl ? (
                      <div className="uu-editor-v4-logo-preview-card">
                        <img src={logoDataUrl} alt="logo preview" className="uu-editor-v4-logo-preview-large" />
                        <div className="uu-editor-v4-logo-actions">
                          <label className="uu-upload-box uu-upload-box-compact">
                            <input type="file" accept="image/*" onChange={handleLogoUpload} />
                            <span>更換 Logo</span>
                          </label>
                          <button type="button" className="uu-btn uu-btn-secondary uu-full-width" onClick={() => setLogoDataUrl("")}>移除 Logo</button>
                        </div>
                      </div>
                    ) : (
                      <div className="uu-editor-v4-logo-empty">
                        <label className="uu-upload-box uu-full-width">
                          <input type="file" accept="image/*" onChange={handleLogoUpload} />
                          <span>上傳 Logo</span>
                        </label>
                        <div className="uu-inline-hint">沒有 Logo 也能正常顯示菜單，之後再補也可以。</div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="uu-editor-v4-asset-card uu-editor-v4-appearance-tips uu-editor-v4-brand-tips-card">
                  <div className="uu-section-head uu-section-head-tight">
                    <div>
                      <h3>建議搭配</h3>
                      <p>快速判斷目前外觀會不會符合店家氣質。</p>
                    </div>
                  </div>
                  <div className="uu-editor-v4-tip-list">
                    <div><strong>深色經典</strong><span>熱炒、宵夜、酒吧</span></div>
                    <div><strong>簡約白</strong><span>一般餐廳、字多的菜單</span></div>
                    <div><strong>暖木咖啡</strong><span>咖啡店、家常餐飲</span></div>
                    <div><strong>海洋 / 森林 / 玫瑰 / 經典餐館</strong><span>需要更明確品牌調性或紙本餐館感時使用</span></div>
                  </div>
                </section>
              </div>
            </div>
          </section>

          <section id="advanced-tools" className="uu-simple-section uu-editor-v4-section">
            <div className="uu-section-head">
              <div>
                <h2>進階工具</h2>
                <p>把較少用、偏分享或檢查用的工具集中到最後，避免干擾主要編輯流程。</p>
              </div>
            </div>

            <div className="uu-editor-v4-tools-grid">
              <div className="uu-editor-v4-advanced-card uu-editor-v4-tool-card uu-editor-v4-desk-tool-card">
                <div className="uu-section-head uu-section-head-tight">
                  <div>
                    <h3>桌號 QR 工具</h3>
                    <p>把桌號輸入、桌號清單與 QR 預覽拆開，操作會更直覺也比較不亂。</p>
                  </div>
                </div>

                <div className="uu-editor-v4-desk-tool-layout">
                  <div className="uu-editor-v4-desk-tool-main">
                    <Field label="手動輸入桌號（用空白、逗號或換行分隔）">
                      <textarea
                        className="uu-textarea uu-desk-input-area"
                        value={deskInput}
                        onChange={(e) => setDeskInput(e.target.value)}
                        placeholder="例如：A1 A2 A3
B1 B2
VIP1"
                      />
                    </Field>
                    <div className="uu-editor-v4-tool-toolbar">
                      <div className="uu-editor-v4-tool-tip">桌號內容會暫存在這台電腦，儲存菜單後也不會消失。</div>
                      <div className="uu-editor-v4-tool-actions">
                        <span className="uu-chip">共 {deskCodes.length} 組</span>
                        <button type="button" className="uu-btn uu-btn-secondary" onClick={() => setDeskInput("")}>清空桌號</button>
                        <button type="button" className="uu-btn uu-btn-secondary" onClick={() => copyText(deskCodes.join(", "), "已複製桌號清單") } disabled={!deskCodes.length}>複製桌號清單</button>
                      </div>
                    </div>

                    <div className="uu-editor-v4-desk-list-panel">
                      <div className="uu-editor-v4-qr-preview-head">
                        <strong>桌號清單</strong>
                        <span>點一下桌號即可切換右側 QR 預覽。</span>
                      </div>
                      {deskCodes.length ? (
                        <div className="uu-editor-v4-desk-chip-grid">
                          {deskCodes.map((tableCode) => (
                            <button
                              key={tableCode}
                              type="button"
                              className={`uu-editor-v4-desk-chip ${selectedDesk === tableCode ? "is-active" : ""}`}
                              onClick={() => setSelectedDesk(tableCode)}
                            >
                              {tableCode}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="uu-editor-v4-tool-empty">
                          <strong>尚未輸入桌號</strong>
                          <p>有需要桌卡再輸入即可，沒有用到這個功能可以先略過。</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="uu-editor-v4-desk-tool-preview">
                    <div className="uu-editor-v4-qr-preview-head">
                      <strong>目前預覽</strong>
                      <span>{selectedDesk ? `桌號 ${selectedDesk}` : "請先輸入桌號"}</span>
                    </div>
                    <div className="uu-editor-v4-desk-preview-card">
                      {selectedDesk ? (
                        <>
                          <div className="uu-editor-v4-desk-preview-table">桌號 {selectedDesk}</div>
                          <QRCodeCanvas value={selectedDeskUrl} size={178} includeMargin level="H" />
                          <div className="uu-editor-v4-desk-preview-url">{selectedDeskUrl}</div>
                          <div className="uu-editor-v4-desk-preview-actions">
                            <button type="button" className="uu-btn uu-btn-primary uu-full-width" onClick={() => copyText(selectedDeskUrl, `已複製桌號 ${selectedDesk} 網址`)}>複製目前桌號網址</button>
                          </div>
                        </>
                      ) : (
                        <div className="uu-editor-v4-tool-empty">
                          <strong>尚未選擇桌號</strong>
                          <p>輸入桌號後，右側會顯示單一桌號的 QR 預覽，方便你逐個檢查與複製。</p>
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </div>

              <section className="uu-editor-v4-advanced-card uu-editor-v4-tool-card uu-editor-v4-quick-tool-card">
                <div className="uu-section-head uu-section-head-tight">
                  <div>
                    <h3>快速工具</h3>
                    <p>保留真正常用的動作，讓進階工具區不要太雜。</p>
                  </div>
                </div>

                <div className="uu-editor-v4-quick-actions uu-editor-v4-quick-actions-stacked">
                  <button type="button" className="uu-btn uu-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
                  <button type="button" className="uu-btn uu-btn-secondary" onClick={() => copyText(publicUrl, "已複製公開網址")}>複製公開網址</button>
                  <a className="uu-btn uu-btn-secondary" href={publicPath} target="_blank" rel="noreferrer">開啟客戶公開頁</a>
                  <button type="button" className="uu-btn uu-btn-secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>回到頁面上方</button>
                </div>

                <div className="uu-editor-v4-tool-note-list">
                  <div>
                    <strong>桌號 QR 用在桌卡</strong>
                    <span>只有需要桌號分享時再使用，平常編輯菜單可直接略過。</span>
                  </div>
                  <div>
                    <strong>公開頁配色會一起套用</strong>
                    <span>外觀設定區選的主題，客戶看到的公開菜單也會同步更新。</span>
                  </div>
                </div>
              </section>            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="uu-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
