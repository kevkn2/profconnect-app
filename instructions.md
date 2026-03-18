# 📘 Frontend Architecture Instructions

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS

---

## 1. Purpose

This document defines standards and best practices for building a **scalable, maintainable, and production-ready frontend**.

Goals:

* High maintainability
* Predictable structure
* Type safety
* Reusable components
* Easy onboarding
* Compatible with backend Clean Architecture

---

## 2. Tech Stack

| Layer         | Technology                         |
| ------------- | ---------------------------------- |
| Framework     | Next.js (App Router)               |
| Language      | TypeScript                         |
| Styling       | Tailwind CSS                       |
| State         | React Context / Zustand (optional) |
| Data Fetching | Fetch / React Query (optional)     |
| Validation    | Zod                                |
| Linting       | ESLint + Prettier                  |

---

## 3. Project Structure

```
src/
├── app/                # Next.js routing (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   └── (routes)/
│
├── components/         # Reusable UI components
│   ├── ui/             # Atomic components
│   └── layout/         # Layout components
│
├── features/           # Feature-based modules
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
│
├── hooks/              # Global reusable hooks
│
├── lib/                # Shared utilities
│   ├── api/
│   ├── config/
│   └── utils/
│
├── services/           # API services
│
├── store/              # Global state
│
├── styles/             # Global styles
│
├── types/              # Global types
│
└── middleware.ts
```

---

## 4. Folder Responsibilities

### `/app`

Contains routing and pages.

Rules:

* No business logic
* No API logic
* Only composition

Example:

```tsx
// app/dashboard/page.tsx
import DashboardView from "@/features/dashboard/components/DashboardView";

export default function Page() {
  return <DashboardView />;
}
```

---

### `/components`

Reusable UI elements.

Types:

#### `ui/` (Atomic)

* Button
* Input
* Modal
* Card

#### `layout/`

* Navbar
* Sidebar
* Footer

Rules:

* No API calls
* No business logic
* Props-driven only

---

### `/features`

Each business domain lives here.

Example:

```
features/auth/
├── components/
├── hooks/
├── services/
├── types.ts
```

Rules:

* Self-contained
* No cross-feature imports
* Can use shared `lib`

---

### `/services`

All API communication.

Rules:

* No React code
* Only fetch logic
* Typed responses

Example:

```ts
// services/userService.ts

export async function getProfile() {
  const res = await fetch("/api/profile");
  return res.json();
}
```

---

### `/lib`

Shared logic.

Includes:

* API clients
* Helpers
* Config

Example:

```
lib/api/
lib/utils/
lib/constants.ts
```

---

### `/store`

Global state management.

Use only when needed.

Allowed:

* Zustand
* Context

Avoid:

* Storing server data (use cache/query tools)

---

### `/types`

Global TypeScript types.

Example:

```ts
export type User = {
  id: string;
  name: string;
};
```

---

## 5. Component Design Rules

### 5.1 Component Types

| Type      | Responsibility    |
| --------- | ----------------- |
| Page      | Route composition |
| Container | Data + logic      |
| View      | UI only           |
| UI        | Atomic elements   |

---

### 5.2 Pattern

Use **Container → View → UI**:

```
DashboardContainer
  ↓
DashboardView
  ↓
Button / Card / Table
```

Example:

```tsx
// Container
export function DashboardContainer() {
  const data = useDashboard();
  return <DashboardView data={data} />;
}
```

---

## 6. Styling Rules (Tailwind)

### Principles

* Utility-first
* No inline styles
* No large CSS files

Allowed:

```tsx
<div className="flex gap-4 p-4">
```

Avoid:

```tsx
style={{ padding: 20 }}
```

---

### Shared Styles

Use `clsx` / `tailwind-merge` for variants:

```ts
cn("px-4", active && "bg-blue-500");
```

---

## 7. Data Fetching Strategy

### Server Components (Default)

Prefer server fetching:

```tsx
const data = await getUsers();
```

### Client Fetching

Only when needed:

* Forms
* Realtime
* Interactions

Use:

* Fetch API via services
* React Query (optional)

---

### API Layer Rule

❌ Never fetch in components directly
❌ Never create API routes as middleman
✅ Always call backend directly from services

Bad:

```tsx
fetch("/api/user");
```

Good:

```tsx
userService.getUser();
```

Services call backend directly:

```ts
// services/userService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUser() {
  const res = await fetch(`${API_URL}/api/user`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

---

## 8. State Management

### Local State

Use `useState` for:

* Form input
* Toggles
* UI state

---

### Global State (Minimal)

Use for:

* Auth
* Theme
* Preferences

Avoid storing:

* Server data
* Lists from API

---

## 9. Type Safety

### Mandatory

All of these must be typed:

* API responses
* Props
* Forms
* Context

Example:

```ts
type Props = {
  user: User;
};
```

---

### Validation (Zod)

Use Zod for:

* Forms
* API parsing

```ts
const schema = z.object({
  email: z.string().email(),
});
```

---

## 10. Environment Configuration

Use `.env.local` files.

Example:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Access in services:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

Never hardcode URLs. Always use environment variables.

---

## 11. Error Handling

### API Errors

Always wrap:

```ts
try {
  await fetch();
} catch (err) {
  throw new ApiError();
}
```

---

### UI Errors

Use error boundaries:

```
app/error.tsx
```

---

## 12. Performance Rules

### Mandatory

* Use `next/image`
* Use `dynamic()` for heavy components
* Use `memo` when needed

---

### Avoid

* Large client bundles
* Global re-renders
* Massive contexts

---

## 13. Testing (Optional but Recommended)

| Type | Tool            |
| ---- | --------------- |
| Unit | Vitest          |
| UI   | Testing Library |
| E2E  | Playwright      |

Focus on:

* Business logic
* Critical flows

---

## 14. Security Practices

### Must Follow

* Never trust client data
* Validate server-side
* Sanitize inputs
* Hide secrets

---

### Auth

* Tokens in HttpOnly cookies
* No localStorage tokens (preferred)

---

## 15. Naming Conventions

### Files

```
PascalCase → Components
camelCase → Hooks
kebab-case → Routes
```

Example:

```
UserCard.tsx
useAuth.ts
dashboard-page
```

---

### Variables

```
camelCase
```

No abbreviations.

---

## 16. Git Rules

### Branches

```
main
develop
feature/*
fix/*
```

---

### Commits

Format:

```
feat: add login page
fix: auth token refresh
refactor: split dashboard logic
```

---

## 17. Production Checklist

Before release:

* [ ] No console.logs
* [ ] No unused imports
* [ ] All env vars set
* [ ] Types passing
* [ ] Lint clean
* [ ] Build success

---

## 18. Architecture Principles

This frontend follows:

* KISS
* DRY
* SOLID (where applicable)
* Separation of Concerns
* Feature Isolation
* Type Safety First

---

## 19. Example Feature Template

```
features/profile/
├── components/
│   └── ProfileView.tsx
├── hooks/
│   └── useProfile.ts
├── services/
│   └── profileService.ts
├── types.ts
└── index.ts
```

---

## 20. Final Rule

> If unsure, prefer:
>
> Simplicity > Abstraction > Cleverness

---

# ✅ Summary

This architecture ensures:

* Clean separation
* Scalable growth
* Easy refactoring
* Backend alignment
* Team-friendly structure
