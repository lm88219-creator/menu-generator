import type { ChangeEvent } from "react";
import { useCallback } from "react";


export function useLogoUpload(setLogoDataUrl: (value: string) => void) {
  return useCallback(async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請上傳圖片檔");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  }, [setLogoDataUrl]);
}
