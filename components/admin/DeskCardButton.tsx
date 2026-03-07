"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function getPublicBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (envUrl) return /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  return typeof window !== "undefined" ? window.location.origin : "";
}

export default function DeskCardButton({
  restaurant,
  publicUrl,
}: {
  restaurant: string;
  publicUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const fullUrl = `${getPublicBaseUrl()}${publicUrl}`;
  const fileName = `${restaurant || "menu"}-qr.png`;

  function downloadQr() {
    const canvas = document.getElementById(`qr-${encodeURIComponent(fileName)}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const href = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = href;
    a.download = fileName;
    a.click();
  }

  return (
    <>
      <button type="button" className="uu-btn uu-btn-secondary" onClick={() => setOpen(true)}>
        下載 QR
      </button>
      {open ? (
        <div className="uu-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="uu-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="uu-modal-head">
              <div>
                <div className="uu-kicker">QR Code</div>
                <h3>{restaurant}</h3>
              </div>
              <button type="button" className="uu-icon-btn" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="uu-qr-sheet">
              <QRCodeCanvas id={`qr-${encodeURIComponent(fileName)}`} value={fullUrl} size={220} includeMargin level="H" />
              <div className="uu-qr-meta">
                <div className="uu-qr-url">{fullUrl}</div>
                <div className="uu-form-actions">
                  <button type="button" className="uu-btn uu-btn-primary" onClick={downloadQr}>下載 PNG</button>
                  <button type="button" className="uu-btn uu-btn-secondary" onClick={async () => navigator.clipboard.writeText(fullUrl)}>複製網址</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
