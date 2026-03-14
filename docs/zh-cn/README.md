# U-Finder 前端

![License](https://img.shields.io/badge/license-Apache%202.0-orange.svg)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

🌍 [English](../../README.md) | **简体中文** | [繁體中文](../zh-tw/README.md)

U-Finder 的前端子模块，这是一个基于大语言模型的大学查找系统，旨在帮助学生选择适合他们学术之旅的大学。如果你想查看主项目，请访问 [GRP-Team202511/u-finder](https://github.com/GRP-Team202511/u-finder)。

## 目录

- [U-Finder 前端](#u-finder-前端)
  - [目录](#目录)
  - [关于](#关于)
  - [功能特性](#功能特性)
  - [技术栈](#技术栈)
  - [快速开始](#快速开始)
    - [前置要求](#前置要求)
    - [安装](#安装)
    - [开发](#开发)
    - [构建](#构建)
  - [项目结构](#项目结构)
  - [配置](#配置)
    - [环境变量](#环境变量)
    - [国际化](#国际化)
  - [参与贡献](#参与贡献)
  - [许可证](#许可证)

## 关于

U-Finder 前端是一个使用 Vue.js 3 和 TypeScript 构建的现代化、响应式 Web 应用程序。它为学生提供了一个直观的用户界面，用于与 AI 驱动的大学推荐系统进行交互、管理个人资料以及探索教育机会。

## 功能特性

- 🔐 **用户认证** - 安全的登录和注册功能，支持邮箱 OTP 验证
- 🔒 **双重验证** - 基于 TOTP 的两步验证，增强账户安全性
- 👤 **用户资料管理** - 完整的个人资料，包含教育背景、标准化考试、奖项、实习经历、项目、校园活动及学术成果
- 📄 **CV 解析** - AI 驱动的简历解析，自动填充个人资料
- 💬 **AI 对话** - 基于大语言模型的对话界面，提供个性化大学推荐
- ❤️ **收藏管理** - 保存、查看和管理收藏的大学
- ⚙️ **账户设置** - 管理账户偏好、安全设置及已连接设备
- 🌍 **多语言支持** - 支持英语、简体中文和繁体中文
- 🎨 **现代化 UI/UX** - 使用 Tailwind CSS 打造简洁且响应式的设计
- 📱 **移动端响应式** - 针对所有设备尺寸进行优化
- 🔄 **状态管理** - 使用 Pinia 进行持久化状态管理
- 🎭 **组件库** - 基于 shadcn-vue 构建的丰富 UI 组件

## 技术栈

- **框架**: [Vue.js 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- **语言**: [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- **构建工具**: [Vite](https://vitejs.dev/) - 下一代前端构建工具
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **路由**: [Vue Router 4](https://router.vuejs.org/) - Vue.js 官方路由
- **状态管理**: [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库
- **国际化**: [Vue I18n](https://vue-i18n.intlify.dev/) - 国际化插件
- **UI 组件**: [shadcn-vue](https://www.shadcn-vue.com/) - 基于 Radix Vue 和 Tailwind CSS 构建的可复用组件
- **包管理器**: [pnpm](https://pnpm.io/) - 快速、节省磁盘空间的包管理器

## 快速开始

### 前置要求

在开始之前，请确保已安装以下软件：

- **Node.js** (v18.0.0 或更高版本)
- **pnpm** (v8.0.0 或更高版本)

```bash
# 全局安装 pnpm
npm install -g pnpm
```

### 安装

1. 克隆仓库（如果你还没有克隆主 U-Finder 项目）：

```bash
git clone --recursive https://github.com/GRP-Team202511/u-finder
cd frontend
```

> 如果已经克隆但未加 `--recursive`，可手动初始化子模块：
> ```bash
> git submodule update --init --recursive
> ```

2. 进入 u-finder 目录并安装依赖：

```bash
cd u-finder
pnpm install
```

### 开发

启动开发服务器：

```bash
pnpm dev
```

应用程序将在 `http://localhost:5173` 上运行（如果 5173 端口被占用，将使用其他端口）。

### 构建

构建生产版本：

```bash
pnpm build
```

构建文件将生成在 `dist` 目录中。

在本地预览生产构建：

```bash
pnpm preview
```

## 项目结构

Vue.js 应用程序位于 `./u-finder/` 目录中：

```
frontend/
├── CONTRIBUTING.md     # 贡献指南
├── README.md           # 英文文档
├── docs/               # 多语言文档
│   ├── zh-cn/         # 简体中文文档
│   └── zh-tw/         # 繁体中文文档
└── u-finder/          # 主 Vue.js 应用程序
    ├── public/              # 静态资源
    ├── src/
    │   ├── api/            # API 集成层
    │   │   ├── chatApi.ts       # 对话与会话 API
    │   │   ├── favouriteApi.ts  # 收藏功能 API
    │   │   ├── http.ts          # HTTP 客户端配置
    │   │   ├── profileApi.ts    # 用户资料 API
    │   │   └── userApi.ts       # 用户认证 API
    │   ├── assets/         # 图片、字体等
    │   ├── components/     # 可复用的 Vue 组件
    │   │   ├── Chat/           # 对话界面组件
    │   │   ├── Favourite/      # 收藏列表组件
    │   │   ├── Profile/        # 资料管理组件
    │   │   │   ├── AcademicOutcome/    # 学术成果（论文、专利）
    │   │   │   └── StandardizedTest/  # 标准化考试分数字段（TOEFL、IELTS、GRE 等）
    │   │   ├── Settings/       # 账户设置组件
    │   │   ├── Sidebar/        # 导航侧边栏组件
    │   │   └── ui/             # 基础 UI 组件库（shadcn-vue）
    │   ├── i18n/           # 国际化
    │   │   └── locales/    # 翻译文件（en、zh-CN、zh-TW）
    │   ├── lib/            # 工具函数
    │   ├── router/         # Vue Router 配置
    │   ├── stores/         # Pinia 状态管理
    │   │   ├── favouriteStore.ts  # 收藏状态
    │   │   └── userStore.ts      # 用户认证状态
    │   ├── types/          # TypeScript 类型定义
    │   ├── views/          # 页面组件
    │   │   ├── auth/       # 登录、注册、密码重置
    │   │   ├── chat/       # AI 对话页面
    │   │   ├── favourite/  # 已收藏大学页面
    │   │   ├── legal/      # 隐私政策与服务条款
    │   │   ├── profile/    # 用户资料页面
    │   │   ├── settings/   # 账户设置页面
    │   │   ├── Cover.vue        # 首页 / 封面页
    │   │   └── SidebarLayout.vue # 主应用布局
    │   ├── App.vue         # 根组件
    │   ├── main.ts         # 应用程序入口
    │   └── style.css       # 全局样式
    ├── index.html          # HTML 入口
    ├── package.json        # 项目依赖
    ├── tsconfig.json       # TypeScript 配置
    └── vite.config.ts      # Vite 配置
```

## 配置

### 环境变量

在 `u-finder` 目录中创建 `.env` 文件进行环境特定配置：

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 国际化

应用程序支持多种语言。翻译文件位于 `u-finder/src/i18n/locales/`：

- `en.json` - 英语
- `zh-CN.json` - 简体中文
- `zh-TW.json` - 繁体中文

## 参与贡献

欢迎贡献！请参阅[贡献指南](../../CONTRIBUTING.md)了解更多信息。

## 许可证

本项目是 U-Finder 系统的一部分。有关许可证信息，请参阅主仓库。
