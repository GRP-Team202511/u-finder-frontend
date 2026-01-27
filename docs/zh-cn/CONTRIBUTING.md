# 贡献指南
🌍 [English](../../CONTRIBUTING.md) | **简体中文** | [繁體中文](../zh-tw/CONTRIBUTING.md)

## 目录

- [开发环境设置](#开发环境设置)
- [提交流程](#提交流程)
- [代码规范](#代码规范)
- [提交信息规范](#提交信息规范)
- [分支管理](#分支管理)
- [常见问题](#常见问题)

## 开发环境设置

### 系统要求

- Node.js >= 18.x
- pnpm >= 10.x

### 初始化步骤

1. **克隆项目**

   ```bash
   git clone https://github.com/your-org/u-finder.git
   cd u-finder/frontend
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **启动开发服务器**

   ```bash
   cd u-finder
   pnpm dev
   ```

   开发服务器将在 `http://localhost:5173` 运行

4. **构建生产版本**

   ```bash
   pnpm build
   ```

## 提交流程

### 1. 创建功能分支

从 `develop` 分支创建新的功能分支：

```bash
git checkout -b feature/功能名称
```

### 2. 提交代码

- 定期提交你的更改，使用有意义的提交信息（参见[提交信息规范](#提交信息规范)）
- 在提交前运行测试和代码检查

### 3. 推送分支

```bash
git push origin feature/功能名称
```

### 4. 创建 Pull Request

- 在 GitHub 上创建 Pull Request（PR）
- 提供清晰的 PR 标题和描述
- 确保 CI/CD 检查通过

### 5. 代码审查

- 至少需要一位项目维护者审核
- 根据反馈进行修改
- 获得批准后可合并到 develop 分支

## 代码规范

### TypeScript / Vue

#### 文件命名规范

| 文件类型 | 命名规范 | 示例 |
| --- | --- | --- |
| Vue 单文件组件 | PascalCase | `UserProfile.vue` |
| TypeScript 文件 | camelCase | `userApi.ts` |
| Store 文件 | camelCase + Store | `userStore.ts` |
| 组件文件夹 | PascalCase | `components/UserProfile/` |
| 工具函数 | camelCase | `formatDate.ts` |
| 常量文件 | UPPER_SNAKE_CASE | `CONSTANTS.ts` |

#### 代码风格

**Vue 组件结构**

```vue
<template>
  <!-- 使用语义化 HTML，遵循无障碍标准 -->
  <div class="component-name">
    <!-- 内容 -->
  </div>
</template>

<script setup lang="ts">
// 导入按以下顺序排列：
// 1. Vue 核心库
// 2. 第三方库
// 3. 内部组件、工具、类型
import { computed, ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

// 定义 Props 和 Emits
interface Props {
  userId: string
  userName?: string
}

interface Emits {
  (e: 'update', value: string): void
}

// Props 和 Emits 定义
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式状态
const isLoading = ref(false)

// 计算属性
const displayName = computed(() => {
  return props.userName || 'Anonymous'
})

// 方法
const handleClick = async () => {
  isLoading.value = true
  try {
    // 业务逻辑
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 使用 scoped 样式避免全局污染 */
.component-name {
  /* 样式定义 */
}
</style>
```

**TypeScript 规范**

```typescript
// 使用类型注解
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

// 优先使用 interface 而不是 type（对象类型）
// 优先使用 const 而不是 let/var
const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await axios.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error}`)
  }
}

// 使用有意义的变量名
const userEmail = user.email // ✓ 好
const ue = user.email // ✗ 不好

// 函数参数应有类型注解
const calculateAge = (birthYear: number): number => {
  return new Date().getFullYear() - birthYear
}
```

#### 导入顺序

```typescript
// 1. Node.js 内置模块
// （如需要）

// 2. 第三方库
import { defineComponent } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// 3. 内部组件
import UserProfile from '@/components/Profile/UserProfile.vue'

// 4. 内部工具和工具函数
import { formatDate } from '@/lib/utils'

// 5. 类型和常量
import type { User } from '@/types'
import { API_BASE_URL } from '@/constants'
```

### CSS / Tailwind

⚠️ **重要提示**：本项目**仅使用 Tailwind CSS** 进行样式设置。不允许使用 scoped CSS 或 inline styles。

- **必须**使用 Tailwind CSS 工具类进行所有样式设置
- **禁止**在组件中编写 scoped `<style>` 块（除了无法用 Tailwind 实现的动画）
- **禁止**使用 inline `style` 属性
- **禁止**使用 CSS modules 或其他 CSS-in-JS 解决方案
- 遵循移动优先的响应式设计原则
- 使用语义化和描述性的类名组合
- 在极少数情况下，对于复杂的可复用模式，可以使用 Tailwind 的 `@apply` 指令

```vue
<template>
  <!-- ✓ 好 -->
  <div class="flex items-center justify-between p-4 md:p-6">
    <h1 class="text-lg font-bold text-gray-900">标题</h1>
  </div>

  <!-- ✗ 不好 -->
  <div style="display: flex; justify-content: space-between;">
    <h1 style="font-size: 18px; font-weight: bold;">标题</h1>
  </div>
</template>
```

### 注释规范

```typescript
// 单行注释
const count = ref(0)

/**
 * 多行注释 - 函数说明
 * @param {string} userId - 用户ID
 * @returns {Promise<User>} 用户信息
 */
const fetchUser = async (userId: string): Promise<User> => {
  // TODO: 实现缓存机制
  // FIXME: 处理错误情况
  // NOTE: 这里需要特别注意...
}
```

## 提交信息规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type（必需）

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档变更
- `style`: 代码风格变更（不影响代码运行，如缩进、空格等）
- `refactor`: 代码重构（既不修复错误也不添加功能）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程、依赖管理等变更
- `ci`: CI/CD 配置变更

### Scope（可选）

用于指定提交涉及的模块范围：

- `auth`: 认证模块
- `profile`: 个人资料模块
- `api`: API 层
- `ui`: UI 组件
- `store`: Pinia store
- `router`: 路由

### Subject（必需）

- 使用命令式语气（"add" 而不是 "added"）
- 不要大写首字母
- 末尾不需要句号
- 控制在 50 个字符以内

### Body（可选）

- 详细说明改动原因和方式
- 使用命令式语气
- 每行 72 个字符以内

### Footer（可选）

- 记录 BREAKING CHANGES
- 关闭相关 issue：`Closes #123`

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

项目采用 Git Flow 模型：

```
main (生产环境)
  ↑
  ├─── hotfix/* (从 main 创建)
  │      ↓
  │   合并到 main 和 develop
  │
  └─── develop (开发环境)
         ↑
         ├─── feature/* (功能分支)
         ├─── bugfix/* (修复分支)
         └─── hotfix/* (也合并到这里)
```

**重要提示**：Hotfix 分支必须同时合并到 `main` 和 `develop`，以保持生产和开发分支的同步。

### 分支命名规范

- **功能分支**: `feature/功能描述` 或 `feature/ISSUE-123-功能描述`
- **修复分支**: `bugfix/问题描述` 或 `bugfix/ISSUE-456-问题描述`
- **紧急修复**: `hotfix/问题描述`
- **文档**: `docs/文档描述`

### 分支管理规则

- 功能分支从 `develop` 分支创建
- 紧急修复（hotfix）从 `main` 分支创建
- **Hotfix 分支必须同时合并到 `main` 和 `develop`** 以保持同步
- 合并前必须通过代码审查
- 合并后删除功能分支
- `main` 分支接收来自 `develop`（发布）和 `hotfix`（紧急修复）的合并
- `develop` 分支接收来自 `feature`、`bugfix` 和 `hotfix` 分支的合并

## 常见问题

### 如何运行本地开发服务器？

```bash
cd u-finder
pnpm dev
```

### 如何构建生产版本？

```bash
cd u-finder
pnpm build
```

### 如何修复代码风格问题？

项目集成了 ESLint 和 Prettier。运行：

```bash
pnpm lint          # 检查代码风格
pnpm lint:fix      # 自动修复代码风格
pnpm format        # 使用 Prettier 格式化
```

### 如何更新依赖？

```bash
pnpm update
```

### 如何清除缓存并重新安装？

```bash
pnpm install --force
```

## 获取帮助

- 提交 Issue 报告问题
- 查看 [README.md](../../README.md)
- 联系项目维护者

感谢你的贡献！
