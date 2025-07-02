# 💸 Split-Bill

一個簡單的朋友出遊分帳小工具，無需登入、不儲存資料，純前端、隨用即走 ✨  
👉 [線上體驗 DEMO](https://你的帳號.github.io/split-bill/)

---

## ✨ 功能介紹

- ✅ 成員可新增、刪除（若已參與分帳則不可刪除）
- ✅ 每筆花費可紀錄：金額、付款人、用途、分帳對象
- ✅ 自動計算每人應付款項，並支援雙向還款抵銷
- ✅ 結帳結果依「付款人」分組表格清楚呈現
- ✅ RWD 響應式介面：手機版在下方、桌機版右側
- ✅ 部署於 GitHub Pages，隨時可開即用

---

## 📦 技術架構

- ⚡ [Vue 3 + `<script setup>`](https://vuejs.org/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)
- 🚀 [Vite](https://vitejs.dev/)
- 🔄 [GitHub Actions](https://docs.github.com/en/actions) 自動部署

---

## 🛠 開發指令

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 本地預覽
npm run preview

# 編譯 build（若不用 CI）
npm run build

#（如果不使用 Actions）手動部署到 GitHub Pages
npm run deploy
