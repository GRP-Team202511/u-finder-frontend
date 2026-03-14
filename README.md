# U-Finder Frontend

![License](https://img.shields.io/badge/license-Apache%202.0-orange.svg)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

🌍 **English** | [简体中文](./docs/zh-cn/README.md) | [繁體中文](./docs/zh-tw/README.md)

The frontend submodule for U-Finder, an LLM-based university finder system designed to assist students in selecting the right university for their academic journey. If you want to view the main project, please go to [GRP-Team202511/u-finder](https://github.com/GRP-Team202511/u-finder).

## Table of Contents

- [U-Finder Frontend](#u-finder-frontend)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Development](#development)
    - [Build](#build)
  - [Project Structure](#project-structure)
  - [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
    - [Internationalization](#internationalization)
  - [Contributing](#contributing)
  - [License](#license)

## About

U-Finder Frontend is a modern, responsive web application built with Vue.js 3 and TypeScript. It provides an intuitive user interface for students to interact with the AI-powered university recommendation system, manage their profiles, and explore educational opportunities.

## Features

- 🔐 **User Authentication** - Secure login and signup functionality with email OTP verification
- 🔒 **Two-Factor Authentication** - Enhanced account security with TOTP-based 2FA
- 👤 **User Profile Management** - Comprehensive profile with education background, standardized tests, awards, internships, projects, campus experiences, and academic outcomes
- 📄 **CV Parser** - AI-powered CV parsing to automatically populate your profile
- 💬 **AI Chat** - LLM-powered conversational interface for personalized university recommendations
- ❤️ **Favourites Management** - Save, view, and manage favourite universities
- ⚙️ **Account Settings** - Manage account preferences, security settings, and connected devices
- 🌍 **Multi-language Support** - Available in English, Simplified Chinese, and Traditional Chinese
- 🎨 **Modern UI/UX** - Clean and responsive design with Tailwind CSS
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🔄 **State Management** - Persistent state management with Pinia
- 🎭 **Component Library** - Rich UI components built with shadcn-vue

## Tech Stack

- **Framework**: [Vue.js 3](https://vuejs.org/) - Progressive JavaScript Framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS Framework
- **Router**: [Vue Router 4](https://router.vuejs.org/) - Official Router for Vue.js
- **State Management**: [Pinia](https://pinia.vuejs.org/) - Vue Store
- **Internationalization**: [Vue I18n](https://vue-i18n.intlify.dev/) - Internationalization plugin
- **UI Components**: [shadcn-vue](https://www.shadcn-vue.com/) - Re-usable components built with Radix Vue and Tailwind CSS
- **Package Manager**: [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **pnpm** (v8.0.0 or higher)

```bash
# Install pnpm globally
npm install -g pnpm
```

### Installation

1. Clone the repository (if you haven't already cloned the main U-Finder project):

```bash
git clone --recursive https://github.com/GRP-Team202511/u-finder
cd frontend
```

> If you have already cloned without `--recursive`, initialize the submodules manually:
> ```bash
> git submodule update --init --recursive
> ```

2. Navigate to the u-finder directory and install dependencies:

```bash
cd u-finder
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build

Build the application for production:

```bash
pnpm build
```

The built files will be generated in the `dist` directory.

To preview the production build locally:

```bash
pnpm preview
```

## Project Structure

The Vue.js application is located in the `./u-finder/` directory:

```
frontend/
├── CONTRIBUTING.md     # Contributing guidelines
├── README.md           # This file
├── docs/               # Documentation in multiple languages
│   ├── zh-cn/         # Simplified Chinese docs
│   └── zh-tw/         # Traditional Chinese docs
└── u-finder/          # Main Vue.js application
    ├── public/              # Static assets
    ├── src/
    │   ├── api/            # API integration layer
    │   │   ├── chatApi.ts       # Chat & conversation API
    │   │   ├── favouriteApi.ts  # Favourites API
    │   │   ├── http.ts          # HTTP client configuration
    │   │   ├── profileApi.ts    # User profile API
    │   │   └── userApi.ts       # User authentication API
    │   ├── assets/         # Images, fonts, etc.
    │   ├── components/     # Reusable Vue components
    │   │   ├── Chat/           # Chat interface components
    │   │   ├── Favourite/      # Favourites list components
    │   │   ├── Profile/        # Profile management components
    │   │   │   ├── AcademicOutcome/    # Research papers & patents
    │   │   │   └── StandardizedTest/  # Test score fields (TOEFL, IELTS, GRE, etc.)
    │   │   ├── Settings/       # Account settings components
    │   │   ├── Sidebar/        # Navigation sidebar components
    │   │   └── ui/             # Base UI component library (shadcn-vue)
    │   ├── i18n/           # Internationalization
    │   │   └── locales/    # Translation files (en, zh-CN, zh-TW)
    │   ├── lib/            # Utility functions
    │   ├── router/         # Vue Router configuration
    │   ├── stores/         # Pinia state management
    │   │   ├── favouriteStore.ts  # Favourites state
    │   │   └── userStore.ts      # User authentication state
    │   ├── types/          # TypeScript type definitions
    │   ├── views/          # Page components
    │   │   ├── auth/       # Login, Signup, Password Reset
    │   │   ├── chat/       # AI chat page
    │   │   ├── favourite/  # Saved universities page
    │   │   ├── legal/      # Privacy Policy & Terms of Service
    │   │   ├── profile/    # User profile page
    │   │   ├── settings/   # Account settings page
    │   │   ├── Cover.vue        # Landing / cover page
    │   │   └── SidebarLayout.vue # Main application layout
    │   ├── App.vue         # Root component
    │   ├── main.ts         # Application entry point
    │   └── style.css       # Global styles
    ├── index.html          # HTML entry point
    ├── package.json        # Project dependencies
    ├── tsconfig.json       # TypeScript configuration
    └── vite.config.ts      # Vite configuration
```

## Configuration

### Environment Variables

Create a `.env` file in the `u-finder` directory for environment-specific configuration:

```env
VITE_BASE_URL=http://localhost:8000
```

### Internationalization

The application supports multiple languages. Translation files are located in `u-finder/src/i18n/locales/`:

- `en.json` - English
- `zh-CN.json` - Simplified Chinese
- `zh-TW.json` - Traditional Chinese

## Contributing

Contributions are welcome! Please refer to the [Contributing Guidelines](./CONTRIBUTING.md) for more information.

## License

This project is part of the U-Finder system. Please refer to the main repository for license information.