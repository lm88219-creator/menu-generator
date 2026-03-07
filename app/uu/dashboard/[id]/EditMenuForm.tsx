"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { parseMenuText, normalizeSlug } from "@/lib/menu";

export type ThemeType = "dark" | "light" | "warm" | "ocean" | "forest" | "rose";

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
  if (theme === "dark") return { shell: "linear-gradient(180deg, #0b1019 0%, #111a28 100%)", panel: "rgba(15, 22, 34, 0.92)", soft: "rgba(143, 183, 255, 0.12)", border: "rgba(255,255,255,0.08)", accent: "#8fb7ff", accentSoft: "rgba(143,183,255,0.16)", title: "#f4f8ff", text: "#eef4ff", muted: "#9baccc", hero: "linear-gradient(135deg, rgba(143,183,255,0.18), rgba(12,18,29,0.08))", priceBg: "rgba(143,183,255,0.12)" };
  if (theme === "warm") return { shell: "linear-gradient(180deg, #241913 0%, #33241b 100%)", panel: "rgba(62, 43, 31, 0.92)", soft: "rgba(208, 138, 84, 0.16)", border: "rgba(255,255,255,0.08)", accent: "#d08a54", accentSoft: "rgba(208,138,84,0.18)", title: "#fff5ea", text: "#fff5ea", muted: "#d7bca2", hero: "linear-gradient(135deg, rgba(208,138,84,0.2), rgba(67,45,31,0.12))", priceBg: "rgba(255,237,219,0.1)" };
  if (theme === "ocean") return { shell: "linear-gradient(180deg, #091823 0%, #112536 100%)", panel: "rgba(19, 39, 55, 0.94)", soft: "rgba(77, 163, 255, 0.16)", border: "rgba(255,255,255,0.08)", accent: "#6cc2ff", accentSoft: "rgba(108,194,255,0.16)", title: "#eef9ff", text: "#eef9ff", muted: "#a7c6dc", hero: "linear-gradient(135deg, rgba(108,194,255,0.2), rgba(11,25,35,0.1))", priceBg: "rgba(108,194,255,0.12)" };
  if (theme === "forest") return { shell: "linear-gradient(180deg, #0d1510 0%, #172219 100%)", panel: "rgba(25, 38, 29, 0.94)", soft: "rgba(111, 177, 122, 0.16)", border: "rgba(255,255,255,0.08)", accent: "#89d197", accentSoft: "rgba(137,209,151,0.16)", title: "#f0fff4", text: "#f0fff4", muted: "#b0cdb7", hero: "linear-gradient(135deg, rgba(137,209,151,0.18), rgba(15,24,18,0.12))", priceBg: "rgba(137,209,151,0.12)" };
  if (theme === "rose") return { shell: "linear-gradient(180deg, #170f13 0%, #24161c 100%)", panel: "rgba(47, 29, 36, 0.94)", soft: "rgba(215, 138, 164, 0.16)", border: "rgba(255,255,255,0.08)", accent: "#e3a0b6", accentSoft: "rgba(227,160,182,0.16)", title: "#fff2f6", text: "#fff2f6", muted: "#d8b2c1", hero: "linear-gradient(135deg, rgba(227,160,182,0.2), rgba(36,22,28,0.12))", priceBg: "rgba(227,160,182,0.12)" };
  return { shell: "linear-gradient(180deg, #f7f8fb 0%, #edf1f6 100%)", panel: "rgba(255, 255, 255, 0.96)", soft: "rgba(214, 178, 103, 0.18)", border: "rgba(15,23,42,0.08)", accent: "#c7922e", accentSoft: "rgba(199,146,46,0.16)", title: "#263244", text: "#263244", muted: "#6f7c92", hero: "linear-gradient(135deg, rgba(199,146,46,0.16), rgba(255,255,255,0.72))", priceBg: "rgba(199,146,46,0.12)" };
}

export default function EditMenuForm({ id, initialData }: { id: string; initialData: InitialData }) {
  const [restaurant, setRestaurant] = useState(initialData.restaurant);
  const [phone, setPhone] = useState(initialData.phone);
  const [address, setAddress] = useState(initialData.address);
  const [hours, setHours] = useState(initialData.hours);
  const [formItems, setFormItems] = useState<MenuItemForm[]>(() => toFormItems(initialData.menuText));
  const [menuText, setMenuText] = useState(initialData.menuText);
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
  const selectedTheme = THEME_OPTIONS.find((item) => item.value === theme) || THEME_OPTIONS[0];
  const previewTokens = getPreviewTokens(theme);
  const deskStorageKey = `uu-desk-codes:${id}`;
  const selectedDeskUrl = selectedDesk ? `${publicUrl}?table=${encodeURIComponent(selectedDesk)}` : "";

  useEffect(() => {
    setMenuText(toMenuText(formItems));
  }, [formItems]);

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
    const finalMenuText = toMenuText(formItems);

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

      <div className="uu-editor-v4-layout">
        <div className="uu-editor-v4-main">
          <section id="shop-info" className="uu-simple-section uu-editor-v4-section">
            <div className="uu-section-head">
              <div>
                <h2>店家資訊</h2>
                <p>店名、網址、電話與地址集中在同一區塊，避免四處找欄位。</p>
              </div>
              <label className="uu-switch-row uu-editor-v4-publish-toggle">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                <span>公開顯示</span>
              </label>
            </div>

            <div className="uu-form-grid-2">
              <Field label="餐廳名稱"><input className="uu-input" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} placeholder="例如：友愛熱炒" /></Field>
              <Field label="網址 slug"><input className="uu-input" value={slug} onChange={(e) => setSlug(normalizeSlug(e.target.value))} placeholder="例如：you-ai-re-chao" /></Field>
              <Field label="電話"><input className="uu-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="例如：0912-345-678" /></Field>
              <Field label="營業時間"><input className="uu-input" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="例如：17:00 - 01:00" /></Field>
            </div>

            <Field label="地址"><input className="uu-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例如：嘉義市西區友愛路100號" /></Field>

            <div className="uu-editor-v4-url-card">
              <div>
                <span>公開網址</span>
                <strong>{publicUrl}</strong>
              </div>
              <button type="button" className="uu-btn uu-btn-secondary uu-btn-inline" onClick={() => copyText(publicUrl, "已複製公開網址")}>複製公開網址</button>
            </div>
          </section>

          <section id="menu-items" className="uu-simple-section uu-editor-v4-section">
            <div className="uu-section-head">
              <div>
                <h2>菜單品項</h2>
                <p>把最常用的編輯區做成卡片式欄位，分類、價格與狀態一眼就能看清楚。</p>
              </div>
              <button type="button" className="uu-btn uu-btn-secondary" onClick={() => addItem()}>＋ 新增品項</button>
            </div>

            <div className="uu-menu-editor-toolbar uu-menu-editor-toolbar-refined">
              <div className="uu-menu-editor-summary-card">
                <div>
                  <span>快速整理</span>
                  <strong>同分類品項請用相同分類名稱</strong>
                </div>
                <small>例如都用「熱炒」而不是一下「熱炒」、一下「熱炒類」。</small>
              </div>
              <div className="uu-menu-editor-summary-card is-soft">
                <div>
                  <span>輸入方式</span>
                  <strong>價格只填數字，備註留給辣度或限量</strong>
                </div>
                <small>卡片已簡化成分類、菜名、價格、備註四個核心欄位。</small>
              </div>
            </div>

            <div className="uu-items-stack uu-menu-editor-stack">
              {formItems.map((item, index) => (
                <article key={item.uid} className="uu-menu-item-card uu-menu-item-card-simple">
                  <div className="uu-menu-item-card-head uu-menu-item-card-head-simple">
                    <div className="uu-menu-item-card-title-wrap">
                      <span className="uu-menu-item-index">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{item.name.trim() || "未命名品項"}</strong>
                        <small>{item.category.trim() || "精選菜單"}</small>
                      </div>
                    </div>
                    <label className={`uu-menu-item-status ${item.soldOut ? "is-off" : "is-on"}`}>
                      <input type="checkbox" checked={item.soldOut} onChange={(e) => updateFormItem(index, { soldOut: e.target.checked })} />
                      <span>{item.soldOut ? "售完" : "供應中"}</span>
                    </label>
                  </div>

                  <div className="uu-menu-item-grid uu-menu-item-grid-simple">
                    <Field label="分類">
                      <input className="uu-input" value={item.category} onChange={(e) => updateFormItem(index, { category: e.target.value })} placeholder="熱炒" />
                    </Field>
                    <Field label="菜名">
                      <input className="uu-input" value={item.name} onChange={(e) => updateFormItem(index, { name: e.target.value })} placeholder="炒螺肉" />
                    </Field>
                    <Field label="價格">
                      <div className="uu-price-input-wrap">
                        <span>$</span>
                        <input className="uu-input" value={item.price} onChange={(e) => updateFormItem(index, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="120" />
                      </div>
                    </Field>
                    <Field label="備註">
                      <input className="uu-input" value={item.note} onChange={(e) => updateFormItem(index, { note: e.target.value })} placeholder="小辣 / 限量" />
                    </Field>
                  </div>

                  <div className="uu-menu-item-actions uu-menu-item-actions-simple">
                    <button type="button" className="uu-btn uu-btn-secondary" onClick={() => duplicateItem(index)}>複製</button>
                    <button type="button" className="uu-btn uu-btn-danger" onClick={() => removeItem(index)}>刪除</button>
                  </div>
                </article>
              ))}
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

                <div className="uu-editor-v4-theme-selector-card">
                  <div className="uu-editor-v4-subhead">
                    <div>
                      <span>主題挑選</span>
                      <strong>選一個最符合店家氣質的視覺風格</strong>
                    </div>
                  </div>
                  <div className="uu-editor-theme-grid">
                    {THEME_OPTIONS.map((option) => {
                      const active = option.value === theme;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`uu-editor-theme-card ${active ? "is-active" : ""}`}
                          onClick={() => setTheme(option.value)}
                        >
                          <div className="uu-editor-theme-preview">
                            {option.preview.map((color, index) => (
                              <span key={`${option.value}-${index}`} style={{ background: color }} />
                            ))}
                          </div>
                          <div className="uu-editor-theme-card-head">
                            <strong>{option.label}</strong>
                            {active ? <em>目前使用</em> : null}
                          </div>
                          <p>{option.desc}</p>
                          <i style={{ background: option.accent }} />
                        </button>
                      );
                    })}
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
                  <div className="uu-editor-v4-public-preview" style={{ background: previewTokens.shell, color: previewTokens.text, borderColor: previewTokens.border }}>
                    <div className="uu-editor-v4-public-preview-hero uu-editor-v4-public-preview-hero-themed" style={{ background: previewTokens.hero, borderColor: previewTokens.border }}>
                      <div className="uu-editor-v4-public-preview-badge" style={{ background: previewTokens.accentSoft, color: previewTokens.accent }}>精選推薦</div>
                      <strong style={{ color: previewTokens.title }}>{restaurant || "未命名店家"}</strong>
                      <span style={{ color: previewTokens.muted }}>{hours || "每日營業 11:00 - 20:00"}</span>
                      <div className="uu-editor-v4-public-preview-mini-meta">
                        <span style={{ background: previewTokens.panel, borderColor: previewTokens.border, color: previewTokens.muted }}>分類清楚</span>
                        <span style={{ background: previewTokens.panel, borderColor: previewTokens.border, color: previewTokens.muted }}>手機閱讀佳</span>
                      </div>
                    </div>
                    <div className="uu-editor-v4-public-preview-section-chip" style={{ background: previewTokens.soft, color: previewTokens.accent }}>主廚推薦</div>
                    <div className="uu-editor-v4-public-preview-list">
                      <div className="uu-editor-v4-public-preview-item" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                        <div>
                          <strong style={{ color: previewTokens.title }}>招牌炒飯</strong>
                          <span style={{ color: previewTokens.muted }}>人氣推薦</span>
                        </div>
                        <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>$90</b>
                      </div>
                      <div className="uu-editor-v4-public-preview-item" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                        <div>
                          <strong style={{ color: previewTokens.title }}>宮保雞丁</strong>
                          <span style={{ color: previewTokens.muted }}>微辣</span>
                        </div>
                        <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>$160</b>
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
                    <div><strong>海洋 / 森林 / 玫瑰</strong><span>需要更鮮明品牌感時使用</span></div>
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

                <div className="uu-editor-v4-quick-actions">
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

        <aside className="uu-editor-v4-side">
          <section className="uu-simple-section uu-editor-v4-side-card">
            <div className="uu-section-head uu-section-head-tight">
              <div>
                <h3>操作摘要</h3>
                <p>編輯時常用的資訊集中放右邊。</p>
              </div>
            </div>
            <div className="uu-editor-v4-summary-grid">
              <div className="uu-editor-v4-summary-item"><span>公開狀態</span><strong>{isPublished ? "上架中" : "已下架"}</strong></div>
              <div className="uu-editor-v4-summary-item"><span>菜單風格</span><strong>{selectedTheme.label}</strong></div>
              <div className="uu-editor-v4-summary-item"><span>供應中</span><strong>{activeCount}</strong></div>
              <div className="uu-editor-v4-summary-item"><span>售完</span><strong>{soldOutCount}</strong></div>
            </div>
          </section>

          <section className="uu-simple-section uu-editor-v4-side-card">
            <div className="uu-section-head uu-section-head-tight">
              <div>
                <h3>公開網址</h3>
                <p>分享或貼給店家時最常用。</p>
              </div>
            </div>
            <div className="uu-editor-v4-side-url">{publicUrl}</div>
            <button type="button" className="uu-btn uu-btn-secondary uu-full-width" onClick={() => copyText(publicUrl, "已複製公開網址")}>複製公開網址</button>
          </section>

          <div className="uu-bottom-save-bar uu-editor-v4-savebar">
            <div>
              <strong>記得儲存變更</strong>
              <p>右側固定儲存區，編輯到哪裡都能直接存。</p>
            </div>
            <button type="button" className="uu-btn uu-btn-primary uu-full-width" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
          </div>
        </aside>
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
