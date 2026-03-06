"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function getPublicBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) {
    return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  }
  return window.location.origin;
}


export default function DeleteButton({
  id,
  publicUrl,
}: {
  id: string;
  publicUrl: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [copying, setCopying] = useState(false);

  async function handleCopy() {
    try {
      setCopying(true);
      const fullUrl = `${getPublicBaseUrl()}${publicUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      alert("已複製公開連結");
    } catch (error) {
      console.error(error);
      alert("複製失敗");
    } finally {
      setTimeout(() => setCopying(false), 600);
    }
  }

  async function handleDelete() {
    const ok = window.confirm("確定要刪除這份菜單嗎？刪除後無法恢復。");
    if (!ok) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "刪除失敗");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("刪除失敗");
    } finally {
      setDeleting(false);
    }
  }

  const secondaryButtonStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  };

  const dangerButtonStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,120,120,0.24)",
    background: "rgba(255,80,80,0.10)",
    color: "#ffd4d4",
    fontSize: 14,
    fontWeight: 700,
    cursor: deleting ? "not-allowed" : "pointer",
    opacity: deleting ? 0.7 : 1,
  };

  return (
    <>
      <button
        onClick={handleCopy}
        disabled={copying}
        style={{
          ...secondaryButtonStyle,
          opacity: copying ? 0.7 : 1,
        }}
      >
        {copying ? "複製中..." : "複製連結"}
      </button>

      <button onClick={handleDelete} disabled={deleting} style={dangerButtonStyle}>
        {deleting ? "刪除中..." : "刪除"}
      </button>
    </>
  );
}