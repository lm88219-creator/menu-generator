"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

  const themeMap = useMemo(
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
        previewBorder: "1px solid rgba(88,54,24,0.08)",
      },
      ocean: {
        name: "海洋清新風",
        pageBg: "linear-gradient(180deg,#e8f7ff 0%,#cfeeff 100%)",
        cardBg: "rgba(255,255,255,0.88)",
        cardBorder: "1px solid rgba(18,108,149,0.14)",
        text: "#0f3550",
        subText: "#4d7289",
        accent: "#118ab2",
        inputBg: "rgba(255,255,255,0.88)",
        inputBorder: "1px solid rgba(18,108,149,0.14)",
        buttonMainBg: "#0f6e91",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.72)",
        buttonGhostText: "#0f3550",
        previewBg: "linear-gradient(180deg,#ffffff 0%,#dff4ff 100%)",
        previewBorder: "1px solid rgba(18,108,149,0.08)",
      },
      forest: {
        name: "森林自然風",
        pageBg: "linear-gradient(180deg,#edf6ef 0%,#d6e7d8 100%)",
        cardBg: "rgba(250,255,250,0.92)",
        cardBorder: "1px solid rgba(47,94,61,0.14)",
        text: "#233b2c",
        subText: "#5c7564",
        accent: "#2f6b3f",
        inputBg: "rgba(255,255,255,0.82)",
        inputBorder: "1px solid rgba(47,94,61,0.14)",
        buttonMainBg: "#2f6b3f",
        buttonMainText: "#fff",
        buttonGhostBg: "rgba(255,255,255,0.72)",
        buttonGhostText: "#233b2c",
        previewBg: "linear-gradient(180deg,#fbfffb 0%,#e4f0e5 100%)",
        previewBorder: "1px solid rgba(47,94,61,0.08)",
      },
      rose: {
        name: "玫瑰奶茶風",
        pageBg: "linear-gradient(180deg,#fff2f6 0%,#f4dbe3 100%)",
        cardBg: "rgba(255,250,252,0.92)",
        cardBorder: "1px solid rgba(145,78,101,0.14)",
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
    }),
    []
  );

  const currentTheme = themeMap[theme];

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
        headers: {
          "Content-Type": "application/json",
        },
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

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  }

  function parseMenuLines(raw: string) {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function isLikelyCategory(line: string) {
    const parts = line.split(/\s+/);
    return parts.length === 1;
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("請上傳圖片檔");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoDataUrl("");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: currentTheme.inputBorder,
    background: currentTheme.inputBg,
    color: currentTheme.text,
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  };

  const mainButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    borderRadius: 14,
    border: "none",
    background: currentTheme.buttonMainBg,
    color: currentTheme.buttonMainText,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
  };

  const ghostButtonStyle: React.CSSProperties = {
    padding: "12px 18px",
    borderRadius: 14,
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

  const themeCardStyle = (value: ThemeType): React.CSSProperties => ({
    borderRadius: 18,
    padding: 16,
    border:
      theme === value
        ? `2px solid ${currentTheme.accent}`
        : currentTheme.inputBorder,
    background:
      value === "dark"
        ? "linear-gradient(180deg,#202020 0%,#090909 100%)"
        : value === "light"
        ? "linear-gradient(180deg,#ffffff 0%,#f0f0f0 100%)"
        : "linear-gradient(180deg,#f8efe3 0%,#e7d2b8 100%)",
    color: value === "dark" ? "#fff" : value === "light" ? "#111" : value === "warm" ? "#4e3426" : value === "ocean" ? "#0f3550" : value === "forest" ? "#233b2c" : "#5a3141",
    cursor: "pointer",
    minHeight: 108,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: 24,
      }}
    >
      <div
        style={{
          borderRadius: 30,
          padding: 32,
          border: currentTheme.cardBorder,
          background: currentTheme.cardBg,
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          color: currentTheme.text,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            fontSize: 13,
            color: currentTheme.subText,
          }}
        >
          編輯模式
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>餐廳名稱</div>
          <input
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            style={inputStyle}
            placeholder="例如：友愛熱炒"
          />
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <div>
            <div style={{ marginBottom: 8, fontWeight: 700 }}>電話</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              placeholder="例如：0912-345-678"
            />
          </div>

          <div>
            <div style={{ marginBottom: 8, fontWeight: 700 }}>營業時間</div>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              style={inputStyle}
              placeholder="例如：17:00 - 01:00"
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>地址</div>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle}
            placeholder="例如：嘉義市西區友愛路100號"
          />
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>自訂網址代稱（v2）</div>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={inputStyle}
            placeholder="例如：youai-hotpot"
          />
          <div style={{ marginTop: 8, color: currentTheme.subText, fontSize: 13, lineHeight: 1.7 }}>
            可選填。可輸入中文、英文字母、數字與 - ，公開網址可用 /menu/店名 或你自訂的代稱。
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ marginBottom: 10, fontWeight: 700 }}>餐廳 Logo</div>

          <div
            style={{
              borderRadius: 18,
              border: currentTheme.inputBorder,
              background: currentTheme.inputBg,
              padding: 16,
            }}
          >
            <label
              style={{
                display: "block",
                borderRadius: 16,
                border: "2px dashed rgba(0,0,0,0.15)",
                padding: "24px",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(255,255,255,0.5)",
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: "none" }}
              />

              {logoDataUrl ? (
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: "#fff",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    padding: 10,
                  }}
                >
                  <img
                    src={logoDataUrl}
                    alt="logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600 }}>點擊更換餐廳 Logo</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    PNG / JPG 建議方形圖片
                  </div>
                </div>
              )}
            </label>

            {logoDataUrl && (
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <button onClick={removeLogo} style={ghostButtonStyle}>
                  移除 Logo
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ marginBottom: 10, fontWeight: 700 }}>菜單風格</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            <div onClick={() => setTheme("dark")} style={themeCardStyle("dark")}>
              <div style={{ fontWeight: 700 }}>黑色餐廳風</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>質感、夜店、燈箱感</div>
            </div>

            <div onClick={() => setTheme("light")} style={themeCardStyle("light")}>
              <div style={{ fontWeight: 700 }}>簡約白色</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>乾淨、清楚、百搭</div>
            </div>

            <div onClick={() => setTheme("warm")} style={themeCardStyle("warm")}>
              <div style={{ fontWeight: 700 }}>溫暖咖啡風</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>木質、餐館、溫暖感</div>
            </div>

            <div onClick={() => setTheme("ocean")} style={themeCardStyle("ocean")}>
              <div style={{ fontWeight: 700 }}>海洋清新風</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>清爽、海味、明亮感</div>
            </div>

            <div onClick={() => setTheme("forest")} style={themeCardStyle("forest")}>
              <div style={{ fontWeight: 700 }}>森林自然風</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>自然、手作、健康感</div>
            </div>

            <div onClick={() => setTheme("rose")} style={themeCardStyle("rose")}>
              <div style={{ fontWeight: 700 }}>玫瑰奶茶風</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>柔和、甜點、質感感</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>菜單內容</div>

          <textarea
            rows={14}
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            placeholder={`例如：
鵝肉
鹽水鵝肉 200
麻油鵝肉 220

主食
炒飯 80
炒麵 80`}
          />
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button onClick={handleSave} disabled={saving} style={mainButtonStyle}>
            {saving ? "儲存中..." : saved ? "已儲存完成" : "儲存更新"}
          </button>

          <Link href="/dashboard" style={ghostButtonStyle}>
            返回後台
          </Link>

          <Link href={publicPath} target="_blank" style={ghostButtonStyle}>
            查看公開頁
          </Link>
        </div>
      </div>

      <div
        style={{
          borderRadius: 30,
          padding: 28,
          border: currentTheme.cardBorder,
          background: currentTheme.cardBg,
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          position: "sticky",
          top: 20,
          height: "fit-content",
          color: currentTheme.text,
        }}
      >
        <div style={{ fontSize: 14, color: currentTheme.subText, marginBottom: 8 }}>
          即時預覽
        </div>

        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background: currentTheme.previewBg,
            border: currentTheme.previewBorder,
            color: theme === "dark" ? "#fff" : theme === "light" ? "#111" : theme === "warm" ? "#4e3426" : theme === "ocean" ? "#0f3550" : theme === "forest" ? "#233b2c" : "#5a3141",
            minHeight: 580,
          }}
        >
          <div style={{ textAlign: "center" }}>
            {logoDataUrl ? (
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  padding: 10,
                }}
              >
                <img
                  src={logoDataUrl}
                  alt="logo preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: theme === "dark" ? "#aaa" : theme === "light" ? "#666" : theme === "warm" ? "#7b6756" : theme === "ocean" ? "#4d7289" : theme === "forest" ? "#5c7564" : "#8b6573",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                LOGO
              </div>
            )}

            <div
              style={{
                fontSize: 12,
                letterSpacing: 3,
                opacity: 0.7,
                marginBottom: 8,
              }}
            >
              DIGITAL MENU
            </div>

            <h2 style={{ margin: 0, fontSize: 28 }}>
              {restaurant || "餐廳名稱"}
            </h2>

            <div
              style={{
                marginTop: 10,
                fontSize: 14,
                opacity: 0.8,
                lineHeight: 1.8,
              }}
            >
              {phone || "電話"}
              <br />
              {address || "地址"}
              <br />
              {hours || "營業時間"}
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              borderTop:
                theme === "dark"
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(0,0,0,0.08)",
              paddingTop: 16,
            }}
          >
            {parseMenuLines(menuText || "熱炒\n炒飯 80\n炒麵 80").map((line, index) =>
              isLikelyCategory(line) ? (
                <div
                  key={`${line}-${index}`}
                  style={{
                    marginTop: index === 0 ? 0 : 14,
                    marginBottom: 6,
                    fontWeight: 700,
                    color:
                      theme === "dark"
                        ? "#f4d58d"
                        : theme === "light"
                        ? "#0b57d0"
                        : "#8b5e34",
                  }}
                >
                  {line}
                </div>
              ) : (
                <div
                  key={`${line}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom:
                      theme === "dark"
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid rgba(0,0,0,0.06)",
                    fontSize: 15,
                  }}
                >
                  <span>{line.replace(/\s+\S+$/, "")}</span>
                  <span>{line.match(/\S+$/)?.[0]}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div style={{ marginTop: 18, color: currentTheme.subText, fontSize: 14 }}>
          目前風格：{currentTheme.name}
        </div>
      </div>
    </div>
  );
}