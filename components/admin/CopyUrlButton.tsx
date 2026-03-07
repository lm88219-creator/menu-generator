"use client";

import { useState } from "react";

export default function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("複製失敗");
    }
  }

  return (
    <button type="button" className="uu-btn uu-btn-secondary" onClick={handleClick}>
      {copied ? "已複製" : "複製網址"}
    </button>
  );
}
