# Contributing Guide

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Submission Process](#submission-process)
- [Code Standards](#code-standards)
- [Commit Message Standards](#commit-message-standards)
- [Branch Management](#branch-management)
- [FAQ](#faq)

## Development Environment Setup

### System Requirements

- Node.js >= 18.x
- pnpm >= 10.x

### Initialization Steps

1. **Clone the Project**

   ```bash
   git clone https://github.com/your-org/u-finder.git
   cd u-finder/frontend
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Start Development Server**

   ```bash
   cd u-finder
   pnpm dev
   ```

   The development server will run at `http://localhost:5173`

4. **Build Production**

   ```bash
   pnpm build
   ```

## Submission Process

### 1. Create a Feature Branch

Create a new feature branch from the `develop` branch:

```bash
git checkout -b feature/feature-name
```

### 2. Commit Code

- Commit your changes regularly with meaningful commit messages (see [Commit Message Standards](#commit-message-standards))
- Run tests and code checks before committing

### 3. Push Branch

```bash
git push origin feature/feature-name
```

### 4. Create Pull Request

- Create a Pull Request (PR) on GitHub
- Provide clear PR title and description
- Ensure CI/CD checks pass

### 5. Code Review

- At least one project maintainer review is required
- Make changes based on feedback
- Can be merged to develop branch after approval

## Code Standards

### TypeScript / Vue

#### File Naming Convention

| File Type | Naming Convention | Example |
| --- | --- | --- |
| Vue Single File Component | PascalCase | `UserProfile.vue` |
| TypeScript File | camelCase | `userApi.ts` |
| Store File | camelCase + Store | `userStore.ts` |
| Component Folder | PascalCase | `components/UserProfile/` |
| Utility Function | camelCase | `formatDate.ts` |
| Constant File | UPPER_SNAKE_CASE | `CONSTANTS.ts` |

#### Code Style

**Vue Component Structure**

```vue
<template>
  <!-- Use semantic HTML and follow accessibility standards -->
  <div class="component-name">
    <!-- Content -->
  </div>
</template>

<script setup lang="ts">
// Imports in the following order:
// 1. Vue core library
// 2. Third-party libraries
// 3. Internal components, utils, types
import { computed, ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

// Define Props and Emits
interface Props {
  userId: string
  userName?: string
}

interface Emits {
  (e: 'update', value: string): void
}

// Props and Emits definition
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state
const isLoading = ref(false)

// Computed properties
const displayName = computed(() => {
  return props.userName || 'Anonymous'
})

// Methods
const handleClick = async () => {
  isLoading.value = true
  try {
    // Business logic
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Use scoped styles to avoid global pollution */
.component-name {
  /* Style definitions */
}
</style>
```

**TypeScript Standards**

```typescript
// Use type annotations
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

// Prefer interface over type (for object types)
// Prefer const over let/var
const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await axios.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error}`)
  }
}

// Use meaningful variable names
const userEmail = user.email // ✓ Good
const ue = user.email // ✗ Bad

// Function parameters should have type annotations
const calculateAge = (birthYear: number): number => {
  return new Date().getFullYear() - birthYear
}
```

#### Import Order

```typescript
// 1. Node.js built-in modules
// (if needed)

// 2. Third-party libraries
import { defineComponent } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// 3. Internal components
import UserProfile from '@/components/Profile/UserProfile.vue'

// 4. Internal utils and utility functions
import { formatDate } from '@/lib/utils'

// 5. Types and constants
import type { User } from '@/types'
import { API_BASE_URL } from '@/constants'
```

### CSS / Tailwind

⚠️ **IMPORTANT**: This project uses **Tailwind CSS exclusively** for all styling. No scoped CSS or inline styles are allowed.

- **MUST** use Tailwind CSS utility classes for all styling
- **NEVER** write scoped `<style>` blocks in components (except for animations that can't be achieved with Tailwind)
- **NEVER** use inline `style` attributes
- **NEVER** use CSS modules or other CSS-in-JS solutions
- Follow mobile-first responsive design principles
- Use semantic and descriptive class combinations
- Leverage Tailwind's `@apply` directive in rare cases for complex reusable patterns

```vue
<template>
  <!-- ✓ Good -->
  <div class="flex items-center justify-between p-4 md:p-6">
    <h1 class="text-lg font-bold text-gray-900">Title</h1>
  </div>

  <!-- ✗ Bad -->
  <div style="display: flex; justify-content: space-between;">
    <h1 style="font-size: 18px; font-weight: bold;">Title</h1>
  </div>
</template>
```

### Comment Standards

```typescript
// Single-line comment
const count = ref(0)

/**
 * Multi-line comment - Function description
 * @param {string} userId - User ID
 * @returns {Promise<User>} User information
 */
const fetchUser = async (userId: string): Promise<User> => {
  // TODO: Implement caching mechanism
  // FIXME: Handle error cases
  // NOTE: Need to pay special attention here...
}
```

## Commit Message Standards

Follow the Conventional Commits standard:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (does not affect code execution, such as indentation, spaces)
- `refactor`: Code refactoring (neither fixes bugs nor adds features)
- `perf`: Performance optimization
- `test`: Test-related changes
- `chore`: Build process, dependency management, etc.
- `ci`: CI/CD configuration changes

### Scope (Optional)

Specifies the module scope affected by the commit:

- `auth`: Authentication module
- `profile`: Profile module
- `api`: API layer
- `ui`: UI components
- `store`: Pinia store
- `router`: Routing

### Subject (Required)

- Use imperative mood ("add" instead of "added")
- Do not capitalize the first letter
- No period at the end
- Keep within 50 characters

### Body (Optional)

- Detailed explanation of why and how changes are made
- Use imperative mood
- Keep each line within 72 characters

### Footer (Optional)

- Record BREAKING CHANGES
- Close related issues: `Closes #123`

### Commit Examples

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

## Branch Management

### Branching Strategy

The project uses the Git Flow model:

```
main (production)
  ↑
  ├─── hotfix/* (created from main)
  │      ↓
  │   merged to main AND develop
  │
  └─── develop (development)
         ↑
         ├─── feature/* (feature branches)
         ├─── bugfix/* (bugfix branches)
         └─── hotfix/* (also merged here)
```

**Important**: Hotfix branches must be merged to BOTH `main` and `develop` to keep production and development branches synchronized.

### Branch Naming Convention

- **Feature branches**: `feature/feature-description` or `feature/ISSUE-123-feature-description`
- **Bugfix branches**: `bugfix/issue-description` or `bugfix/ISSUE-456-issue-description`
- **Emergency fixes**: `hotfix/issue-description`
- **Documentation**: `docs/doc-description`

### Branch Management Rules

- Feature branches are created from the `develop` branch
- Emergency fixes (hotfix) are created from the `main` branch
- **Hotfix branches MUST be merged to both `main` AND `develop`** to keep them in sync
- Code Review is required before merging
- Delete feature branches after merging
- `main` branch receives merges from `develop` (releases) and `hotfix` (emergency fixes)
- `develop` branch receives merges from `feature`, `bugfix`, and `hotfix` branches

## FAQ

### How to run the local development server?

```bash
cd u-finder
pnpm dev
```

### How to build a production version?

```bash
cd u-finder
pnpm build
```

### How to fix code style issues?

The project integrates ESLint and Prettier. Run:

```bash
pnpm lint          # Check code style
pnpm lint:fix      # Auto-fix code style
pnpm format        # Format with Prettier
```

### How to update dependencies?

```bash
pnpm update
```

### How to clear cache and reinstall?

```bash
pnpm install --force
```

## Getting Help

- Submit an Issue to report problems
- Check [README.md](./README.md)
- Contact the project maintainers

Thank you for your contribution!
