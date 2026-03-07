"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const THEME_OPTIONS: Array<{ value: ThemeType; label: string }> = [
  { value: "dark", label: "深色經典" },
  { value: "light", label: "簡約白" },
  { value: "warm", label: "暖木咖啡" },
  { value: "ocean", label: "海洋清新" },
  { value: "forest", label: "森林自然" },
  { value: "rose", label: "玫瑰奶茶" },
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

function parseDeskInput(input: string, start: string, end: string) {
  const manual = input
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (manual.length) return Array.from(new Set(manual));

  const from = Number(start);
  const to = Number(end);
  if (Number.isFinite(from) && Number.isFinite(to) && from > 0 && to >= from) {
    return Array.from({ length: to - from + 1 }, (_, index) => String(from + index));
  }
  return [];
}

export default function EditMenuForm({ id, initialData }: { id: string; initialData: InitialData }) {
  const router = useRouter();
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
  const [deskInput, setDeskInput] = useState("A1 A2 A3 A4");
  const [deskStart, setDeskStart] = useState("1");
  const [deskEnd, setDeskEnd] = useState("12");

  const safeSlug = normalizeSlug(slug || restaurant) || id;
  const publicPath = `/uu/menu/${safeSlug}`;
  const publicUrl = `${getBaseUrl()}${publicPath}`;
  const deskCodes = useMemo(() => parseDeskInput(deskInput, deskStart, deskEnd), [deskInput, deskStart, deskEnd]);
  const soldOutCount = formItems.filter((item) => item.soldOut).length;
  const activeCount = formItems.filter((item) => item.name.trim() && !item.soldOut).length;

  useEffect(() => {
    setMenuText(toMenuText(formItems));
  }, [formItems]);

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
      router.refresh();
    } catch {
      alert("更新失敗");
    } finally {
      setSaving(false);
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
    <div className="uu-editor-simple">
      <section className="uu-panel uu-subpanel">
        <div className="uu-sticky-toolbar uu-sticky-toolbar-clean uu-sticky-toolbar-v2">
          <div>
            <h2 className="uu-simple-title">{restaurant || "未命名店家"}</h2>
            <p className="uu-admin-copy">把最常用的操作留在上方，其它設定往下收。</p>
            <div className="uu-inline-stats">
              <span className="uu-chip">總品項 {formItems.length}</span>
              <span className="uu-chip">供應中 {activeCount}</span>
              <span className="uu-chip">售完 {soldOutCount}</span>
            </div>
          </div>
          <div className="uu-form-actions">
            <span className={`uu-status ${isPublished ? "is-on" : "is-off"}`}>{isPublished ? "上架中" : "已下架"}</span>
            {message ? <span className="uu-inline-hint is-success">{message}</span> : null}
            <button type="button" className="uu-btn uu-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
          </div>
        </div>

        <div className="uu-editor-stack">
          <section className="uu-simple-section">
            <div className="uu-section-head">
              <div>
                <h2>店家資訊</h2>
                <p>欄位同寬、同節奏，不再擠在一起。</p>
              </div>
              <label className="uu-switch-row">
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
            <div className="uu-preview-url-box uu-preview-url-box-v2">
              <div>
                <span>公開網址</span>
                <strong>{publicUrl}</strong>
              </div>
              <button type="button" className="uu-btn uu-btn-secondary uu-btn-inline" onClick={async () => navigator.clipboard.writeText(publicUrl)}>複製公開網址</button>
            </div>
          </section>

          <details className="uu-simple-section uu-collapsible-section">
            <summary className="uu-collapsible-head">
              <div>
                <h2>外觀設定</h2>
                <p>風格與 Logo 不常改，預設收起來。</p>
              </div>
            </summary>
            <div className="uu-collapsible-body">
              <div className="uu-form-grid-2">
                <Field label="菜單風格">
                  <select className="uu-input" value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)}>
                    {THEME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="說明">
                  <div className="uu-inline-hint">目前是逐列編輯餐點，適合直接修改品項與價格。</div>
                </Field>
              </div>
              <div className="uu-logo-row">
                <label className="uu-upload-box">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} />
                  <span>上傳 Logo</span>
                </label>
                {logoDataUrl ? (
                  <div className="uu-logo-preview-wrap">
                    <img src={logoDataUrl} alt="logo preview" className="uu-logo-preview" />
                    <button type="button" className="uu-btn uu-btn-secondary" onClick={() => setLogoDataUrl("")}>移除 Logo</button>
                  </div>
                ) : (
                  <div className="uu-inline-hint">建議用正方形圖片。</div>
                )}
              </div>
            </div>
          </details>

          <section className="uu-simple-section">
            <div className="uu-section-head">
              <div>
                <h2>菜單品項</h2>
                <p>表格化排列，欄位位置固定，比較不會亂。</p>
              </div>
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
                    <button type="button" className="uu-btn uu-btn-secondary" onClick={() => duplicateItem(index)}>複製列</button><button type="button" className="uu-btn uu-btn-danger" onClick={() => removeItem(index)}>刪除</button>
                  </div>
                </article>
              ))}
              <button type="button" className="uu-btn uu-btn-secondary uu-full-width" onClick={() => addItem()}>＋ 新增品項</button>
            </div>
          </section>

          <div className="uu-bottom-save-bar">
            <div>
              <strong>編輯完記得儲存</strong>
              <p>這裡放一個底部儲存列，拉到下面也不用再滑回頂端。</p>
            </div>
            <button type="button" className="uu-btn uu-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
          </div>

          <details className="uu-simple-section uu-collapsible-section">
            <summary className="uu-collapsible-head">
              <div>
                <h2>進階工具</h2>
                <p>桌號 QR 與原始文字先收起來，需要時再打開。</p>
              </div>
            </summary>
            <div className="uu-collapsible-body uu-collapsible-stack">
              <div>
                <div className="uu-section-head uu-section-head-tight">
                  <div>
                    <h3>桌號 QR 工具</h3>
                    <p>手動輸入桌號，或設定連號範圍。</p>
                  </div>
                </div>
                <div className="uu-form-grid-2">
                  <Field label="手動輸入桌號（用空白或逗號分隔）"><input className="uu-input" value={deskInput} onChange={(e) => setDeskInput(e.target.value)} placeholder="A1 A2 A3 B1" /></Field>
                  <Field label="連號範圍（從幾號到幾號）"><div className="uu-inline-range"><input className="uu-input" value={deskStart} onChange={(e) => setDeskStart(e.target.value.replace(/[^0-9]/g, ""))} placeholder="1" /><span>到</span><input className="uu-input" value={deskEnd} onChange={(e) => setDeskEnd(e.target.value.replace(/[^0-9]/g, ""))} placeholder="12" /></div></Field>
                </div>
                <div className="uu-qr-grid">
                  {deskCodes.slice(0, 8).map((tableCode) => {
                    const tableUrl = `${publicUrl}?table=${encodeURIComponent(tableCode)}`;
                    return (
                      <div key={tableCode} className="uu-qr-card">
                        <div className="uu-qr-label">桌號 {tableCode}</div>
                        <QRCodeCanvas value={tableUrl} size={118} includeMargin level="H" />
                        <button type="button" className="uu-btn uu-btn-secondary uu-full-width" onClick={async () => navigator.clipboard.writeText(tableUrl)}>複製桌號網址</button>
                      </div>
                    );
                  })}
                  {!deskCodes.length ? <div className="uu-inline-hint">輸入桌號後，這裡會顯示 QR。</div> : null}
                </div>
              </div>
              <div>
                <div className="uu-section-head uu-section-head-tight">
                  <div>
                    <h3>原始文字</h3>
                    <p>系統實際儲存的內容，主要用來檢查。</p>
                  </div>
                </div>
                <textarea className="uu-textarea" value={menuText} readOnly />
              </div>
            </div>
          </details>
        </div>
      </section>
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
