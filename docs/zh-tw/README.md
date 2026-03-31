# U-Finder 前端

![License](https://img.shields.io/badge/license-Apache%202.0-orange.svg)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

🌍 [English](../../README.md) | [简体中文](../zh-cn/README.md) | **繁體中文**

U-Finder 的前端子模組，這是一個基於大型語言模型的大學查找系統，旨在協助學生選擇適合他們學術之旅的大學。如果您想查看主專案，請造訪 [GRP-Team202511/u-finder](https://github.com/GRP-Team202511/u-finder)。

## 目錄

- [U-Finder 前端](#u-finder-前端)
  - [目錄](#目錄)
  - [關於](#關於)
  - [功能特性](#功能特性)
  - [技術堆疊](#技術堆疊)
  - [快速開始](#快速開始)
    - [前置要求](#前置要求)
    - [安裝](#安裝)
    - [開發](#開發)
    - [建置](#建置)
  - [專案結構](#專案結構)
  - [配置](#配置)
    - [環境變數](#環境變數)
    - [國際化](#國際化)
  - [參與貢獻](#參與貢獻)
  - [授權條款](#授權條款)

## 關於

U-Finder 前端是一個使用 Vue.js 3 和 TypeScript 建置的現代化、響應式 Web 應用程式。它為學生提供了一個直觀的使用者介面，用於與 AI 驅動的大學推薦系統進行互動、管理個人資料以及探索教育機會。

## 功能特性

- 🔐 **使用者認證** - 安全的登入和註冊功能，支援電子郵件 OTP 驗證
- 🔒 **雙重驗證** - 基於 TOTP 的兩步驟驗證，強化帳戶安全性
- 👤 **使用者資料管理** - 完整的個人資料，包含教育背景、標準化考試、獎項、實習經歷、專案、校園活動及學術成果
- 📄 **CV 解析** - AI 驅動的履歷解析，自動填入個人資料
- 💬 **AI 對話** - 基於大型語言模型的對話介面，提供個人化大學推薦
- ❤️ **收藏管理** - 儲存、查看和管理收藏的大學
- ⚙️ **帳戶設定** - 管理帳戶偏好、安全性設定及已連線裝置- 🗑️ **刪除帳戶** - 自助刪除帳戶，支援電子郵件確認
- 🛡️ **管理員面板** - 獨立的管理員應用，包含儀表板、使用者管理（封鎖/解除封鎖/刪除）、LLM 成本監控和系統日誌- 🌍 **多語言支援** - 支援英語、簡體中文和繁體中文
- 🎨 **現代化 UI/UX** - 使用 Tailwind CSS 打造簡潔且響應式的設計
- 📱 **行動端響應式** - 針對所有裝置尺寸進行最佳化
- 🔄 **狀態管理** - 使用 Pinia 進行持久化狀態管理
- 🎭 **元件庫** - 基於 shadcn-vue 建置的豐富 UI 元件

## 技術堆疊

- **框架**: [Vue.js 3](https://vuejs.org/) - 漸進式 JavaScript 框架
- **語言**: [TypeScript](https://www.typescriptlang.org/) - 型別安全的 JavaScript
- **建置工具**: [Vite](https://vitejs.dev/) - 次世代前端建置工具
- **樣式**: [Tailwind CSS](https://tailwindcss.com/) - 實用優先的 CSS 框架
- **路由**: [Vue Router](https://router.vuejs.org/) - Vue.js 官方路由
- **狀態管理**: [Pinia](https://pinia.vuejs.org/) - Vue 狀態管理函式庫
- **國際化**: [Vue I18n](https://vue-i18n.intlify.dev/) - 國際化外掛
- **UI 元件**: [shadcn-vue](https://www.shadcn-vue.com/) - 基於 Radix Vue 和 Tailwind CSS 建置的可複用元件
- **套件管理器**: [pnpm](https://pnpm.io/) - 快速、節省磁碟空間的套件管理器

## 快速開始

### 前置要求

在開始之前，請確保已安裝以下軟體：

- **Node.js** (v18.0.0 或更高版本)
- **pnpm** (v8.0.0 或更高版本)

```bash
# 全域安裝 pnpm
npm install -g pnpm
```

### 安裝

1. 複製儲存庫（如果您還沒有複製主 U-Finder 專案）：

```bash
git clone --recursive https://github.com/GRP-Team202511/u-finder
cd frontend
```

> 若已克隆但未加 `--recursive`，可手動初始化子模組：
> ```bash
> git submodule update --init --recursive
> ```

2. 進入 u-finder 目錄並安裝相依套件：

```bash
cd u-finder
pnpm install
```

### 開發

啟動開發伺服器：

```bash
pnpm dev
```

應用程式將在 `http://localhost:5173` 上執行（如果 5173 埠被佔用，將使用其他埠）。

### 建置

建置正式版本：

```bash
pnpm build
```

建置檔案將產生在 `dist` 目錄中。

在本地預覽正式建置：

```bash
pnpm preview
```

## 專案結構

Vue.js 應用程式位於 `./u-finder/` 目錄中：

```
frontend/
├── CONTRIBUTING.md     # 貢獻指南
├── README.md           # 英文文件
├── docs/               # 多語言文件
│   ├── zh-cn/         # 簡體中文文件
│   └── zh-tw/         # 繁體中文文件
├── u-finder/          # 主 Vue.js 應用程式
│   ├── public/              # 靜態資源
│   ├── src/
│   │   ├── api/            # API 整合層
│   │   │   ├── chatApi.ts       # 對話與會話 API
│   │   │   ├── favouriteApi.ts  # 收藏功能 API
│   │   │   ├── http.ts          # HTTP 用戶端配置
│   │   │   ├── profileApi.ts    # 使用者資料 API
│   │   │   └── userApi.ts       # 使用者認證 API
│   │   ├── assets/         # 圖片、字型等
│   │   ├── components/     # 可複用的 Vue 元件
│   │   │   ├── Chat/           # 對話介面元件
│   │   │   ├── Favourite/      # 收藏清單元件
│   │   │   ├── Profile/        # 資料管理元件
│   │   │   │   ├── AcademicOutcome/    # 學術成果（論文、專利）
│   │   │   │   └── StandardizedTest/  # 標準化考試分數欄位（TOEFL、IELTS、GRE 等）
│   │   │   ├── Settings/       # 帳戶設定元件
│   │   │   ├── Sidebar/        # 導覽側邊欄元件
│   │   │   └── ui/             # 基礎 UI 元件庫（shadcn-vue）
│   │   ├── i18n/           # 國際化
│   │   │   └── locales/    # 翻譯檔案（en、zh-CN、zh-TW）
│   │   ├── lib/            # 工具函式
│   │   ├── router/         # Vue Router 配置
│   │   ├── stores/         # Pinia 狀態管理
│   │   │   ├── favouriteStore.ts  # 收藏狀態
│   │   │   └── userStore.ts      # 使用者認證狀態
│   │   ├── types/          # TypeScript 型別定義
│   │   ├── views/          # 頁面元件
│   │   │   ├── auth/       # 登入、註冊、密碼重設
│   │   │   ├── chat/       # AI 對話頁面
│   │   │   ├── favourite/  # 已收藏大學頁面
│   │   │   ├── legal/      # 隱私權政策與服務條款
│   │   │   ├── profile/    # 使用者資料頁面
│   │   │   ├── settings/   # 帳戶設定頁面
│   │   │   ├── Cover.vue        # 首頁 / 封面頁
│   │   │   └── SidebarLayout.vue # 主應用程式版面
│   │   ├── App.vue         # 根元件
│   │   ├── main.ts         # 應用程式進入點
│   │   └── style.css       # 全域樣式
│   ├── index.html          # HTML 進入點
│   ├── package.json        # 專案相依套件
│   ├── tsconfig.json       # TypeScript 配置
│   └── vite.config.ts      # Vite 配置
└── u-finder-admin/    # 管理員面板應用
    ├── public/              # 靜態資源
    ├── src/
    │   ├── api/            # 管理員 API 整合
    │   │   ├── adminApi.ts      # 管理員管理 API
    │   │   ├── dashboard.ts     # 儀表板資料 API
    │   │   └── http.ts          # HTTP 用戶端配置
    │   ├── components/     # 管理員 Vue 元件
    │   │   ├── admin/          # 儀表板元件
    │   │   ├── auth/           # 管理員認證元件
    │   │   ├── Settings/       # 管理員設定元件
    │   │   ├── Sidebar/        # 管理員側邊欄導覽
    │   │   └── ui/             # 基礎 UI 元件庫（shadcn-vue）
    │   ├── i18n/           # 國際化
    │   ├── router/         # Vue Router 配置
    │   ├── stores/         # Pinia 狀態管理
    │   └── views/          # 管理員頁面元件
    │       ├── auth/       # 管理員登入與密碼重設
    │       ├── dashboard/  # 管理員儀表板
    │       └── settings/   # 管理員設定
    ├── index.html          # HTML 進入點
    ├── package.json        # 專案相依套件
    ├── tsconfig.json       # TypeScript 配置
    └── vite.config.ts      # Vite 配置
```

## 配置

### 環境變數

在 `u-finder` 目錄中建立 `.env` 檔案進行環境特定配置：

```env
VITE_BASE_URL=http://localhost:8000
```

### 國際化

應用程式支援多種語言。翻譯檔案位於 `u-finder/src/i18n/locales/`：

- `en.json` - 英語
- `zh-CN.json` - 簡體中文
- `zh-TW.json` - 繁體中文

## 參與貢獻

歡迎貢獻！請參閱[貢獻指南](../../CONTRIBUTING.md)了解更多資訊。

## 授權條款

本專案是 U-Finder 系統的一部分。有關授權條款資訊，請參閱主儲存庫。
