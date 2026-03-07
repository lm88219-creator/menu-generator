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

function toFormItems(menuText: string): MenuItemForm[] {
  const parsed = parseMenuText(menuText);
  return parsed.length
    ? parsed.map((item) => ({
        category: item.category || "精選菜單",
        name: item.name || "",
        price: item.price || "",
        note: item.note || "",
        soldOut: Boolean(item.soldOut),
      }))
    : [{ category: "精選菜單", name: "", price: "", note: "", soldOut: false }];
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

  const safeSlug = normalizeSlug(slug || restaurant) || id;
  const publicPath = `/uu/menu/${safeSlug}`;
  const publicUrl = `${getBaseUrl()}${publicPath}`;
  const deskCodes = useMemo(() => parseDeskInput(deskInput), [deskInput]);
  const soldOutCount = formItems.filter((item) => item.soldOut).length;
  const activeCount = formItems.filter((item) => item.name.trim() && !item.soldOut).length;
  const selectedTheme = THEME_OPTIONS.find((item) => item.value === theme) || THEME_OPTIONS[0];
  const deskStorageKey = `uu-desk-codes:${id}`;

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
      { category: afterCategory || current[current.length - 1]?.category || "精選菜單", name: "", price: "", note: "", soldOut: false },
    ]);
  }

  function duplicateItem(index: number) {
    setFormItems((current) => {
      const target = current[index];
      if (!target) return current;
      const next = [...current];
      next.splice(index + 1, 0, { ...target });
      return next;
    });
  }

  function removeItem(index: number) {
    setFormItems((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ category: "精選菜單", name: "", price: "", note: "", soldOut: false }];
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
            <p className="uu-admin-copy">把店家資訊、網址與儲存控制固定在清楚的位置，編輯流程會更順。</p>
          </div>
          <div className="uu-editor-v4-stats">
            <span className="uu-chip">品項 {formItems.length}</span>
            <span className="uu-chip">供應 {activeCount}</span>
            <span className="uu-chip">售完 {soldOutCount}</span>
          </div>
        </div>

        <div className="uu-editor-v4-topbar-side">
          <div className="uu-editor-v4-anchor-nav">
            <a href="#shop-info" className="uu-btn uu-btn-ghost">店家資訊</a>
            <a href="#menu-items" className="uu-btn uu-btn-ghost">菜單品項</a>
            <a href="#appearance-settings" className="uu-btn uu-btn-ghost">外觀設定</a>
            <a href="#advanced-tools" className="uu-btn uu-btn-ghost">進階工具</a>
          </div>
          <div className="uu-form-actions uu-pro-editor-toolbar-actions">
            <span className={`uu-status ${isPublished ? "is-on" : "is-off"}`}>{isPublished ? "上架中" : "已下架"}</span>
            {message ? <span className="uu-inline-hint is-success">{message}</span> : null}
            <button type="button" className="uu-btn uu-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
          </div>
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
                <p>這裡是最常編輯的地方，所以直接做成固定欄位清單。</p>
              </div>
              <button type="button" className="uu-btn uu-btn-secondary" onClick={() => addItem()}>＋ 新增品項</button>
            </div>

            <div className="uu-items-stack">
              <div className="uu-item-table-header">
                <span>分類</span>
                <span>菜名</span>
                <span>價格</span>
                <span>備註</span>
                <span>狀態</span>
                <span className="is-actions">操作</span>
              </div>
              {formItems.map((item, index) => (
                <article key={`${index}-${item.category}-${item.name}`} className="uu-item-row">
                  <input className="uu-input" value={item.category} onChange={(e) => updateFormItem(index, { category: e.target.value })} placeholder="熱炒" />
                  <input className="uu-input" value={item.name} onChange={(e) => updateFormItem(index, { name: e.target.value })} placeholder="炒螺肉" />
                  <input className="uu-input" value={item.price} onChange={(e) => updateFormItem(index, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="120" />
                  <input className="uu-input" value={item.note} onChange={(e) => updateFormItem(index, { note: e.target.value })} placeholder="小辣 / 限量" />
                  <label className="uu-switch-row uu-switch-cell">
                    <input type="checkbox" checked={item.soldOut} onChange={(e) => updateFormItem(index, { soldOut: e.target.checked })} />
                    <span>{item.soldOut ? "售完" : "供應中"}</span>
                  </label>
                  <div className="uu-row-actions">
                    <button type="button" className="uu-btn uu-btn-secondary" onClick={() => duplicateItem(index)}>複製列</button>
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
                <p>把風格選擇、Logo 與外觀說明集中整理，改完比較容易知道實際呈現方向。</p>
              </div>
            </div>

            <div className="uu-editor-v4-appearance-layout">
              <div className="uu-editor-v4-appearance-main">
                <Field label="菜單風格">
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
                </Field>

                <div className="uu-editor-v4-theme-note-card">
                  <div className="uu-editor-v4-theme-note-head">
                    <div>
                      <span>目前選擇</span>
                      <strong>{selectedTheme.label}</strong>
                    </div>
                    <div className="uu-editor-v4-theme-note-accent" style={{ background: selectedTheme.accent }} />
                  </div>
                  <p>{selectedTheme.desc}</p>
                  <div className="uu-inline-hint">菜單公開頁的視覺會依照這個風格套用，想要更穩重就選深色經典，想要更易讀就選簡約白。</div>
                </div>
              </div>

              <div className="uu-editor-v4-appearance-side">
                <section className="uu-editor-v4-asset-card">
                  <div className="uu-section-head uu-section-head-tight">
                    <div>
                      <h3>Logo 設定</h3>
                      <p>建議使用正方形圖片，客人頁面看起來會比較整齊。</p>
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
              <div className="uu-editor-v4-advanced-card uu-editor-v4-tool-card">
                <div className="uu-section-head uu-section-head-tight">
                  <div>
                    <h3>桌號 QR 工具</h3>
                    <p>適合需要桌卡的店家。手動輸入桌號後，直接生成可分享的桌號網址與 QR。</p>
                  </div>
                </div>
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
                    <span className="uu-chip">目前 {deskCodes.length} 組</span>
                    <button type="button" className="uu-btn uu-btn-secondary" onClick={() => setDeskInput("")}>清空桌號</button>
                    <button type="button" className="uu-btn uu-btn-secondary" onClick={() => copyText(deskCodes.join(", "), "已複製桌號清單") } disabled={!deskCodes.length}>複製桌號清單</button>
                  </div>
                </div>
                <div className="uu-editor-v4-qr-preview-head">
                  <strong>桌號 QR 預覽</strong>
                  <span>只顯示前 8 組，避免頁面太長。</span>
                </div>
                <div className="uu-qr-grid">
                  {deskCodes.slice(0, 8).map((tableCode) => {
                    const tableUrl = `${publicUrl}?table=${encodeURIComponent(tableCode)}`;
                    return (
                      <div key={tableCode} className="uu-qr-card uu-qr-card-pro">
                        <div className="uu-qr-label">桌號 {tableCode}</div>
                        <QRCodeCanvas value={tableUrl} size={118} includeMargin level="H" />
                        <button type="button" className="uu-btn uu-btn-secondary uu-full-width" onClick={() => copyText(tableUrl, `已複製桌號 ${tableCode} 網址`)}>複製桌號網址</button>
                      </div>
                    );
                  })}
                  {!deskCodes.length ? (
                    <div className="uu-editor-v4-tool-empty">
                      <strong>尚未輸入桌號</strong>
                      <p>有需要桌卡再輸入即可，沒有用到這個功能可以先略過。</p>
                    </div>
                  ) : null}
                </div>
              </div>

              <details className="uu-editor-v4-advanced-card uu-collapsible-section uu-editor-v4-tool-card">
                <summary className="uu-collapsible-head">
                  <div>
                    <h3>原始文字</h3>
                    <p>系統實際儲存的內容，主要用來檢查格式或除錯。</p>
                  </div>
                </summary>
                <div className="uu-collapsible-body">
                  <div className="uu-editor-v4-raw-note">這區主要是檢查資料結構是否正常，平常編輯菜單大多不需要打開。</div>
                  <textarea className="uu-textarea uu-editor-v4-raw-textarea" value={menuText} readOnly />
                </div>
              </details>
            </div>
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
