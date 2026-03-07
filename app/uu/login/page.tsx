import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/uu/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at top, #1a1a1a 0%, #0b0b0b 45%, #000 100%)", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 460, borderRadius: 28, padding: 28, color: "#fff", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 18px 60px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "#cfcfcf", fontSize: 13, marginBottom: 14 }}>UU Menu Admin</div>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.2 }}>單一管理員登入</h1>
        <p style={{ color: "#aaa", lineHeight: 1.8, marginTop: 10 }}>登入後可管理菜單、編輯餐點、下載 QR Code 與產生桌號版本。</p>
        <LoginForm />
        <div style={{ marginTop: 18, fontSize: 13, color: "#8f8f8f", lineHeight: 1.8 }}>
          帳號與密碼請在 <code>.env.local</code> 設定：<br />
          <code>ADMIN_USERNAME</code>、<code>ADMIN_PASSWORD</code>、<code>ADMIN_SECRET</code>
        </div>
      </div>
    </main>
  );
}
