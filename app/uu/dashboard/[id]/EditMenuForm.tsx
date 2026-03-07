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
        <div className="uu-simple-toolbar uu-simple-toolbar-sticky">
          <div>
            <h2 className="uu-simple-title">基本資料</h2>
            <p className="uu-admin-copy">後台改成單欄編輯，直接改資料就好，不再放預覽區。</p>
          </div>
          <div className="uu-toolbar-actions">
            <label className="uu-switch-row uu-switch-row-toolbar">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              <span>{isPublished ? "上架中" : "已下架"}</span>
            </label>
            {message ? <span className="uu-inline-hint is-success">{message}</span> : null}
            <button type="button" className="uu-btn uu-btn-secondary" onClick={async () => navigator.clipboard.writeText(publicUrl)}>複製公開網址</button>
            <button type="button" className="uu-btn uu-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
          </div>
        </div>

        <div className="uu-editor-stack">
          <section className="uu-simple-section">
            <div className="uu-section-head">
              <div>
                <h2>店家資訊</h2>
                <p>只保留常用欄位，畫面更簡單。</p>
              </div>
            </div>
            <div className="uu-form-grid-2">
              <Field label="餐廳名稱"><input className="uu-input" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} placeholder="例如：友愛熱炒" /></Field>
              <Field label="網址 slug"><input className="uu-input" value={slug} onChange={(e) => setSlug(normalizeSlug(e.target.value))} placeholder="例如：you-ai-re-chao" /></Field>
              <Field label="電話"><input className="uu-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="例如：0912-345-678" /></Field>
              <Field label="營業時間"><input className="uu-input" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="例如：17:00 - 01:00" /></Field>
            </div>
            <Field label="地址"><input className="uu-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例如：嘉義市西區友愛路100號" /></Field>
            <div className="uu-form-stack-gap">
              <div className="uu-preview-url-box">
                <small>公開網址</small>
                <strong>{publicUrl}</strong>
              </div>
            </div>
          </section>

          <section className="uu-simple-section">
            <div className="uu-section-head">
              <div>
                <h2>風格與 Logo</h2>
                <p>簡化成下拉選單，不再用大面積風格卡片。</p>
              </div>
            </div>
            <div className="uu-form-grid-2">
              <Field label="菜單風格">
                <select className="uu-input" value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)}>
                  {THEME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
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
          </section>

          <section className="uu-simple-section">
            <div className="uu-section-head">
              <div>
                <h2>菜單品項</h2>
                <p>直接一列一列新增，後台更直覺。</p>
              </div>
            </div>

            <div className="uu-items-stack">
              {formItems.map((item, index) => (
                <article key={`${index}-${item.category}-${item.name}`} className="uu-item-card uu-item-card-simple">
                  <div className="uu-item-grid-simple">
                    <Field label="分類"><input className="uu-input" value={item.category} onChange={(e) => updateFormItem(index, { category: e.target.value })} placeholder="例如：熱炒" /></Field>
                    <Field label="菜名"><input className="uu-input" value={item.name} onChange={(e) => updateFormItem(index, { name: e.target.value })} placeholder="例如：炒螺肉" /></Field>
                    <Field label="價格"><input className="uu-input" value={item.price} onChange={(e) => updateFormItem(index, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="例如：120" /></Field>
                    <Field label="備註"><input className="uu-input" value={item.note} onChange={(e) => updateFormItem(index, { note: e.target.value })} placeholder="例如：小辣 / 限量供應" /></Field>
                  </div>
                  <div className="uu-item-footer">
                    <label className="uu-switch-row">
                      <input type="checkbox" checked={item.soldOut} onChange={(e) => updateFormItem(index, { soldOut: e.target.checked })} />
                      <span>{item.soldOut ? "已售完" : "供應中"}</span>
                    </label>
                    <div className="uu-form-actions">
                      <button type="button" className="uu-btn uu-btn-secondary" onClick={() => addItem(item.category)}>新增同分類</button>
                      <button type="button" className="uu-btn uu-btn-danger" onClick={() => removeItem(index)}>刪除</button>
                    </div>
                  </div>
                </article>
              ))}
              <button type="button" className="uu-btn uu-btn-secondary uu-full-width" onClick={() => addItem()}>＋ 新增品項</button>
            </div>
          </section>

          <section className="uu-simple-section">
            <div className="uu-section-head">
              <div>
                <h2>桌號 QR 工具</h2>
                <p>保留實用功能，但版面縮小更整齊。</p>
              </div>
            </div>
            <div className="uu-form-grid-2 uu-qr-tools-grid">
              <Field label="手動桌號（可用空白或逗號分隔）">
                <input className="uu-input" value={deskInput} onChange={(e) => setDeskInput(e.target.value)} placeholder="例如：A1 A2 A3 B1" />
              </Field>
              <Field label="快速產生連號桌號">
                <div className="uu-inline-range uu-inline-range-clarified">
                  <div className="uu-range-field">
                    <small>從</small>
                    <input className="uu-input" value={deskStart} onChange={(e) => setDeskStart(e.target.value.replace(/[^0-9]/g, ""))} placeholder="1" />
                  </div>
                  <span>到</span>
                  <div className="uu-range-field">
                    <small>到</small>
                    <input className="uu-input" value={deskEnd} onChange={(e) => setDeskEnd(e.target.value.replace(/[^0-9]/g, ""))} placeholder="12" />
                  </div>
                </div>
                <div className="uu-inline-hint">會自動產生 {deskStart || "1"} 到 {deskEnd || "12"} 的桌號 QR。</div>
              </Field>
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
          </section>

          <section className="uu-simple-section">
            <div className="uu-section-head">
              <div>
                <h2>文字輸出</h2>
                <p>這裡是系統儲存用內容，方便你快速確認。</p>
              </div>
            </div>
            <textarea className="uu-textarea" value={menuText} readOnly />
          </section>
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
