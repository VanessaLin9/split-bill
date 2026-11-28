# 💸 Split-Bill | 朋友出遊分帳工具

A simple, elegant bill-splitting tool for friends' trips. No login required; trip data stays in your browser via localStorage. ✨
一個簡單的朋友出遊分帳小工具，無需登入，旅程資料儲存在瀏覽器 localStorage，純前端、隨用即走 ✨

👉 **[Live Demo | 線上體驗](https://vanessalin9.github.io/split-bill/)**

---

## ✨ Features | 功能介紹

### Core Functionality | 核心功能
- ✅ **Member Management | 成員管理**: Add/remove members (cannot remove if already participated in expenses)
  - 成員可新增、刪除（若已參與分帳則不可刪除）
- ✅ **Expense Tracking | 消費追蹤**: Record amount, payer, description, and split participants
  - 每筆花費可紀錄：金額、付款人、用途、分帳對象
- ✅ **Smart Settlement | 智能結算**: Auto-calculate what each person owes with bidirectional offset
  - 自動計算每人應付款項，並支援雙向還款抵銷
- ✅ **Clear Settlement Display | 清楚結帳顯示**: Grouped settlement results by debtor
  - 結帳結果依「欠款人」分組表格清楚呈現

### Multi-currency | 多幣別
- Record expenses in TWD, KRW, USD, JPY, or EUR with a rate snapshot on each expense. The picker remembers the last currency used. Records show the entered currency, with a small approximate TWD line for non-TWD expenses; split details stay in the entered currency. Settlement defaults to TWD and can be displayed in any supported currency with an official rate.
- Official rates only: Frankfurter v2 is primary, with currency-api (jsDelivr, then pages.dev) as fallback and a 5-second timeout per provider. Rates load automatically using a daily localStorage cache (`split-bill:fx-cache`); a compact reference line shows rates, dates, and a refresh control. If all providers fail, cached rates remain available. Without an official rate, foreign expenses cannot be saved; rates never default to 1:1. Refreshing rates never rewrites saved expense snapshots.
- 僅使用官方參考匯率，新增花費時選擇幣別並記住上次選擇。外幣記錄下方顯示約略台幣，更新匯率不會改動已儲存的換算金額；缺少官方匯率時無法新增外幣花費。
- TWD / KRW / JPY use whole units; USD / EUR use two decimal places.
- Trip data uses `split-bill:v3` in localStorage. Older v2 and legacy keys are preserved during migration; a damaged v3 value is backed up to `split-bill:v3:backup`.

### User Experience | 使用體驗
- 🌐 **Bilingual Support | 雙語支援**: Chinese/English interface with language toggle
  - 中英文介面切換，支援語言按鈕
- 📱 **Responsive Design | 響應式設計**: Mobile-first with desktop optimization
  - RWD 響應式介面：手機版在下方、桌機版右側
- 💾 **Local Storage | 本地儲存**: Trip data persists under `split-bill:v3` in browser localStorage
  - 資料儲存在瀏覽器本地的 `split-bill:v3`，舊版資料會自動遷移且保留原始鍵值
- 🔄 **Restore Defaults | 恢復預設**: One-click reset to default settings
  - 一鍵恢復預設設定，清除所有資料
- 🚀 **Instant Deploy | 即時部署**: Available on GitHub Pages, ready to use
  - 部署於 GitHub Pages，隨時可開即用

---

## 🎨 Screenshots | 介面截圖

### Desktop View | 桌面版
- Clean, modern interface with gradient backgrounds
- 簡潔現代化介面，漸層背景設計
- Three-panel layout: Members, Add Expense, Settlement
- 三欄式佈局：成員、新增花費、結算

### Mobile View | 手機版
- Tab-based navigation for easy mobile use
- 分頁式導航，適合手機操作
- Swipe-friendly interface
- 滑動友善的介面設計

---

## 📦 Tech Stack | 技術架構

### Frontend | 前端技術
- ⚡ **[Vue 3](https://vuejs.org/)** with Composition API & `<script setup>`
- 🎨 **[Tailwind CSS](https://tailwindcss.com/)** for styling
- 🚀 **[Vite](https://vitejs.dev/)** for build tooling
- 📱 **Responsive Design** with mobile-first approach

### Development & Deployment | 開發與部署
- 🔄 **[GitHub Actions](https://docs.github.com/en/actions)** for automated deployment
- 📦 **GitHub Pages** for hosting
- 💾 **localStorage** for data persistence
- 🌐 **Internationalization** support (i18n)

---

## 🛠 Development | 開發指令

### Prerequisites | 環境需求
- Node.js (v16 or higher)
- npm or yarn

### Commands | 指令

```bash
# Install dependencies | 安裝依賴
npm install

# Development mode | 開發模式
npm run dev

# Preview build | 本地預覽
npm run preview

# Run unit tests | 執行單元測試
npm test

# Build for production | 編譯建置
npm run build

# Manual deploy to GitHub Pages (if not using Actions)
# 手動部署到 GitHub Pages（若不使用 Actions）
npm run deploy
```

---

## 🚀 Getting Started | 快速開始

### For Users | 使用者
1. Visit the [live demo](https://vanessalin9.github.io/split-bill/)
2. Add your trip members
3. Record expenses as they happen
4. View automatic settlement calculations
5. Share the final split with friends!

### For Developers | 開發者
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:5173` in your browser

---

## 📋 Usage Guide | 使用指南

### Adding Members | 新增成員
1. Go to the Members tab/panel
2. Enter member names
3. Click "Add Member" button

### Recording Expenses | 記錄消費
1. Switch to Add Expense tab/panel
2. Fill in amount, choose currency, and select payer
3. Choose description and participants
4. Click "Add Expense"

### Viewing Settlement | 查看結算
1. Go to Settlement tab/panel
2. View who owes what to whom
3. Settlement calculations update automatically

### Restoring Defaults | 恢復預設
1. Click the restore button (🔄) in the header
2. Confirm the action in the dialog
3. All data will be reset to default state

---

## 🌐 Internationalization | 國際化

The app supports two languages:
- **中文 (Chinese)**: Traditional Chinese interface
- **English**: Full English translation

Switch languages using the language button in the header.

---

## 🤝 Contributing | 貢獻

Contributions are welcome! Please feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve translations

歡迎貢獻！您可以：
- 回報錯誤
- 建議新功能
- 提交 Pull Request
- 改進翻譯

---

## 📄 License | 授權

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments | 致謝

Built with ❤️ using Vue 3, Tailwind CSS, and modern web technologies.

使用 Vue 3、Tailwind CSS 和現代網頁技術，用心打造 ❤️

---

**Happy splitting! | 分帳愉快！** 🎉