"use client";

import { useMemo, useState } from "react";
import type { MenuItemForm } from "./shared-ui";

type CategorySummary = { name: string; count: number };

type Props = {
  activeCount: number;
  categorySummary: CategorySummary[];
  bulkDirty: boolean;
  quickInput: string;
  handleQuickInputChange: (value: string) => void;
  applyQuickInput: () => void;
  handleSave: () => void;
  saving: boolean;
  formItems: MenuItemForm[];
  updateFormItem: (index: number, patch: Partial<MenuItemForm>) => void;
  duplicateItem: (index: number) => void;
  removeItem: (index: number) => void;
  addItem: () => void;
};

export function MenuItemsSection(props: Props) {
  const {
    activeCount,
    categorySummary,
    bulkDirty,
    quickInput,
    handleQuickInputChange,
    applyQuickInput,
    handleSave,
    saving,
    formItems,
    updateFormItem,
    duplicateItem,
    removeItem,
    addItem,
  } = props;

  const [editorMode, setEditorMode] = useState<"split" | "bulk" | "items">("split");

  const soldOutCount = useMemo(() => formItems.filter((item) => item.name.trim() && item.soldOut).length, [formItems]);
  const notesCount = useMemo(() => formItems.filter((item) => item.note.trim()).length, [formItems]);

  return (
    <section id="menu-items" className="uu-simple-section uu-editor-v4-section uu-editor-v4-menu-section">
      <div className="uu-section-head uu-editor-v4-section-head-pro uu-menu-editor-section-head-refined">
        <div>
          <h2>菜單品項</h2>
          <p>把大量輸入和逐項微調分成清楚的兩種模式，整理整份菜單時不會再那麼亂。</p>
        </div>
        <div className="uu-editor-mode-switch" role="tablist" aria-label="菜單編輯模式">
          <button type="button" className={`uu-editor-mode-chip ${editorMode === "split" ? "is-active" : ""}`} onClick={() => setEditorMode("split")}>雙欄</button>
          <button type="button" className={`uu-editor-mode-chip ${editorMode === "bulk" ? "is-active" : ""}`} onClick={() => setEditorMode("bulk")}>只看整份輸入</button>
          <button type="button" className={`uu-editor-mode-chip ${editorMode === "items" ? "is-active" : ""}`} onClick={() => setEditorMode("items")}>只看逐項微調</button>
        </div>
      </div>

      <div className="uu-menu-editor-slimbar uu-menu-editor-slimbar-refined">
        <div className="uu-menu-editor-slimbar-copy">
          <strong>{activeCount} 項供應中</strong>
          <small>{soldOutCount} 項停售中 ・ {notesCount} 項含備註</small>
        </div>
        <div className="uu-menu-editor-category-tags">
          {categorySummary.length ? categorySummary.slice(0, 8).map((category) => (
            <span key={category.name}>{category.name} ・ {category.count}</span>
          )) : <span>尚未建立分類</span>}
        </div>
      </div>

      <div className={`uu-menu-editor-dual-layout uu-menu-editor-dual-layout-a is-mode-${editorMode}`}>
        {editorMode !== "items" ? (
          <section className="uu-menu-editor-bulk-card uu-menu-editor-bulk-card-a">
            <div className="uu-menu-editor-bulk-innerbox">
              <div className="uu-menu-editor-bulk-head uu-menu-editor-bulk-head-a">
                <div>
                  <strong>快速輸入整份菜單</strong>
                  <p>適合先大量貼上原始菜單，再一鍵轉成右側逐項編輯格式。</p>
                </div>
                <div className="uu-menu-editor-toolbar uu-menu-editor-toolbar-a uu-menu-editor-toolbar-a-dual">
                  <button type="button" className="uu-btn uu-btn-primary uu-btn-compact" onClick={applyQuickInput}>套用到逐項編輯</button>
                  <button type="button" className="uu-btn uu-btn-secondary uu-btn-compact" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
                </div>
              </div>

              <div className={`uu-menu-editor-sync-hint uu-menu-editor-sync-hint-standalone uu-menu-editor-sync-hint-inline ${bulkDirty ? "is-warning" : ""}`}>{bulkDirty ? "左側內容尚未套用到逐項編輯" : "左側與逐項編輯已同步"}</div>

              <textarea
                className="uu-textarea uu-menu-editor-bulk-textarea uu-menu-editor-bulk-textarea-a"
                value={quickInput}
                onChange={(e) => handleQuickInputChange(e.target.value)}
                placeholder={`例如：
鵝肉
鹽水鵝肉 200
麻油鵝肉 220

主食
炒飯 80
炒麵 80`}
              />

              <div className="uu-menu-editor-bulk-footnote uu-menu-editor-bulk-footnote-a">
                <span>分類請獨立一行，品項後面接價格，備註可用「|」分隔。</span>
                <span>儲存時若左側有未套用內容，系統會自動先套用再儲存。</span>
              </div>
            </div>
          </section>
        ) : null}

        {editorMode !== "bulk" ? (
          <div className="uu-menu-editor-structured-panel uu-menu-editor-structured-panel-a">
            <div className="uu-menu-editor-structured-innerbox">
              <div className="uu-menu-editor-structured-head">
                <div>
                  <strong>逐項微調</strong>
                  <span>改價格、備註、分類或暫停供應時，用這邊會最直覺。</span>
                </div>
                <div className="uu-menu-editor-inline-stats">
                  <span>{formItems.length} 列</span>
                  <span>{categorySummary.length || 1} 類</span>
                </div>
              </div>

              <div className="uu-items-stack uu-menu-editor-stack uu-menu-editor-stack-refined">
                {formItems.map((item, index) => (
                  <article key={item.uid} className="uu-menu-item-row-card uu-menu-item-row-card-minimal is-focused">
                    <div className="uu-menu-item-row-topline">
                      <span className="uu-menu-item-index">#{index + 1}</span>
                      {item.soldOut ? <span className="uu-status is-off">停售中</span> : <span className="uu-status is-on">供應中</span>}
                    </div>
                    <div className="uu-menu-item-row-grid uu-menu-item-row-grid-minimal">
                      <input className="uu-input uu-input-compact" value={item.category} onChange={(e) => updateFormItem(index, { category: e.target.value })} placeholder="分類" aria-label={`第 ${index + 1} 項分類`} />
                      <input className="uu-input uu-input-compact uu-menu-item-name-input-minimal" value={item.name} onChange={(e) => updateFormItem(index, { name: e.target.value })} placeholder="菜名" aria-label={`第 ${index + 1} 項菜名`} />
                      <div className="uu-price-input-wrap uu-price-input-wrap-pro uu-price-input-wrap-compact">
                        <span>$</span>
                        <input className="uu-input uu-input-compact" value={item.price} onChange={(e) => updateFormItem(index, { price: e.target.value.replace(/[^0-9]/g, "") })} placeholder="價格" aria-label={`第 ${index + 1} 項價格`} />
                      </div>
                      <input className="uu-input uu-input-compact" value={item.note} onChange={(e) => updateFormItem(index, { note: e.target.value })} placeholder="備註" aria-label={`第 ${index + 1} 項備註`} />
                      <label className="uu-menu-item-toggle-cell uu-menu-item-toggle-cell-minimal" aria-label={`第 ${index + 1} 項供應中`}>
                        <input type="checkbox" checked={!item.soldOut} onChange={(e) => updateFormItem(index, { soldOut: !e.target.checked })} />
                        <span>{item.soldOut ? "停售" : "供應"}</span>
                      </label>
                      <div className="uu-menu-item-delete-cell uu-menu-item-delete-cell-minimal">
                        <button type="button" className="uu-btn uu-btn-secondary uu-btn-icon-only" onClick={() => duplicateItem(index)} aria-label={`複製第 ${index + 1} 項`}>複製</button>
                        <button type="button" className="uu-btn uu-btn-danger uu-btn-icon-only" onClick={() => removeItem(index)} aria-label={`刪除第 ${index + 1} 項`}>刪除</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="uu-menu-editor-structured-actions uu-menu-editor-structured-actions-bottom">
                <button type="button" className="uu-btn uu-btn-secondary uu-btn-compact" onClick={addItem}>＋ 新增品項</button>
                <button type="button" className="uu-btn uu-btn-primary uu-btn-compact" onClick={handleSave} disabled={saving}>{saving ? "儲存中..." : "儲存變更"}</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
