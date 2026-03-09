"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "登入失敗");
        return;
      }

      router.push(ROUTES.dashboard);
      router.refresh();
    } catch {
      setError("登入失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="uu-login-form">
      <label className="uu-field">
        <span>帳號</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="請輸入管理員帳號"
          autoComplete="username"
        />
      </label>

      <label className="uu-field">
        <span>密碼</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="請輸入密碼"
          autoComplete="current-password"
        />
      </label>

      {error ? <div className="uu-form-error">{error}</div> : null}

      <button type="submit" className="uu-primary-btn" disabled={submitting}>
        {submitting ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
