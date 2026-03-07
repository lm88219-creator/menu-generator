"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteMenuButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("確定要刪除這份菜單嗎？刪除後無法復原。");
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "刪除失敗");
        return;
      }
      router.refresh();
    } catch {
      alert("刪除失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="uu-btn uu-btn-danger" onClick={handleDelete} disabled={loading}>
      {loading ? "刪除中..." : "刪除"}
    </button>
  );
}
