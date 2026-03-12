import { Field, sanitizeSlugInput } from "./shared-ui";

type Props = {
  isPublished: boolean;
  setIsPublished: (value: boolean) => void;
  restaurant: string;
  setRestaurant: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  hours: string;
  setHours: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  safeSlug: string;
};

export function ShopInfoSection(props: Props) {
  const {
    isPublished,
    setIsPublished,
    restaurant,
    setRestaurant,
    slug,
    setSlug,
    phone,
    setPhone,
    hours,
    setHours,
    address,
    setAddress,
    safeSlug,
  } = props;

  const checklist = [
    { label: "店名", done: Boolean(restaurant.trim()) },
    { label: "電話", done: Boolean(phone.trim()) },
    { label: "營業時間", done: Boolean(hours.trim()) },
    { label: "地址", done: Boolean(address.trim()) },
  ];

  return (
    <section id="shop-info" className="uu-simple-section uu-editor-v4-section uu-editor-v4-shop-section">
      <div className="uu-section-head uu-editor-v4-section-head-pro">
        <div>
          <h2>店家資訊</h2>
          <p>先把公開頁最重要的品牌資訊整理好，後面主題預覽與 QR 分享就會一起跟上。</p>
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
              <small>預設會依店名自動產生，可輸入英文、數字與 - 來自訂公開網址。</small>
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

          <div className="uu-editor-checklist-card">
            <div className="uu-editor-checklist-head">
              <strong>公開頁準備度</strong>
              <span>{checklist.filter((item) => item.done).length}/{checklist.length}</span>
            </div>
            <div className="uu-editor-checklist-items">
              {checklist.map((item) => (
                <div key={item.label} className={`uu-editor-checklist-item ${item.done ? "is-done" : ""}`}>
                  <span>{item.done ? "✓" : "•"}</span>
                  <strong>{item.label}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
