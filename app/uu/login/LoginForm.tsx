"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "登入失敗");
        return;
      }
      router.push(ROUTES.dashboard);
      router.refresh();
    } catch {
      setError("登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="uu-login-form">
      <label className="uu-field">
        <span>管理員帳號</span>
        <input className="uu-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="請輸入帳號" />
      </label>
      <label className="uu-field">
        <span>管理員密碼</span>
        <input className="uu-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="請輸入密碼" />
      </label>
      {error ? <div className="uu-inline-hint is-error">{error}</div> : null}
      <button type="submit" className="uu-btn uu-btn-primary uu-full-width" disabled={loading}>{loading ? "登入中..." : "登入後台"}</button>
    </form>
  );
}
