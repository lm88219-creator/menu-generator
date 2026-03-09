import { parseMenuLines, isLikelyCategory, getThemePreviewShell, type HomeFormState } from "./home-utils";

export function HomePreviewCard({
  form,
  isMobile,
  currentTheme,
}: {
  form: HomeFormState;
  isMobile: boolean;
  currentTheme: { cardBorder: string; cardBg: string; subText: string; name: string };
}) {
  const previewShell = getThemePreviewShell(form.theme);

  return (
    <div
      style={{
        borderRadius: 24,
        padding: 18,
        border: currentTheme.cardBorder,
        background: currentTheme.cardBg,
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        position: isMobile ? "static" : "sticky",
        top: 20,
        height: "fit-content",
      }}
    >
      <div
        style={{
          borderRadius: 24,
          padding: 24,
          background: previewShell.background,
          border: previewShell.border,
          color: previewShell.color,
          minHeight: isMobile ? "auto" : 520,
          maxWidth: 390,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center" }}>
          {form.logoDataUrl ? (
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
              <img src={form.logoDataUrl} alt="logo preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          ) : (
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: "50%",
                margin: "0 auto 14px",
                background: form.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: form.theme === "dark" ? "#aaa" : "#666",
                border: form.theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              LOGO
            </div>
          )}

          <div style={{ fontSize: 12, letterSpacing: 3, opacity: 0.7, marginBottom: 8 }}>DIGITAL MENU</div>
          <h2 style={{ margin: 0, fontSize: 28 }}>{form.restaurant || "餐廳名稱"}</h2>
          <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8, lineHeight: 1.8 }}>
            {form.phone || "電話"}
            <br />
            {form.address || "地址"}
            <br />
            {form.hours || "營業時間"}
          </div>
        </div>

        <div style={{ marginTop: 22, borderTop: form.theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", paddingTop: 16 }}>
          {parseMenuLines(form.menu || "熱炒\n炒飯 80\n炒麵 80").map((line, index) =>
            isLikelyCategory(line) ? (
              <div
                key={`${line}-${index}`}
                style={{
                  marginTop: index === 0 ? 0 : 14,
                  marginBottom: 6,
                  fontWeight: 700,
                  color: form.theme === "dark" ? "#f4d58d" : form.theme === "light" ? "#0b57d0" : form.theme === "classic" ? "#b91c1c" : "#8b5e34",
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
                  borderBottom: form.theme === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
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

      <div style={{ marginTop: 18, color: currentTheme.subText, fontSize: 14 }}>目前風格：{currentTheme.name}</div>
    </div>
  );
}
