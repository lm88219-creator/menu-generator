"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ThemeType = "dark" | "light" | "warm" | "ocean" | "forest" | "rose" | "market";

type ThemeConfig = {
  name: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  subText: string;
  accent: string;
  inputBg: string;
  inputBorder: string;
  buttonMainBg: string;
  buttonMainText: string;
  buttonGhostBg: string;
  buttonGhostText: string;
  previewBg: string;
  previewBorder: string;
};

type InitialData = {
  restaurant: string;
  phone: string;
  address: string;
  hours: string;
  menuText: string;
  theme: ThemeType;
  logoDataUrl: string;
  slug?: string;
};

export default function EditMenuForm({
  id,
  initialData,
}: {
  id: string;
  initialData: InitialData;
}) {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState(initialData.restaurant);
  const [phone, setPhone] = useState(initialData.phone);
  const [address, setAddress] = useState(initialData.address);
  const [hours, setHours] = useState(initialData.hours);
  const [menuText, setMenuText] = useState(initialData.menuText);
  const [theme, setTheme] = useState<ThemeType>(initialData.theme);
  const [logoDataUrl, setLogoDataUrl] = useState(initialData.logoDataUrl);
  const [slug, setSlug] = useState(initialData.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const publicPath = slug.trim() ? `/menu/${encodeURIComponent(slug.trim())}` : `/m/${id}`;

  const themeMap = useMemo<Record<ThemeType, ThemeConfig>>(
    () => ({
      dark: {
        name: "黑色餐廳風",
        pageBg: "radial-gradient(circle at top,#1a1a1a 0%,#000 45%,#000 100%)",
        cardBg: "rgba(255,255,255,0.04)",
        cardBorder: "1px solid rgba(255,255,255,0.08)",
        text: "#fff",
        subText: "#a9a9a9",
        accent: "#f4d58d",
        inputBg: "rgba(255,255,255,0.05)",
        inputBorder: "1px solid rgba(255,255,255,0.08)",
        buttonMainBg: "#fff",
        buttonMainText: "#000",
        buttonGhostBg: "rgba(255,255,255,0.08)",
        buttonGhostText: "#fff",
        previewBg: "radial-gradient(circle at top,#1b1b1b 0%,#080808 70%)",
        previewBorder: "1px solid rgba(255,255,255,0.08)",
      },
      light: {
        name: "簡約白色",
        pageBg: "linear-gradient(180deg,#f8f8f8 0%,#eeeeee 100%)",
        cardBg: "rgba(255,255,255,0.92)",
        cardBorder: "1px solid rgba(0,0,0,0.08)",
        text: "#111",
        subText: "#666",
        accent: "#0b57d0",
        inputBg: "#fff",
        inputBorder: "1px solid rgba(0,0,0,0.08)",
        buttonMainBg: "#111",
        buttonMainText: "#fff",
        buttonGhostBg: "#fff",
        buttonGhostText: "#111",
        previewBg: "linear-gradient(180deg,#ffffff 0%,#f3f3f3 100%)",
        previewBorder: "1px solid rgba(0,0,0,0.08)",
      },
      warm: {
        name: "溫暖咖啡風",
        pageBg: "linear-gradient(180deg,#f6efe5 0%,#eadbc8 100%)",
        cardBg: "rgba(255,250,244,0.92)",
        cardBorder: "1px solid rgba(88,54,24,0.12)",
        text: "#3e2d20",
        subText: "#7b6756",
        accent: "#8b5e34",
        inputBg: "rgba(255,255,255,0.78)",
        inputBorder: "1px solid rgba(88,54,24,0.12)",
        buttonMainBg: "#4e3426",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.65)",
        buttonGhostText: "#3e2d20",
        previewBg: "linear-gradient(180deg,#fffaf3 0%,#f1e0cb 100%)",
        previewBorder: "1px solid rgba(88,54,24,0.1)",
      },
      ocean: {
        name: "海洋清新風",
        pageBg: "linear-gradient(180deg,#e9f6ff 0%,#cfe9f6 100%)",
        cardBg: "rgba(245,251,255,0.9)",
        cardBorder: "1px solid rgba(34,87,122,0.12)",
        text: "#0f3550",
        subText: "#4d7289",
        accent: "#1574a9",
        inputBg: "rgba(255,255,255,0.8)",
        inputBorder: "1px solid rgba(34,87,122,0.12)",
        buttonMainBg: "#0f5d8f",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.72)",
        buttonGhostText: "#0f3550",
        previewBg: "linear-gradient(180deg,#ffffff 0%,#dff2fb 100%)",
        previewBorder: "1px solid rgba(34,87,122,0.08)",
      },
      forest: {
        name: "森林自然風",
        pageBg: "linear-gradient(180deg,#edf5ee 0%,#dbe8dc 100%)",
        cardBg: "rgba(249,253,249,0.92)",
        cardBorder: "1px solid rgba(41,87,53,0.12)",
        text: "#233b2c",
        subText: "#5c7564",
        accent: "#3f7d4f",
        inputBg: "rgba(255,255,255,0.82)",
        inputBorder: "1px solid rgba(41,87,53,0.12)",
        buttonMainBg: "#2f5d3b",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.74)",
        buttonGhostText: "#233b2c",
        previewBg: "linear-gradient(180deg,#ffffff 0%,#eef6ec 100%)",
        previewBorder: "1px solid rgba(41,87,53,0.08)",
      },
      rose: {
        name: "玫瑰奶茶風",
        pageBg: "linear-gradient(180deg,#fff4f7 0%,#f9dde6 100%)",
        cardBg: "rgba(255,250,252,0.92)",
        cardBorder: "1px solid rgba(145,78,101,0.12)",
        text: "#5a3141",
        subText: "#8b6573",
        accent: "#b35c7a",
        inputBg: "rgba(255,255,255,0.84)",
        inputBorder: "1px solid rgba(145,78,101,0.14)",
        buttonMainBg: "#a14b68",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.72)",
        buttonGhostText: "#5a3141",
        previewBg: "linear-gradient(180deg,#fffafc 0%,#fdebf1 100%)",
        previewBorder: "1px solid rgba(145,78,101,0.08)",
      },
      market: {
        name: "招牌米白",
        pageBg: "linear-gradient(180deg,#f6f1e9 0%,#eee5d8 100%)",
        cardBg: "rgba(255,251,246,0.94)",
        cardBorder: "1px solid rgba(16,35,63,0.10)",
        text: "#10233f",
        subText: "#6d7685",
        accent: "#d53b2f",
        inputBg: "rgba(255,255,255,0.88)",
        inputBorder: "1px solid rgba(16,35,63,0.10)",
        buttonMainBg: "#d53b2f",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.82)",
        buttonGhostText: "#10233f",
        previewBg: "linear-gradient(180deg,#f5f1ea 0%,#efe7db 100%)",
        previewBorder: "1px solid rgba(213,59,47,0.14)",
      },
    }),
    []
  );

  const currentTheme = themeMap[theme];
  const parsedLines = parseMenuLines(menuText || "熱炒\n炒飯 80\n炒麵 80");
  const categoryCount = parsedLines.filter((line) => isLikelyCategory(line)).length;
  const itemCount = parsedLines.filter((line) => !isLikelyCategory(line)).length;

  async function handleSave() {
    if (!restaurant.trim()) {
      alert("請輸入餐廳名稱");
      return;
    }

    if (!menuText.trim()) {
      alert("請輸入菜單內容");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant,
          phone,
          address,
          hours,
          menuText,
          theme,
          logoDataUrl,
          customSlug: slug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "更新失敗");
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
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

  function removeLogo() {
    setLogoDataUrl("");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: currentTheme.inputBorder,
    background: currentTheme.inputBg,
    color: currentTheme.text,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: "13px 18px",
    borderRadius: 16,
    border: "none",
    background: currentTheme.buttonMainBg,
    color: currentTheme.buttonMainText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 800,
    boxShadow: "0 12px 26px rgba(0,0,0,0.12)",
  };

  const ghostButtonStyle: React.CSSProperties = {
    padding: "13px 18px",
    borderRadius: 16,
    border: currentTheme.inputBorder,
    background: currentTheme.buttonGhostBg,
    color: currentTheme.buttonGhostText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const sectionCardStyle: React.CSSProperties = {
    borderRadius: 24,
    padding: 22,
    border: currentTheme.cardBorder,
    background: currentTheme.cardBg,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  };

  const themeCardStyle = (value: ThemeType): React.CSSProperties => ({
    borderRadius: 18,
    padding: 16,
    border: theme === value ? `2px solid ${currentTheme.accent}` : currentTheme.inputBorder,
    background:
      value === "dark"
        ? "linear-gradient(180deg,#202020 0%,#090909 100%)"
        : value === "light"
        ? "linear-gradient(180deg,#ffffff 0%,#f0f0f0 100%)"
        : value === "warm"
        ? "linear-gradient(180deg,#f8efe3 0%,#e7d2b8 100%)"
        : value === "ocean"
        ? "linear-gradient(180deg,#f5fdff 0%,#d8eef7 100%)"
        : value === "forest"
        ? "linear-gradient(180deg,#f5faf5 0%,#d7e8d7 100%)"
        : "linear-gradient(180deg,#fff8fb 0%,#f3d8e3 100%)",
    color:
      value === "dark"
        ? "#fff"
        : value === "light"
        ? "#111"
        : value === "warm"
        ? "#4e3426"
        : value === "ocean"
        ? "#0f3550"
        : value === "forest"
        ? "#233b2c"
        : "#5a3141",
    cursor: "pointer",
    minHeight: 112,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: theme === value ? "0 12px 30px rgba(0,0,0,0.10)" : "none",
  });

  return (
    <div className="admin-editor-layout">
      <div className="admin-editor-main">
        <section style={sectionCardStyle}>
          <div className="admin-section-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="admin-section-title" style={{ color: currentTheme.text }}>編輯資訊總覽</div>
              <div className="admin-section-subtitle" style={{ color: currentTheme.subText }}>
                這裡集中管理餐廳基本資料、網址代稱、品牌外觀與菜單內容。
              </div>
            </div>
            <span className="admin-pill">目前風格：{currentTheme.name}</span>
          </div>

          <div className="admin-stats-grid" style={{ marginTop: 18 }}>
            <MiniInfo label="餐點數" value={String(itemCount)} textColor={currentTheme.text} muted={currentTheme.subText} />
            <MiniInfo label="分類數" value={String(categoryCount)} textColor={currentTheme.text} muted={currentTheme.subText} />
            <MiniInfo label="網址代稱" value={slug.trim() || "未設定"} textColor={currentTheme.text} muted={currentTheme.subText} />
            <MiniInfo label="公開路徑" value={publicPath} textColor={currentTheme.text} muted={currentTheme.subText} />
          </div>
        </section>

        <section style={sectionCardStyle}>
          <SectionTitle title="基本資料" subtitle="先把店名、聯絡資訊與營業時間整理好。" color={currentTheme.text} muted={currentTheme.subText} />

          <div style={{ marginTop: 18 }}>
            <div className="admin-field-label" style={{ color: currentTheme.text }}>餐廳名稱</div>
            <input value={restaurant} onChange={(e) => setRestaurant(e.target.value)} style={inputStyle} placeholder="例如：友愛熱炒" />
          </div>

          <div className="admin-form-grid-2" style={{ marginTop: 16 }}>
            <div>
              <div className="admin-field-label" style={{ color: currentTheme.text }}>電話</div>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="例如：0912-345-678" />
            </div>
            <div>
              <div className="admin-field-label" style={{ color: currentTheme.text }}>營業時間</div>
              <input value={hours} onChange={(e) => setHours(e.target.value)} style={inputStyle} placeholder="例如：17:00 - 01:00" />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="admin-field-label" style={{ color: currentTheme.text }}>地址</div>
            <input value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} placeholder="例如：嘉義市西區友愛路100號" />
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="admin-field-label" style={{ color: currentTheme.text }}>自訂網址代稱</div>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} placeholder="例如：youai-hotpot" />
            <div style={{ marginTop: 8, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
              輸入後可讓公開網址更好記。建議使用短一點、容易唸的英文或拼音。
            </div>
            <div style={{ marginTop: 10, borderRadius: 14, padding: "10px 12px", background: currentTheme.inputBg, border: currentTheme.inputBorder, color: currentTheme.text, fontSize: 14 }}>
              公開網址預覽：<strong>{publicPath}</strong>
            </div>
          </div>
        </section>

        <section style={sectionCardStyle}>
          <SectionTitle title="品牌與主題" subtitle="上傳 Logo、切換風格，讓前台更像正式品牌頁。" color={currentTheme.text} muted={currentTheme.subText} />

          <div className="admin-form-grid-2" style={{ marginTop: 18, alignItems: "start" }}>
            <div>
              <div className="admin-field-label" style={{ color: currentTheme.text }}>餐廳 Logo</div>
              <label style={{ display: "block", borderRadius: 22, border: currentTheme.inputBorder, background: currentTheme.inputBg, padding: 20, textAlign: "center", cursor: "pointer" }}>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                {logoDataUrl ? (
                  <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#fff", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", padding: 10 }}>
                    <img src={logoDataUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 10px", background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontWeight: 700 }}>LOGO</div>
                )}
                <div style={{ fontWeight: 700, color: currentTheme.text }}>{logoDataUrl ? "點擊更換 Logo" : "點擊上傳餐廳 Logo"}</div>
                <div style={{ marginTop: 6, color: currentTheme.subText, fontSize: 12 }}>建議方形圖片，前台顯示會更漂亮。</div>
              </label>
              {logoDataUrl ? (
                <div style={{ marginTop: 12 }}>
                  <button onClick={removeLogo} style={ghostButtonStyle}>移除 Logo</button>
                </div>
              ) : null}
            </div>

            <div>
              <div className="admin-field-label" style={{ color: currentTheme.text }}>主題風格</div>
              <div className="admin-theme-grid">
                <div onClick={() => setTheme("dark")} style={themeCardStyle("dark")}>
                  <div style={{ fontWeight: 800 }}>黑色餐廳風</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>質感、夜店、燈箱感</div>
                </div>
                <div onClick={() => setTheme("light")} style={themeCardStyle("light")}>
                  <div style={{ fontWeight: 800 }}>簡約白色</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>乾淨、清楚、百搭</div>
                </div>
                <div onClick={() => setTheme("warm")} style={themeCardStyle("warm")}>
                  <div style={{ fontWeight: 800 }}>溫暖咖啡風</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>木質、餐館、溫暖感</div>
                </div>
                <div onClick={() => setTheme("ocean")} style={themeCardStyle("ocean")}>
                  <div style={{ fontWeight: 800 }}>海洋清新風</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>清爽、海味、明亮感</div>
                </div>
                <div onClick={() => setTheme("forest")} style={themeCardStyle("forest")}>
                  <div style={{ fontWeight: 800 }}>森林自然風</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>自然、手作、健康感</div>
                </div>
                <div onClick={() => setTheme("rose")} style={themeCardStyle("rose")}>
                  <div style={{ fontWeight: 800 }}>玫瑰奶茶風</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>柔和、甜點、質感感</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={sectionCardStyle}>
          <SectionTitle title="菜單內容" subtitle="建議用一個分類接多個菜名的方式，後台維護最輕鬆。" color={currentTheme.text} muted={currentTheme.subText} />

          <div style={{ marginTop: 18 }}>
            <textarea
              rows={16}
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              placeholder={`例如：\n鵝肉\n鹽水鵝肉 200\n麻油鵝肉 220\n\n主食\n炒飯 80\n炒麵 80`}
            />
            <div style={{ marginTop: 10, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
              規則：單獨一行會被視為分類；有價格的行會自動顯示成品項。像「炒蝦球 200」這種格式最穩。
            </div>
          </div>
        </section>

        <section style={{ ...sectionCardStyle, position: "sticky", bottom: 16 }}>
          <div className="admin-actions-row">
            <button onClick={handleSave} disabled={saving} style={primaryButtonStyle}>
              {saving ? "儲存中..." : saved ? "已儲存完成" : "儲存更新"}
            </button>
            <Link href="/dashboard" style={ghostButtonStyle}>返回後台</Link>
            <Link href={publicPath} target="_blank" style={ghostButtonStyle}>查看公開頁</Link>
          </div>
        </section>
      </div>

      <aside className="admin-editor-side">
        <div style={{ ...sectionCardStyle, position: "sticky", top: 20, color: currentTheme.text }}>
          <SectionTitle title="即時預覽" subtitle="右側會模擬客人手機看到的前台樣子。" color={currentTheme.text} muted={currentTheme.subText} />

          <div style={{ marginTop: 18, borderRadius: 28, padding: 24, background: currentTheme.previewBg, border: currentTheme.previewBorder, minHeight: 620 }}>
            <div style={{ textAlign: "center" }}>
              {logoDataUrl ? (
                <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 14px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", padding: 10 }}>
                  <img src={logoDataUrl} alt="logo preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 14px", background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: currentTheme.subText, border: currentTheme.previewBorder }}>
                  LOGO
                </div>
              )}

              <div style={{ fontSize: 12, letterSpacing: 3, opacity: 0.7, marginBottom: 8 }}>DIGITAL MENU</div>
              <h2 style={{ margin: 0, fontSize: 28 }}>{restaurant || "餐廳名稱"}</h2>
              <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8, lineHeight: 1.8 }}>
                {phone || "電話"}
                <br />
                {address || "地址"}
                <br />
                {hours || "營業時間"}
              </div>
            </div>

            <div style={{ marginTop: 22, borderTop: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", paddingTop: 16 }}>
              {parsedLines.map((line, index) =>
                isLikelyCategory(line) ? (
                  <div key={`${line}-${index}`} style={{ marginTop: index === 0 ? 0 : 14, marginBottom: 6, fontWeight: 800, color: currentTheme.accent }}>
                    {line}
                  </div>
                ) : (
                  <div key={`${line}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", fontSize: 15 }}>
                    <span>{line.replace(/\s+\S+$/, "")}</span>
                    <span>{line.match(/\S+$/)?.[0]}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div style={{ marginTop: 16, borderRadius: 18, padding: 16, background: currentTheme.inputBg, border: currentTheme.inputBorder }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>公開資訊</div>
            <div style={{ color: currentTheme.subText, fontSize: 14, lineHeight: 1.8 }}>
              目前風格：{currentTheme.name}
              <br />
              公開路徑：{publicPath}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function parseMenuLines(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isLikelyCategory(line: string) {
  return line.split(/\s+/).length === 1;
}

function SectionTitle({ title, subtitle, color, muted }: { title: string; subtitle: string; color: string; muted: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.7, color: muted }}>{subtitle}</div>
    </div>
  );
}

function MiniInfo({ label, value, textColor, muted }: { label: string; value: string; textColor: string; muted: string }) {
  return (
    <div style={{ borderRadius: 18, padding: 18, border: "1px solid rgba(127,127,127,0.12)", background: "rgba(255,255,255,0.03)" }}>
      <div style={{ color: muted, fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ color: textColor, fontSize: 22, fontWeight: 800, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
