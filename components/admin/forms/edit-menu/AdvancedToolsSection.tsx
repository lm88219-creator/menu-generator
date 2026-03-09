import { QRCodeCanvas } from "qrcode.react";
import { Field } from "./shared";

type Props = {
  deskInput: string;
  setDeskInput: (value: string) => void;
  deskCodes: string[];
  selectedDesk: string;
  setSelectedDesk: (value: string) => void;
  selectedDeskUrl: string;
  copyText: (value: string, okText: string) => void;
  handleSave: () => void;
  saving: boolean;
  publicUrl: string;
  publicPath: string;
};

export function AdvancedToolsSection(props: Props) {
  const {
    deskInput,
    setDeskInput,
    deskCodes,
    selectedDesk,
    setSelectedDesk,
    selectedDeskUrl,
    copyText,
    handleSave,
    saving,
    publicUrl,
    publicPath,
  } = props;

  return (
    <section id="advanced-tools" className="uu-simple-section uu-editor-v4-section">
      <div className="uu-section-head">
        <div>
          <h2>進階工具</h2>
          <p>把較少用、偏分享或檢查用的工具集中到最後，避免干擾主要編輯流程。</p>
        </div>
      </div>

      <div className="uu-editor-v4-tools-grid">
        <div className="uu-editor-v4-advanced-card uu-editor-v4-tool-card uu-editor-v4-desk-tool-card">
          <div className="uu-section-head uu-section-head-tight">
            <div>
              <h3>桌號 QR 工具</h3>
              <p>把桌號輸入、桌號清單與 QR 預覽拆開，操作會更直覺也比較不亂。</p>
            </div>
          </div>

          <div className="uu-editor-v4-desk-tool-layout">
            <div className="uu-editor-v4-desk-tool-main">
              <Field label="手動輸入桌號（用空白、逗號或換行分隔）">
                <textarea
                  className="uu-textarea uu-desk-input-area"
                  value={deskInput}
                  onChange={(e) => setDeskInput(e.target.value)}
                  placeholder={`例如：A1 A2 A3
B1 B2
VIP1`}
                />
              </Field>
              <div className="uu-editor-v4-tool-toolbar">
                <div className="uu-editor-v4-tool-tip">桌號內容會暫存在這台電腦，儲存菜單後也不會消失。</div>
                <div className="uu-editor-v4-tool-actions">
                  <span className="uu-chip">共 {deskCodes.length} 組</span>
                  <button type="button" className="uu-btn uu-btn-secondary" onClick={() => setDeskInput("")}>清空桌號</button>
                  <button type="button" className="uu-btn uu-btn-secondary" onClick={() => copyText(deskCodes.join(", "), "已複製桌號清單")} disabled={!deskCodes.length}>複製桌號清單</button>
                </div>
              </div>

              <div className="uu-editor-v4-desk-list-panel">
                <div className="uu-editor-v4-qr-preview-head">
                  <strong>桌號清單</strong>
                  <span>點一下桌號即可切換右側 QR 預覽。</span>
                </div>
                {deskCodes.length ? (
                  <div className="uu-editor-v4-desk-chip-grid">
                    {deskCodes.map((tableCode) => (
                      <button
                        key={tableCode}
                        type="button"
                        className={`uu-editor-v4-desk-chip ${selectedDesk === tableCode ? "is-active" : ""}`}
                        onClick={() => setSelectedDesk(tableCode)}
                      >
                        {tableCode}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="uu-editor-v4-tool-empty">
                    <strong>尚未輸入桌號</strong>
                    <p>有需要桌卡再輸入即可，沒有用到這個功能可以先略過。</p>
                  </div>
                )}
              </div>
            </div>

            <aside className="uu-editor-v4-desk-tool-preview">
              <div className="uu-editor-v4-qr-preview-head">
                <strong>目前預覽</strong>
                <span>{selectedDesk ? `桌號 ${selectedDesk}` : "請先輸入桌號"}</span>
              </div>
              <div className="uu-editor-v4-desk-preview-card">
                {selectedDesk ? (
                  <>
                    <div className="uu-editor-v4-desk-preview-table">桌號 {selectedDesk}</div>
                    <QRCodeCanvas value={selectedDeskUrl} size={178} includeMargin level="H" />
                    <div className="uu-editor-v4-desk-preview-url">{selectedDeskUrl}</div>
                    <div className="uu-editor-v4-desk-preview-actions">
                      <button type="button" className="uu-btn uu-btn-primary uu-full-width" onClick={() => copyText(selectedDeskUrl, `已複製桌號 ${selectedDesk} 網址`)}>複製目前桌號網址</button>
                    </div>
                  </>
                ) : (
                  <div className="uu-editor-v4-tool-empty">
                    <strong>尚未選擇桌號</strong>
                    <p>輸入桌號後，右側會顯示單一桌號的 QR 預覽，方便你逐個檢查與複製。</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <section className="uu-editor-v4-advanced-card uu-editor-v4-tool-card uu-editor-v4-quick-tool-card">
          <div className="uu-section-head uu-section-head-tight">
            <div>
              <h3>快速工具</h3>
              <p>保留真正常用的動作，讓進階工具區不要太雜。</p>
            </div>
          </div>

          <div className="uu-editor-v4-quick-actions uu-editor-v4-quick-actions-stacked">
            <button type="button" className="uu-btn uu-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
            <button type="button" className="uu-btn uu-btn-secondary" onClick={() => copyText(publicUrl, "已複製公開網址")}>複製公開網址</button>
            <a className="uu-btn uu-btn-secondary" href={publicPath} target="_blank" rel="noreferrer">開啟客戶公開頁</a>
            <button type="button" className="uu-btn uu-btn-secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>回到頁面上方</button>
          </div>

          <div className="uu-editor-v4-tool-note-list">
            <div>
              <strong>桌號 QR 用在桌卡</strong>
              <span>只有需要桌號分享時再使用，平常編輯菜單可直接略過。</span>
            </div>
            <div>
              <strong>公開頁配色會一起套用</strong>
              <span>外觀設定區選的主題，客戶看到的公開菜單也會同步更新。</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
