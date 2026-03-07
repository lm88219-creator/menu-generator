"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/uu/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleLogout} className="uu-btn uu-btn-secondary" disabled={loading}>
      {loading ? "登出中..." : "登出"}
    </button>
  );
}
