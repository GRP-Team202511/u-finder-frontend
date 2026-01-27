# 貢獻指南
🌍 [English](../../CONTRIBUTING.md) | [简体中文](../zh-cn/CONTRIBUTING.md) | **繁體中文**

## 目錄

- [開發環境設定](#開發環境設定)
- [提交流程](#提交流程)
- [程式碼規範](#程式碼規範)
- [提交訊息規範](#提交訊息規範)
- [分支管理](#分支管理)
- [常見問題](#常見問題)

## 開發環境設定

### 系統需求

- Node.js >= 18.x
- pnpm >= 10.x

### 初始化步驟

1. **複製專案**

   ```bash
   git clone https://github.com/your-org/u-finder.git
   cd u-finder/frontend
   ```

2. **安裝相依套件**

   ```bash
   pnpm install
   ```

3. **啟動開發伺服器**

   ```bash
   cd u-finder
   pnpm dev
   ```

   開發伺服器將在 `http://localhost:5173` 執行

4. **建置生產版本**

   ```bash
   pnpm build
   ```

## 提交流程

### 1. 建立功能分支

從 `develop` 分支建立新的功能分支：

```bash
git checkout -b feature/功能名稱
```

### 2. 提交程式碼

- 建議定期提交變更，並撰寫有意義的提交訊息（參見[提交訊息規範](#提交訊息規範)）
- 在提交前請先執行測試與程式碼檢查

### 3. 推送分支

```bash
git push origin feature/功能名稱
```

### 4. 建立 Pull Request

- 在 GitHub 上建立 Pull Request（PR）
- 提供清楚的 PR 標題與描述
- 確保 CI/CD 檢查通過

### 5. 程式碼審查

- 至少需一位專案維護者進行審查
- 根據回饋進行修改
- 獲得核准後可合併至 `develop` 分支

## 程式碼規範

### TypeScript / Vue

#### 檔案命名規範

| 檔案類型 | 命名規範 | 範例 |
| --- | --- | --- |
| Vue 單檔元件 | PascalCase | `UserProfile.vue` |
| TypeScript 檔案 | camelCase | `userApi.ts` |
| Store 檔案 | camelCase + Store | `userStore.ts` |
| 元件資料夾 | PascalCase | `components/UserProfile/` |
| 工具函式 | camelCase | `formatDate.ts` |
| 常數檔案 | UPPER_SNAKE_CASE | `CONSTANTS.ts` |

#### 程式碼風格

**Vue 元件結構**

```vue
<template>
  <!-- 使用語意化 HTML，遵守無障礙標準 -->
  <div class="component-name">
    <!-- 內容 -->
  </div>
</template>

<script setup lang="ts">
// import 順序：
// 1. Vue 核心函式庫
// 2. 第三方函式庫
// 3. 專案內部元件、utils、type
import { computed, ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

// 定義 Props 與 Emits
interface Props {
  userId: string
  userName?: string
}

interface Emits {
  (e: 'update', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 反應式狀態
const isLoading = ref(false)

// 計算屬性
const displayName = computed(() => {
  return props.userName || 'Anonymous'
})

// 方法
const handleClick = async () => {
  isLoading.value = true
  try {
    // 業務邏輯
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 使用 scoped 樣式以避免全域汙染 */
.component-name {
  /* 樣式定義 */
}
</style>
```

**TypeScript 規範**

```typescript
// 使用型別註記
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

// 物件型別優先使用 interface
// 儘量使用 const 取代 let/var
const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await axios.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error}`)
  }
}

// 使用具意義的變數名稱
const userEmail = user.email // ✓ 好
const ue = user.email // ✗ 不建議

// 函式參數應加入型別註記
const calculateAge = (birthYear: number): number => {
  return new Date().getFullYear() - birthYear
}
```

#### import 順序

```typescript
// 1. Node.js 內建模組
// （如有需要）

// 2. 第三方函式庫
import { defineComponent } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// 3. 專案內部元件
import UserProfile from '@/components/Profile/UserProfile.vue'

// 4. 專案內部工具與函式
import { formatDate } from '@/lib/utils'

// 5. 型別與常數
import type { User } from '@/types'
import { API_BASE_URL } from '@/constants'
```

### CSS / Tailwind

⚠️ **重要提示**：本專案**僅使用 Tailwind CSS 作為樣式工具**，不得使用 scoped CSS 或 inline styles。

- **必須**使用 Tailwind CSS 的工具類來撰寫所有樣式
- **禁止**在元件中撰寫 scoped `<style>`（除非為不可由 Tailwind 實作的動畫）
- **禁止**使用 inline `style` 屬性
- **禁止**使用 CSS modules 或其他 CSS-in-JS 解法
- 遵循 mobile-first 的響應式設計原則
- 使用語意且具描述性的 class 組合
- 僅在少數情況下，對於複雜可重複使用的模式，使用 Tailwind 的 `@apply`

```vue
<template>
  <!-- ✓ 好 -->
  <div class="flex items-center justify-between p-4 md:p-6">
    <h1 class="text-lg font-bold text-gray-900">標題</h1>
  </div>

  <!-- ✗ 不建議 -->
  <div style="display: flex; justify-content: space-between;">
    <h1 style="font-size: 18px; font-weight: bold;">標題</h1>
  </div>
</template>
```

### 註解規範

```typescript
// 單行註解
const count = ref(0)

/**
 * 多行註解 - 函式說明
 * @param {string} userId - 使用者 ID
 * @returns {Promise<User>} 使用者資訊
 */
const fetchUser = async (userId: string): Promise<User> => {
  // TODO: 實作快取機制
  // FIXME: 處理錯誤情況
  // NOTE: 此處需特別注意...
}
```

## 提交訊息規範

遵循 Conventional Commits 規範：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type（必填）

- `feat`: 新功能
- `fix`: 修正錯誤
- `docs`: 文件變更
- `style`: 程式碼風格變更（不影響執行，例如縮排、空白）
- `refactor`: 重構（非修正也非新增功能）
- `perf`: 效能優化
- `test`: 測試相關
- `chore`: 建置流程、相依管理等
- `ci`: CI/CD 設定變更

### Scope（可選）

用以指定提交影響的模組範圍：

- `auth`: 認證模組
- `profile`: 使用者檔案模組
- `api`: API 層
- `ui`: UI 元件
- `store`: Pinia store
- `router`: 路由

### Subject（必填）

- 使用命令式語氣（例如 "add"，而非 "added"）
- 主詞首字不須大寫
- 結尾不加句點
- 控制於 50 個字元以內

### Body（可選）

- 詳細說明為何以及如何修改
- 使用命令式語氣
- 每行不超過 72 個字元

### Footer（可選）

- 記錄 BREAKING CHANGES
- 關閉相關 issue：`Closes #123`

### 提交示例

```
feat(auth): add login with email support

- Implement email input validation
- Add password strength checker
- Create auth service for email login

Closes #123
```

```
fix(profile): correct user avatar display issue

The avatar was not properly cached, causing flickering on page refresh.
Implement localStorage caching with TTL.
```

## 分支管理

### 分支策略

專案採用 Git Flow 模式：

```
main (生產)
  ↑
  ├─── hotfix/* (從 main 建立)
  │      ↓
  │   合併到 main 與 develop
  │
  └─── develop (開發)
         ↑
         ├─── feature/* (功能分支)
         ├─── bugfix/* (錯誤修正分支)
         └─── hotfix/* (亦會合併至此)
```

**重要**：Hotfix 分支必須同時合併到 `main` 與 `develop`，以保持生產與開發分支同步。

### 分支命名規範

- **功能分支**: `feature/功能描述` 或 `feature/ISSUE-123-功能描述`
- **錯誤修正分支**: `bugfix/問題描述` 或 `bugfix/ISSUE-456-問題描述`
- **緊急修正**: `hotfix/問題描述`
- **文件**: `docs/文件描述`

### 分支管理規則

- 功能分支從 `develop` 建立
- 緊急修正（hotfix）從 `main` 建立
- **Hotfix 分支必須同時合併到 `main` 與 `develop`** 以保持同步
- 合併前須通過程式碼審查
- 合併完成後刪除功能分支
- `main` 分支接收來自 `develop`（發佈）與 `hotfix`（緊急修正）的合併
- `develop` 分支接收來自 `feature`、`bugfix` 與 `hotfix` 的合併

## 常見問題

### 如何啟動本地開發伺服器？

```bash
cd u-finder
pnpm dev
```

### 如何建置生產版本？

```bash
cd u-finder
pnpm build
```

### 如何修復程式碼風格問題？

專案整合了 ESLint 與 Prettier。執行：

```bash
pnpm lint          # 檢查程式碼風格
pnpm lint:fix      # 自動修復程式碼風格
pnpm format        # 使用 Prettier 格式化
```

### 如何更新相依套件？

```bash
pnpm update
```

### 如何清除快取並重新安裝？

```bash
pnpm install --force
```

## 尋求協助

- 提交 Issue 回報問題
- 參閱 [README.md](../../README.md)
- 聯絡專案維護者

感謝你的貢獻！
