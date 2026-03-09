import { isAdminAuthenticated } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";
import LoginForm from "@/app/uu/login/LoginForm";

export default async function LoginPage() {
  if (await isAdminAuthenticated()) redirect(ROUTES.dashboard);

  return (
    <main className="uu-login-shell">
      <section className="uu-login-card">
        <div className="uu-kicker">UU MENU ADMIN</div>
        <h1>管理員登入</h1>
        <p>這個版本先由你自己管理所有店家菜單。登入後可進入深色專業型後台，新增店家、修改菜單、查看公開頁與下載 QR。</p>
        <LoginForm />
        <div className="uu-login-note">
          帳密請在 <code>.env.local</code> 設定：<code>ADMIN_USERNAME</code>、<code>ADMIN_PASSWORD</code>、<code>ADMIN_SECRET</code>
        </div>
      </section>
    </main>
  );
}
