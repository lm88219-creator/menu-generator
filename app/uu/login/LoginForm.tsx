"use client";

import { useRouter } from "next/navigation";
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
      router.push("/uu/dashboard");
      router.refresh();
    } catch {
      setError("登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, marginTop: 22 }}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="管理員帳號" style={inputStyle} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="管理員密碼" style={inputStyle} />
      {error ? <div style={{ color: "#ffb4b4", fontSize: 14 }}>{error}</div> : null}
      <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.75 : 1 }}>
        {loading ? "登入中..." : "登入後台"}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "none",
  background: "#fff",
  color: "#000",
  fontWeight: 800,
  cursor: "pointer",
};
