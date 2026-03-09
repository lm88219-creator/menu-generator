# UU MENU

餐廳 QR Code 菜單生成器與多店後台管理專案。

## 目前功能
- 首頁快速建立菜單、公開網址、QR Code 與分享圖
- 多店 Dashboard，支援搜尋、篩選、排序、快速進入編輯
- 編輯頁可修改店家資訊、菜單內容、主題、Logo、桌號 QR
- 公開菜單頁支援多種主題、分類導覽、售完狀態與桌號參數
- Upstash Redis 儲存菜單、slug 對應與 summary index

## 技術
- Next.js App Router
- TypeScript
- Upstash Redis
- qrcode.react

## 重要路由
- `/` 首頁建立菜單
- `/dashboard` 後台列表
- `/dashboard/[id]` 編輯菜單
- `/menu/[slug]` 公開菜單頁
- `/login` 後台登入

## 環境變數
請在 `.env.local` 設定：
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`

## 本次整理重點
- Dashboard 新增待整理判斷、狀態篩選與排序
- 編輯頁補上工作台摘要、未儲存提示、sticky 儲存列
- 公開頁補上快速操作按鈕、分類數量與品項總覽
- Store 層加入 `schemaVersion` 與資料 normalize
- payload 驗證補強，避免 slug 與 logo 格式異常
