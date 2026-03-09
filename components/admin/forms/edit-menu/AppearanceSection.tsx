import type { ChangeEvent } from "react";
import type { MenuItemForm, ThemeType } from "./shared-ui";
import { THEME_OPTIONS } from "./shared-ui";

type PreviewTokens = ReturnType<typeof import("./shared-ui").getPreviewTokens>;

type Props = {
  selectedTheme: (typeof THEME_OPTIONS)[number];
  theme: ThemeType;
  setTheme: (value: ThemeType) => void;
  logoDataUrl: string;
  handleLogoUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  setLogoDataUrl: (value: string) => void;
  previewTokens: PreviewTokens;
  restaurant: string;
  previewSubtitle: string;
  previewCategory: string;
  previewItems: MenuItemForm[];
};

export function AppearanceSection(props: Props) {
  const {
    selectedTheme,
    theme,
    setTheme,
    logoDataUrl,
    handleLogoUpload,
    setLogoDataUrl,
    previewTokens,
    restaurant,
    previewSubtitle,
    previewCategory,
    previewItems,
  } = props;

  return (
    <section id="appearance-settings" className="uu-simple-section uu-editor-v4-section uu-editor-v4-appearance-section">
      <div className="uu-section-head">
        <div>
          <h2>外觀設定</h2>
          <p>把風格挑選、Logo 與公開頁預覽整合成一個品牌設定區，選主題時更直覺也更容易判斷效果。</p>
        </div>
      </div>

      <div className="uu-editor-v4-appearance-layout">
        <div className="uu-editor-v4-appearance-main">
          <div className="uu-editor-v4-appearance-overview uu-editor-v4-appearance-overview-pro">
            <div className="uu-editor-v4-appearance-intro">
              <span className="uu-chip">目前主題：{selectedTheme.label}</span>
              <p>{selectedTheme.desc}</p>
              <div className="uu-editor-v4-appearance-tags">
                <span>公開頁同步套用</span>
                <span>{logoDataUrl ? "含 Logo" : "未使用 Logo"}</span>
                <span>預覽即時更新</span>
              </div>
            </div>
            <div className="uu-editor-v4-theme-note-accent" style={{ background: selectedTheme.accent }} />
          </div>

          <div className="uu-editor-v4-theme-selector-card uu-editor-v4-theme-selector-card-pro">
            <div className="uu-editor-v4-subhead">
              <div>
                <span>主題挑選</span>
                <strong>用更精簡的下拉選單快速切換公開頁風格</strong>
              </div>
              <div className="uu-editor-theme-preview uu-editor-theme-preview-inline uu-editor-theme-preview-inline-pro">
                {selectedTheme.preview.map((color, index) => (
                  <span key={`${selectedTheme.value}-${index}`} style={{ background: color }} />
                ))}
              </div>
            </div>
            <div className="uu-editor-v4-theme-select-wrap uu-editor-v4-theme-select-wrap-pro">
              <label className="uu-field uu-field-theme-select-pro">
                <span>選擇公開頁主題</span>
                <div className="uu-theme-select-shell">
                  <select className="uu-input uu-theme-select uu-theme-select-pro" value={theme} onChange={(e) => setTheme(e.target.value as ThemeType)}>
                    {THEME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <small>切換後，右側預覽會立即同步目前主題的色調、卡片層次與價格樣式。</small>
              </label>
              <div className="uu-editor-v4-theme-select-side uu-editor-v4-theme-select-side-pro">
                <strong>{selectedTheme.label}</strong>
                <p>{selectedTheme.desc}</p>
                <div className="uu-editor-v4-theme-select-tags">
                  <span>公開頁同步</span>
                  <span>價格色塊同步</span>
                  <span>{logoDataUrl ? "Logo 已帶入" : "文字版更乾淨"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="uu-editor-v4-theme-note-card uu-editor-v4-theme-preview-card">
            <div className="uu-editor-v4-theme-note-head">
              <div>
                <span>客戶公開頁預覽</span>
                <strong>{selectedTheme.label}</strong>
              </div>
              <div className="uu-editor-v4-theme-note-accent" style={{ background: selectedTheme.accent }} />
            </div>
            <div className="uu-editor-v4-public-preview-device">
              <div className="uu-editor-v4-public-preview-device-top">
                <span />
                <span />
                <span />
              </div>
              <div className="uu-editor-v4-public-preview uu-editor-v4-public-preview-pro" style={{ background: previewTokens.shell, color: previewTokens.text, borderColor: previewTokens.border }}>
                <div className="uu-editor-v4-public-preview-hero uu-editor-v4-public-preview-hero-themed" style={{ background: previewTokens.hero, borderColor: previewTokens.border }}>
                  <div className="uu-editor-v4-public-preview-brand-row">
                    <div className="uu-editor-v4-public-preview-badge" style={{ background: previewTokens.accentSoft, color: previewTokens.accent }}>UU MENU</div>
                    <div className="uu-editor-v4-public-preview-theme-dot" style={{ background: selectedTheme.accent }} />
                  </div>
                  <div className="uu-editor-v4-public-preview-hero-copy">
                    <strong style={{ color: previewTokens.title }}>{restaurant || "未命名店家"}</strong>
                    <span style={{ color: previewTokens.muted }}>{previewSubtitle}</span>
                  </div>
                  <div className="uu-editor-v4-public-preview-mini-meta">
                    <span style={{ background: previewTokens.panel, borderColor: previewTokens.border, color: previewTokens.muted }}>{selectedTheme.label}</span>
                    <span style={{ background: previewTokens.panel, borderColor: previewTokens.border, color: previewTokens.muted }}>{logoDataUrl ? "品牌 Logo 已套用" : "乾淨文字版"}</span>
                  </div>
                </div>

                <div className="uu-editor-v4-public-preview-shell" style={{ background: previewTokens.surface, borderColor: previewTokens.line }}>
                  <div className="uu-editor-v4-public-preview-headerline">
                    <div className="uu-editor-v4-public-preview-section-chip" style={{ background: previewTokens.soft, color: previewTokens.section }}>{previewCategory}</div>
                    <div className="uu-editor-v4-public-preview-headerline-text" style={{ color: previewTokens.muted }}>{previewSubtitle || "每日營業 11:00 - 20:00"}</div>
                  </div>
                  <div className="uu-editor-v4-public-preview-list">
                    {previewItems.map((item) => (
                      <div key={item.uid} className="uu-editor-v4-public-preview-item uu-editor-v4-public-preview-item-pro" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                        <div>
                          <strong style={{ color: previewTokens.title }}>{item.name.trim()}</strong>
                          <span style={{ color: previewTokens.muted }}>{item.note.trim() || item.category.trim() || "人氣推薦"}</span>
                        </div>
                        <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>{item.price.trim() ? `$${item.price.trim()}` : "$--"}</b>
                      </div>
                    ))}
                    {!previewItems.length ? (
                      <div className="uu-editor-v4-public-preview-item uu-editor-v4-public-preview-item-pro" style={{ background: previewTokens.panel, borderColor: previewTokens.border }}>
                        <div>
                          <strong style={{ color: previewTokens.title }}>招牌炒飯</strong>
                          <span style={{ color: previewTokens.muted }}>先新增品項，這裡會同步預覽主題效果</span>
                        </div>
                        <b style={{ color: previewTokens.accent, background: previewTokens.priceBg }}>$90</b>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="uu-editor-v4-theme-checklist">
              <div><strong>字體閱讀性</strong><span>主色與背景已一起調整，不容易看起來太花。</span></div>
              <div><strong>品牌一致性</strong><span>Logo、主題與公開頁會同步呈現同一種風格。</span></div>
              <div><strong>手機版觀感</strong><span>公開頁在手機上也會沿用這組配色與質感設定。</span></div>
            </div>
          </div>
        </div>

        <div className="uu-editor-v4-appearance-side">
          <section className="uu-editor-v4-asset-card uu-editor-v4-logo-pro-card">
            <div className="uu-section-head uu-section-head-tight">
              <div>
                <h3>Logo 設定</h3>
                <p>建議使用正方形或圓形識別，客人頁面看起來會更專業。</p>
              </div>
            </div>
            <div className="uu-editor-v4-logo-panel">
              {logoDataUrl ? (
                <div className="uu-editor-v4-logo-preview-card">
                  <img src={logoDataUrl} alt="logo preview" className="uu-editor-v4-logo-preview-large" />
                  <div className="uu-editor-v4-logo-actions">
                    <label className="uu-upload-box uu-upload-box-compact">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} />
                      <span>更換 Logo</span>
                    </label>
                    <button type="button" className="uu-btn uu-btn-secondary uu-full-width" onClick={() => setLogoDataUrl("")}>移除 Logo</button>
                  </div>
                </div>
              ) : (
                <div className="uu-editor-v4-logo-empty">
                  <label className="uu-upload-box uu-full-width">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} />
                    <span>上傳 Logo</span>
                  </label>
                  <div className="uu-inline-hint">沒有 Logo 也能正常顯示菜單，之後再補也可以。</div>
                </div>
              )}
            </div>
          </section>

          <section className="uu-editor-v4-asset-card uu-editor-v4-appearance-tips uu-editor-v4-brand-tips-card">
            <div className="uu-section-head uu-section-head-tight">
              <div>
                <h3>建議搭配</h3>
                <p>快速判斷目前外觀會不會符合店家氣質。</p>
              </div>
            </div>
            <div className="uu-editor-v4-tip-list">
              <div><strong>深色經典</strong><span>熱炒、宵夜、酒吧</span></div>
              <div><strong>簡約白</strong><span>一般餐廳、字多的菜單</span></div>
              <div><strong>暖木咖啡</strong><span>咖啡店、家常餐飲</span></div>
              <div><strong>海洋 / 森林 / 玫瑰 / 經典餐館</strong><span>需要更明確品牌調性或紙本餐館感時使用</span></div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
