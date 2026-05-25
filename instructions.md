# 📘 ProfConnect Frontend Architecture

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zod

---

## 1. Purpose

This document describes the **actual** architecture of the ProfConnect frontend and the standards used when extending it. The codebase follows a feature-based Clean Architecture pattern that connects a Next.js client to a separate backend API.

Goals:

* High maintainability
* Predictable structure
* Type safety
* Reusable components
* Easy onboarding
* Compatible with backend Clean Architecture

---

## 2. Tech Stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 16 (App Router)                       |
| UI Runtime    | React 19                                      |
| Language      | TypeScript 5                                  |
| Styling       | Tailwind CSS 4 (`@tailwindcss/postcss`)       |
| Fonts         | `next/font/google` — Geist Sans / Geist Mono  |
| Auth State    | React Context (`AuthProvider` via `useAuth`)  |
| Data Fetching | Native `fetch` wrapped in service modules     |
| Validation    | Zod                                           |
| Linting       | ESLint (`eslint-config-next`)                 |
| Package Mgr   | pnpm (workspace)                              |

Scripts (from [package.json](package.json)):

```bash
pnpm dev         # next dev
pnpm build       # next build
pnpm start       # next start
pnpm lint        # eslint
pnpm test        # vitest run (single pass, CI-friendly)
pnpm test:watch  # vitest in watch mode
```

---

## 3. Actual Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # RootLayout — mounts <AuthProvider>
│   ├── page.tsx                      # "/" → redirect("/login")
│   ├── globals.css                   # Tailwind + theme vars
│   │
│   ├── login/page.tsx                # → LoginContainer
│   ├── register/
│   │   ├── page.tsx                  # → redirect("/register/student")
│   │   ├── student/page.tsx          # → RegisterStudentContainer
│   │   └── professor/page.tsx        # → RegisterProfessorContainer
│   │
│   ├── professor/                    # Professor-only routes
│   │   ├── layout.tsx                # ProtectedLayout + Sidebar (professor nav)
│   │   ├── page.tsx                  # → redirect("/professor/dashboard")
│   │   ├── dashboard/page.tsx        # → DashboardView
│   │   └── profile/page.tsx          # → ProfileContainer
│   │
│   └── student/                      # Student-only routes
│       ├── layout.tsx                # ProtectedLayout + Sidebar (student nav)
│       ├── page.tsx                  # → redirect("/student/dashboard")
│       ├── dashboard/page.tsx        # → DashboardView
│       └── profile/page.tsx          # → ProfileContainer
│
├── components/
│   ├── ui/                           # Atomic, reusable UI primitives
│   │   ├── Button.tsx
│   │   └── Spinner.tsx
│   └── layout/                       # Layout building blocks
│       ├── Sidebar.tsx               # Nav rail + logout button
│       └── ProtectedLayout.tsx       # Auth gate (redirects to /login)
│
├── features/                         # Feature modules (vertical slices)
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginContainer.tsx / LoginView.tsx
│   │   │   ├── RegisterContainer.tsx / RegisterView.tsx
│   │   │   ├── RegisterStudentContainer.tsx / RegisterStudentView.tsx
│   │   │   ├── RegisterProfessorContainer.tsx / RegisterProfessorView.tsx
│   │   │   └── index.ts              # Barrel exports
│   │   └── types.ts                  # Re-exports auth DTO types
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   └── DashboardView.tsx
│   │   └── types.ts                  # re-exports RoleEnum / checkRole from @/types/role
│   │
│   └── profile/
│       ├── components/
│       │   ├── ProfileContainer.tsx
│       │   ├── ProfileView.tsx
│       │   ├── ProfileField.tsx
│       │   └── index.ts
│       ├── types.ts                  # re-exports RoleEnum / checkRole from @/types/role
│       └── index.ts
│
├── hooks/
│   └── useAuth.tsx                   # AuthProvider + useAuth() context hook
│
├── services/                         # API clients (domain per folder)
│   ├── auth/
│   │   ├── auth.dto.ts               # Request/Response interfaces
│   │   └── auth.service.ts           # login, register, registerStudent, registerProfessor
│   ├── professor/
│   │   ├── professor.dto.ts          # ProfessorProfile
│   │   └── professor.service.ts      # getProfile
│   └── student/
│       ├── student.dto.ts            # StudentProfile
│       └── student.service.ts        # getProfile
│
├── config/
│   └── settings.ts                   # API_URL constant (from NEXT_PUBLIC_API_URL)
│
└── types/
    └── role.ts                       # RoleEnum + checkRole() — canonical role guard
```

---

## 4. Folder Responsibilities

### `/app` — Routing only

App Router pages compose feature containers. They do **not** contain business logic.

```tsx
// app/login/page.tsx
import LoginContainer from "@/features/auth/components/LoginContainer";

export default function LoginPage() {
    return <LoginContainer />;
}
```

Role-scoped routes (`/professor/*`, `/student/*`) wrap their tree in `ProtectedLayout` + `Sidebar`:

```tsx
// app/professor/layout.tsx
const professorNavItems = [
    { label: "Dashboard", path: "/professor/dashboard" },
    { label: "Settings",  path: "/professor/settings"  },
    { label: "Profile",   path: "/professor/profile"   },
];

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedLayout>
            <Sidebar navItems={professorNavItems}>{children}</Sidebar>
        </ProtectedLayout>
    );
}
```

---

### `/components`

#### `ui/` — Atomic, props-driven primitives

* `Button` — variants via `loading`, `fullWidth`, plus all native button props
* `Spinner` — sized SVG spinner

Rules: no API calls, no business logic, no `useAuth`.

#### `layout/` — Layout shells

* `ProtectedLayout` — client component, uses `useAuth()`, redirects unauthenticated users to `/login`, renders a loading state while auth hydrates
* `Sidebar` — client component, renders nav items + logout, highlights active route via `usePathname()`

---

### `/features` — Vertical slices

Each feature owns its `components/`, optional `hooks/`, optional local `services/`, `types.ts`, and a barrel `index.ts`.

**Container → View pattern is the standard:**

```
ProfileContainer  (data fetching, auth, error state)
   ↓
ProfileView       (presentation only, props-driven)
   ↓
ProfileField, Spinner  (atomic UI)
```

Example — [src/features/profile/components/ProfileContainer.tsx](src/features/profile/components/ProfileContainer.tsx):

```tsx
export default function ProfileContainer() {
    const { accessToken, role, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<ProfessorProfile | StudentProfile | null>(null);
    // ...fetch based on role, hand off to ProfileView
    return <ProfileView role={checkRole(role)} profile={profile} loading={loading} error={error} />;
}
```

Rules:

* Features are self-contained.
* No cross-feature imports — share via `/components`, `/services`, `/hooks`, or `/lib`.
* Containers may use services and hooks; Views must not.

---

### `/services` — API clients

Convention: **one folder per domain**, with `<domain>.dto.ts` and `<domain>.service.ts`.

* `dto.ts` — request/response TypeScript interfaces only (no runtime code beyond types).
* `service.ts` — a small `fetch` wrapper plus named exports, exposed as a `<domain>Service` object for ergonomic imports.

Example — [src/services/auth/auth.service.ts](src/services/auth/auth.service.ts):

```ts
import { API_URL } from "@/config/settings";

async function postJson<TBody, TResponse>(path: string, body: TBody, errorPrefix: string): Promise<TResponse> {
    const response = await fetch(`${API_URL}/api/auth${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`${errorPrefix}: ${data.message ?? "Unknown error"}`);
    return data as TResponse;
}

export async function login(params: LoginRequest): Promise<LoginResponse> {
    return postJson<LoginRequest, LoginResponse>("/login", params, "Login failed");
}

export const authService = { register, registerStudent, registerProfessor, login };
```

Authenticated services accept the access token as an argument and set `Authorization: Bearer <token>` (see [professor.service.ts](src/services/professor/professor.service.ts), [student.service.ts](src/services/student/student.service.ts)).

Rules:

* No React imports in `/services`.
* Always read base URL from `@/config/settings` — never hardcode.
* Throw `Error` on non-OK responses; let containers translate to UI state.

---

### `/hooks` — Global hooks

Currently:

* [useAuth.tsx](src/hooks/useAuth.tsx) — `AuthProvider` context + `useAuth()` consumer hook. Persists `accessToken`, `refreshToken`, and `role` in `localStorage`, exposes `login()`, `logout()`, `isAuthenticated`, and `loading` (true until storage is hydrated on mount).

---

### `/config`

* [settings.ts](src/config/settings.ts):

  ```ts
  export const API_URL = process.env.API_URL || "http://localhost:3001";
  ```

  Note: this reads `API_URL` (not `NEXT_PUBLIC_API_URL`). If the value needs to be available in client components, prefix with `NEXT_PUBLIC_` so Next.js inlines it at build time.

---

### `/types`

Cross-cutting global types. Feature-local types live in each feature's `types.ts`; anything shared across features (e.g. role enums) lives here.

* [role.ts](src/types/role.ts) — `RoleEnum` and `checkRole()` runtime guard. Imported by any feature that needs role narrowing; feature-local `types.ts` files re-export from here so consumers can still `import { ... } from "../types"`.

---

## 5. Component Design Rules

| Type      | Responsibility                                  | Example                  |
| --------- | ----------------------------------------------- | ------------------------ |
| Page      | Route composition, no logic                     | `app/login/page.tsx`     |
| Container | State, fetching, auth wiring                    | `LoginContainer`         |
| View      | UI only, props-driven, can hold form state      | `LoginView`              |
| UI        | Atomic, reusable primitives                     | `Button`, `Spinner`      |

Form-bearing views may own their own local form state (`useState`) — see `LoginView`, `RegisterStudentView`. Submission is delegated to the container via an `onX` prop.

---

## 6. Styling (Tailwind 4)

* Utility-first — no inline `style={{...}}` except for dynamic values.
* Tailwind directives are loaded via `@import "tailwindcss"` in [globals.css](src/app/globals.css).
* Theme tokens are declared with `@theme inline` and CSS variables (`--background`, `--foreground`, `--font-geist-sans`, `--font-geist-mono`).
* Long repeated class strings can be hoisted into a `const inputClassName = "..."` at module scope (see `RegisterStudentView`, `RegisterProfessorView`).

---

## 7. Data Fetching Strategy

### Client-side (current pattern)

Auth-sensitive data uses **client containers** that call the service layer with an `accessToken` from `useAuth()`:

```tsx
const { accessToken, role } = useAuth();
useEffect(() => {
    if (!accessToken) return;
    if (role === "student")    studentService.getProfile(accessToken).then(setProfile);
    else if (role === "professor") professorService.getProfile(accessToken).then(setProfile);
}, [accessToken, role]);
```

### Server-side

Server Components remain the preferred path for public, cacheable data. Public landing/marketing pages should fetch on the server.

### API layer rules

❌ Don't `fetch()` directly inside components.
❌ Don't use Next.js Route Handlers as a proxy to the backend — there is no `src/app/api/` folder, and one should not be added.
✅ Call the backend directly from `/services/<domain>/<domain>.service.ts`.

---

## 8. State Management

Local UI state (`useState`) for forms, toggles, fetch state.

Global state via React Context for cross-cutting concerns — currently only `AuthProvider`. No external state library in use; introduce one (Zustand / React Query) only when justified.

Do not store fetched server data in global state — keep it co-located in the container that needs it.

---

## 9. Type Safety

Always typed:

* API requests/responses — defined in `<domain>.dto.ts`.
* Component props — explicit `interface` or `type`.
* Hook return values — `AuthContextType` is the canonical example.

Role narrowing uses [`checkRole`](src/types/role.ts):

```ts
export type RoleEnum = "student" | "professor" | "admin";

export function checkRole(role: string | null): RoleEnum {
    if (role === "student" || role === "professor" || role === "admin") return role;
    throw new Error("Invalid user role");
}
```

### Zod

Use Zod for any user-input validation or untrusted parsing boundary. Currently a dependency but not yet exercised.

---

## 10. Environment Configuration

`.env.local` at the repo root:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

[config/settings.ts](src/config/settings.ts) reads `NEXT_PUBLIC_API_URL` so the value is inlined into the client bundle by Next.js. Use `NEXT_PUBLIC_*` for anything the browser needs; keep secrets in non-prefixed vars used only on the server.

Never hardcode URLs — always go through `@/config/settings`.

---

## 11. Error Handling

### Services

Throw `Error` with a prefixed message:

```ts
if (!response.ok) throw new Error(`${errorPrefix}: ${data.message ?? "Unknown error"}`);
```

### Containers

Convert thrown errors into `error: string | null` state and pass to the view:

```ts
catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
}
```

### Views

Render the error inline (red banner pattern used in `LoginView`, `RegisterView`, `ProfileView`).

### Routing errors

Use `app/error.tsx` (Next.js convention) when adding boundary-level handling.

---

## 12. Authentication Flow

1. `RootLayout` wraps the tree in `<AuthProvider>` ([app/layout.tsx](src/app/layout.tsx)).
2. On mount, `AuthProvider` hydrates `accessToken` / `refreshToken` / `role` from `localStorage` and sets `loading: false`.
3. `ProtectedLayout` waits for `loading === false`, then redirects to `/login` if unauthenticated.
4. `LoginContainer` calls `authService.login()`, persists tokens via `useAuth().login()`, then routes to `/{role}/dashboard`.
5. `Sidebar`'s logout button calls `useAuth().logout()` and pushes to `/login`.

⚠️ Tokens currently live in `localStorage`. For production, prefer HttpOnly cookies set by the backend to mitigate XSS-based token theft.

---

## 13. Performance

* `next/image` for raster images.
* `dynamic()` for heavy client-only components.
* `React.memo` only when render profiling shows it helps.
* Keep `"use client"` boundaries tight — pages, layouts, and views that don't need it should remain server components.

---

## 14. Testing

| Type    | Tool                                    | Status        |
| ------- | --------------------------------------- | ------------- |
| Unit    | Vitest                                  | ✅ In use      |
| UI      | React Testing Library + jsdom           | ✅ In use      |
| E2E     | Playwright                              | Not yet added |

### Layout

All tests live under **`src/tests/`** and mirror the source tree they cover. Files use the `*.test.ts` / `*.test.tsx` suffix. The Vitest config scans `src/tests/**/*.test.{ts,tsx}` — application code stays free of test files.

```
src/tests/
├── setup.ts                                       ← jest-dom matchers + auto-cleanup
├── services/                                      ← mirrors src/services/
│   ├── auth/auth.service.test.ts
│   ├── projects/projects.service.test.ts
│   ├── professor/professor.service.test.ts
│   └── student/student.service.test.ts
└── features/                                      ← mirrors src/features/
    ├── auth/components/
    │   ├── LoginContainer.test.tsx
    │   └── RegisterContainers.test.tsx            ← admin + student + professor
    ├── dashboard/components/
    │   └── DashboardContainer.test.tsx
    ├── profile/components/
    │   └── ProfileContainer.test.tsx
    └── projects/components/
        ├── InvitationsPanel.test.tsx
        ├── MyInvitationsContainer.test.tsx
        └── ProjectDetailContainer.invitations.test.tsx
```

Always import the code under test via the `@/*` alias (e.g. `@/services/professor/professor.service`), never with relative paths back out of `src/tests/`.

### Running

```bash
pnpm test         # one-shot, exits non-zero on failure (CI)
pnpm test:watch   # interactive watch mode during development
```

### Coverage today

| Area                                       | Tested                                               |
| ------------------------------------------ | ---------------------------------------------------- |
| `auth.service`                             | login, register (admin/student/professor) + errors   |
| `projects.service`                         | listProjects, getProject + errors                    |
| `professor.service`                        | getProfile, createProject, listProjectApplications, reviewApplication, listProjectInvitations, sendInvitation, cancelInvitation, listStudents + errors |
| `student.service`                          | getProfile, applyToProject, withdrawApplication, listMyApplications, checkApplicationStatus, listMyInvitations, respondInvitation + errors |
| `LoginContainer`                           | service wiring, role-based routing, error surfacing  |
| `Register*Container` (admin/stu/prof)      | form submission, redirect, error surfacing           |
| `ProfileContainer`                         | role dispatch, unsupported-role, loading/error/no-token |
| `DashboardContainer`                       | per-role data fetching, empty/error/loading branches |
| `MyInvitationsContainer`                   | accept/decline flow + state branches                 |
| `ProjectDetailContainer` (invitation slice)| load students+invitations, send/cancel handlers      |
| `InvitationsPanel`                         | select disabling, submit/clear/error, cancel button  |

### Service-layer test pattern

Service modules are pure `fetch` wrappers, so unit tests stub `globalThis.fetch` with `vi.stubGlobal` and assert on the request URL, method, headers, and body — plus the resolved/rejected value. These suites don't need a DOM, so each service test file opts out of jsdom with a `// @vitest-environment node` pragma on line 1 (cheaper, faster). See [src/tests/services/professor/professor.service.test.ts](src/tests/services/professor/professor.service.test.ts) for the canonical shape:

```ts
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL } from "@/config/settings";
import { professorService } from "@/services/professor/professor.service";

describe("professorService.sendInvitation", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("POSTs the body and returns the created invitation", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: async () => ({ id: "inv-9" /* ... */ }),
        } as Response);

        await professorService.sendInvitation("proj-1", { student_id: "s-9", message: "" }, "tok");

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${API_URL}/api/professor/projects/proj-1/invitations`);
        expect(init.method).toBe("POST");
        expect(init.headers).toMatchObject({ Authorization: "Bearer tok" });
    });
});
```

Cover both happy path and the error branch — services throw `${errorPrefix}: ${message ?? "Unknown error"}`, so assert the thrown message includes the prefix. For DELETEs with no body, mock a response whose `json()` rejects so the service's `.catch(() => ({}))` path is exercised.

### Component / container test pattern

UI tests use React Testing Library against a jsdom DOM. Three flavors:

**Pure view components** (props-driven, no hooks) — render with explicit props, assert on the rendered DOM, drive interactions with `@testing-library/user-event`. No mocking needed. See [InvitationsPanel.test.tsx](src/tests/features/projects/components/InvitationsPanel.test.tsx).

**Containers** (hooks + service calls) — `vi.mock()` both `@/hooks/useAuth` and the relevant `@/services/*` modules *before* importing the container. Set `useAuthMock.mockReturnValue({...})` per test to simulate signed-in / loading / signed-out states. Mock the service methods to control the data and assert the container called them with the right arguments. See [MyInvitationsContainer.test.tsx](src/tests/features/projects/components/MyInvitationsContainer.test.tsx), [ProfileContainer.test.tsx](src/tests/features/profile/components/ProfileContainer.test.tsx), and [DashboardContainer.test.tsx](src/tests/features/dashboard/components/DashboardContainer.test.tsx).

**Auth / form containers** (router + service) — additionally mock `next/navigation` so you can assert `router.push(...)` was called with the right redirect. See [LoginContainer.test.tsx](src/tests/features/auth/components/LoginContainer.test.tsx) and [RegisterContainers.test.tsx](src/tests/features/auth/components/RegisterContainers.test.tsx).

```tsx
const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: routerPush }),
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("@/services/student/student.service", () => ({
    studentService: { listMyInvitations: vi.fn(), respondInvitation: vi.fn() },
}));

import { useAuth } from "@/hooks/useAuth";
import { studentService } from "@/services/student/student.service";
import MyInvitationsContainer from "@/features/projects/components/MyInvitationsContainer";

const useAuthMock = vi.mocked(useAuth);
const listMock = vi.mocked(studentService.listMyInvitations);

it("renders fetched invitations", async () => {
    useAuthMock.mockReturnValue({ accessToken: "tok", loading: false, /* ... */ } as ReturnType<typeof useAuth>);
    listMock.mockResolvedValue({ invitations: [/* ... */] });
    render(<MyInvitationsContainer />);
    expect(await screen.findByText("Quantum")).toBeInTheDocument();
});
```

Rules of thumb:
- **Mock every service the container can call**, including the ones used by sibling roles, with sensible default resolutions in `beforeEach`. An unmocked call returns `undefined` and the container chains `.then()` on it, blowing up React's effect. Containers like `ProjectDetailContainer` fan out across `projectsService`, `professorService`, and `studentService` — all three need stubs even when the test only cares about one role.
- Prefer role-based queries (`getByRole("button", { name: /accept/i })`) over text or test-ids. They double as accessibility checks. When multiple labels start with the same word (e.g. "Full name" + "Email address" + "Password"), anchor your regex (`/full name/i`, `/^password$/i`) instead of using `/^name/i`.
- Use `await screen.findByText(...)` to wait for async effects; reach for `waitFor` only when asserting on negative changes (e.g. a button being removed or a service NOT being called).
- For mock function callback props passed directly to components, type the mock against the prop signature (`const onInvite: (id: string, msg: string) => Promise<void> = vi.fn(async () => undefined)`). Plain `vi.fn()` is typed as `Mock<Procedure>` and `tsc` won't accept it as a strict prop callback.

### Configuration

[vitest.config.ts](vitest.config.ts) mirrors the `@/*` path alias from `tsconfig.json` so test files can use the same imports as application code. Environment is `jsdom` (needed for React Testing Library); switch to `node` for a single file with `// @vitest-environment node` at the top when pure-fetch tests don't need a DOM.

[src/tests/setup.ts](src/tests/setup.ts) registers `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toBeDisabled`, …) and calls `cleanup()` after every test so renders don't leak between cases.

### What's missing / next up

Already covered: every service, every feature container, plus the one panel with non-trivial form logic. When adding a new feature, write tests in this order:

1. **Service** (with the `// @vitest-environment node` pragma) — happy path + non-OK + 'Unknown error' fallback.
2. **Container** — at minimum: data-fetch wiring, error surfacing, the loading / no-token / auth-loading branches.
3. **View** — only when the view has non-trivial state of its own (forms with derived disabled state, lists with conditional CTAs, etc.). Otherwise the container test exercises it transitively.

Still unwritten:
- Container tests for `ProjectListContainer`, `ProjectCreateContainer`, `MyApplicationsContainer` and the non-invitation slice of `ProjectDetailContainer` (apply, review applications, withdraw).
- E2E coverage of the login → dashboard → invite → accept happy path (Playwright is the planned tool — not yet installed).

---

## 15. Security Practices

* Validate at every server/client boundary.
* Sanitize user input before rendering as HTML.
* No secrets in `NEXT_PUBLIC_*` variables.
* Plan migration of auth tokens off `localStorage` (see §12).

---

## 16. Naming Conventions

| Item        | Convention   | Example                      |
| ----------- | ------------ | ---------------------------- |
| Components  | PascalCase   | `LoginView.tsx`              |
| Hooks       | camelCase    | `useAuth.tsx`                |
| Routes      | kebab-case   | `app/register/student/`      |
| Services    | dot-case     | `auth.service.ts`, `auth.dto.ts` |
| Variables   | camelCase    | `accessToken`                |
| Types       | PascalCase   | `LoginRequest`, `RoleEnum`   |

---

## 17. Git Rules

Branches: `main`, `develop`, `feature/*`, `fix/*`.

Commit format (from recent history):

```
feat: add profile page
fix: sidebars children node cant use whole screen width
refactor: split dashboard logic
```

---

## 18. Production Checklist

* [ ] No `console.log` in committed code
* [ ] No unused imports / dead code
* [ ] All required env vars set
* [ ] `pnpm lint` clean
* [ ] `pnpm build` succeeds
* [ ] Type-check clean (`tsc --noEmit` if added)

---

## 19. Architecture Principles

* KISS, DRY, SOLID (where applicable)
* Separation of Concerns: Page → Container → View → UI
* Feature isolation: no cross-feature imports
* Type safety first
* One backend call path: components → service module → backend

---

## 20. Adding a New Feature

Use the existing `profile` feature as the template:

```
features/<feature>/
├── components/
│   ├── <Feature>Container.tsx    # client, owns data/state
│   ├── <Feature>View.tsx         # presentation, props-driven
│   ├── <Feature>Field.tsx        # (optional) feature-local atoms
│   └── index.ts                  # barrel
├── types.ts                      # feature-local types / guards
└── index.ts                      # barrel (re-export from components)
```

If the feature needs a new backend resource, also add:

```
services/<domain>/
├── <domain>.dto.ts               # request/response types
└── <domain>.service.ts           # fetch wrapper + named exports + service object
```

Then wire a route under `src/app/<role>/<feature>/page.tsx` that renders the container.

---

## 21. Final Rule

> Simplicity > Abstraction > Cleverness

---

# ✅ Summary

This frontend pairs a Next.js App Router with a feature-sliced architecture:

* **Pages** stay thin; **containers** own state; **views** stay presentational.
* **Services** are the only path to the backend, scoped per domain with paired `.dto.ts` / `.service.ts` files.
* **Auth** is centralized in a single context provider and gated via `ProtectedLayout` on role-scoped routes.
* **Roles** (`student`, `professor`, `admin`) drive both routing and which service is called.
