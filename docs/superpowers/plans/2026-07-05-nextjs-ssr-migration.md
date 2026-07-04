# Next.js SSR Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Vite/React CSR app onto Next.js (App Router) so the HTML document shell is server-rendered while the Telegram Mini App SPA stays a client component.

**Architecture:** Next.js App Router replaces Vite as the build/serve/shell layer. `app/layout.tsx` (server component) renders the `<html>`/`<body>` shell + metadata. The entire existing SPA — `App.tsx` with `createMemoryRouter`, antd-mobile, Supabase auth, and the TMA SDK — is mounted through a single client entry loaded with `next/dynamic({ ssr: false })`. No route-by-route rewrite: `MemoryRouter` stays as the in-app router.

**Tech Stack:** Next.js 15 (App Router), React 19 + React Compiler (Babel), Tailwind CSS v4 (via `@tailwindcss/postcss`), TypeScript, Supabase JS, `@tma.js/sdk-react`, TanStack Query, Zustand, antd-mobile v5.

## Honest SSR scope (read before starting)

This app gets **no meaningful SSR data benefit**. Reasons, all verified in the current code:

- **Auth is browser-only.** `checkAuth()` / `tmaLogin()` in `src/pages/login/store/auth.store.ts` run `supabase.auth.getUser()` against a client Supabase instance and exchange Telegram `initData` that only exists inside the WebView (`src/lib/tma.ts` reads `window.Telegram.WebApp.initData`). The server has no session on first request, so it cannot render authenticated content.
- **Router is `createMemoryRouter`** (`src/App.tsx:86`), chosen because Telegram Mini Apps have no browser history. Next's URL router must not drive navigation, so we keep `MemoryRouter` inside a client boundary.
- **Browser-only SDKs at module load:** `unstableSetRender` (antd-mobile), `retrieveLaunchParams()` / `init()` (TMA), `mockEnv.ts` (mocks `window.Telegram`). These touch `window`/`document` and cannot run on the server.

Therefore SSR here = a server-rendered **document shell + `<head>`/metadata only**; the SPA is client-rendered (`ssr: false`). This is the minimal architecture that satisfies "migrate to Next.js SSR" without pretending TMA can hydrate on the server. A per-route App Router rewrite (one `app/*/page.tsx` per screen with server data fetching) is deliberately **out of scope** — it would require server-side Supabase sessions this app does not have and buys nothing. Note this trade-off to the user; do not build it speculatively.

---

## Global Constraints

- **Preserve all uncommitted changes.** The working tree has staged/unstaged edits and untracked files (`scripts/regression-checks.mjs`, `supabase/database/20260705000000_harden_user_data.sql`). Never `git checkout`/`git stash`/`git reset` them. Every commit in this plan stages only the files that task touches — never `git add -A`.
- **Node/React:** React 19 (`react@^19.2`, `react-dom@^19.2`) stays. Use `next@^15` (latest 15.x) — it supports React 19 + React Compiler.
- **No new dependencies beyond the Next.js migration.** Allowed additions: `next`, `@tailwindcss/postcss`. Allowed removals: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`. Keep `babel-plugin-react-compiler` (Next uses it), `react-router` (MemoryRouter still used).
- **Import alias `@/*` → `./src/*`** must keep working (Next reads it from `tsconfig.json` `paths`).
- **TypeScript style rules stay:** `strict`, `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly` (no `enum`), 2-space indent.
- **No test framework.** Verification = `npm run lint`, `npm run build`, `npm run check:regressions`, and a dev-server smoke check. `scripts/regression-checks.mjs` reads source files as text and stays valid after the migration — keep `npm run check:regressions` green throughout.
- **Env var rename:** every `import.meta.env.VITE_*` becomes `process.env.NEXT_PUBLIC_*`; every `import.meta.env.DEV` becomes `process.env.NODE_ENV !== 'production'`.

---

## File Structure

**Create:**
- `next.config.ts` — Next config, enable React Compiler.
- `postcss.config.mjs` — Tailwind v4 PostCSS plugin.
- `app/layout.tsx` — server root layout: `<html>`/`<body>`, metadata, global CSS import.
- `app/page.tsx` — server route that renders the client loader.
- `app/app-client.tsx` — `"use client"` loader: `dynamic(() => import('./app-bootstrap'), { ssr: false })`.
- `app/app-bootstrap.tsx` — `"use client"` bootstrap: antd-mobile `unstableSetRender`, TMA `init()`, renders existing `<App />`. Replaces `src/main.tsx`.

**Modify:**
- `package.json` — scripts + deps.
- `tsconfig.json` — replace solution-style config with a single Next tsconfig.
- `.gitignore` — add `.next/`, `next-env.d.ts`.
- `src/lib/supabaseClient.ts` — env vars.
- `src/lib/tma.ts` — env vars.
- `src/lib/image-upload.ts` — env var.
- `src/mockEnv.ts` — `import.meta.env.DEV` → `process.env.NODE_ENV`.

**Delete:**
- `src/main.tsx` (logic moved to `app/app-bootstrap.tsx`).
- `index.html` (Next owns the document).
- `vite.config.ts`.
- `tsconfig.app.json`, `tsconfig.node.json` (folded into single `tsconfig.json`).

**Untouched (keep as-is):** all of `src/App.tsx`, `src/pages/**`, `src/components/**`, `src/store/**`, `src/init.ts`, `src/index.css`, `src/pages/login/store/auth.store.ts`, `scripts/regression-checks.mjs`, `eslint.config.js`, `public/`.

---

## Task 1: Add Next.js toolchain and config

Installs Next, removes the Vite build layer, and lands all config files. After this task the repo builds with Next once the `app/` shell exists (Task 3); here we only verify configs type-check and deps resolve.

**Files:**
- Modify: `package.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Modify: `tsconfig.json`
- Delete: `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `npm run dev` → `next dev`, `npm run build` → `next build`, `npm run start` → `next start`. React Compiler enabled via `experimental.reactCompiler`. Tailwind v4 compiled via PostCSS. `@/*` alias resolves to `src/*`.

- [ ] **Step 1: Install/remove dependencies**

```bash
npm install next@^15 @tailwindcss/postcss
npm uninstall vite @vitejs/plugin-react @tailwindcss/vite
```

Expected: `package.json` gains `next` (dependencies) and `@tailwindcss/postcss` (devDependencies); `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite` removed. `babel-plugin-react-compiler`, `react`, `react-dom`, `react-router` remain.

- [ ] **Step 2: Update `package.json` scripts**

Replace the `scripts` block with (keep `check:regressions` and `openclaw:ingest-recipe` verbatim):

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "check:regressions": "node scripts/regression-checks.mjs",
    "openclaw:ingest-recipe": "node scripts/openclaw-recipe-ingest.mjs"
  },
```

- [ ] **Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler runs through babel-plugin-react-compiler (already a dependency).
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `postcss.config.mjs`**

Tailwind v4 uses a PostCSS plugin under Next (the `@tailwindcss/vite` plugin no longer applies). `src/index.css` keeps its `@import "tailwindcss";` line unchanged.

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 5: Replace `tsconfig.json`**

Next requires a single tsconfig with `jsx: "preserve"` and its plugin. Overwrite `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "incremental": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["node"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Delete the Vite-era config files**

```bash
git rm vite.config.ts tsconfig.app.json tsconfig.node.json
```

Expected: files removed. (`git rm` stages the deletions; safe — these are committed files unrelated to the uncommitted working changes.)

- [ ] **Step 7: Update `.gitignore`**

Append these lines (do not remove existing entries such as `dist`):

```
# next.js
.next/
next-env.d.ts
```

- [ ] **Step 8: Verify configs resolve and type-check**

```bash
npx next telemetry disable
npx tsc --noEmit -p tsconfig.json
```

Expected: `tsc` prints nothing and exits 0. Errors about missing `app/` are fine to ignore here (no source references it yet); a clean exit is expected because `next-env.d.ts` is generated on first `next` invocation. If `tsc` complains that `next-env.d.ts` is missing, run `npx next build` once to generate it (it will fail later for lack of `app/`, that is expected) or create an empty placeholder — it is regenerated automatically.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json next.config.ts postcss.config.mjs tsconfig.json .gitignore
git commit -m "build: add Next.js toolchain, remove Vite config"
```

---

## Task 2: Migrate env var references to Next.js conventions

Vite exposes env through `import.meta.env.VITE_*`; Next exposes browser env through `process.env.NEXT_PUBLIC_*`. All three source files below run in the browser SPA, so `NEXT_PUBLIC_` (inlined client-side) is correct.

**Files:**
- Modify: `src/lib/supabaseClient.ts:5-6`
- Modify: `src/lib/tma.ts:62-67`
- Modify: `src/lib/image-upload.ts:157`
- Modify: `src/mockEnv.ts:3`
- Modify: `.env.sample`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: env keys `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TMA_EXCHANGE_URL` used app-wide.

- [ ] **Step 1: Update `src/lib/supabaseClient.ts`**

Replace lines 5-6:

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

And the error message on line ~10-12 (keep it accurate):

```ts
    throw new Error(
      'Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
```

- [ ] **Step 2: Update `src/lib/tma.ts`**

Replace the `exchangeTma` env reads (lines 61-68) with:

```ts
  const base =
    process.env.NEXT_PUBLIC_TMA_EXCHANGE_URL ||
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tma-exchange`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    headers.Authorization = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;
  }
```

- [ ] **Step 3: Update `src/lib/image-upload.ts`**

Replace line 157:

```ts
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

- [ ] **Step 4: Update `src/mockEnv.ts`**

Replace line 3 (`if (import.meta.env.DEV) {`) with:

```ts
if (process.env.NODE_ENV !== 'production') {
```

- [ ] **Step 5: Update `.env.sample`**

Rewrite to the new key names:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Telegram Mini App Exchange URL (optional - defaults to Supabase Edge Function)
# NEXT_PUBLIC_TMA_EXCHANGE_URL=https://your-project.supabase.co/functions/v1/tma-exchange
```

- [ ] **Step 6: Update local `.env` if one exists**

If a `.env` / `.env.local` file exists locally (untracked), copy each `VITE_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL` etc. so `npm run dev` in Task 4 has credentials. Do not commit `.env`. If none exists, `cp .env.sample .env.local` and fill in real values.

- [ ] **Step 7: Verify no stale references remain**

```bash
grep -rn "import.meta" src && echo "FOUND (fix these)" || echo "clean"
grep -rn "VITE_" src .env.sample && echo "FOUND (fix these)" || echo "clean"
```

Expected: both print `clean`.

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabaseClient.ts src/lib/tma.ts src/lib/image-upload.ts src/mockEnv.ts .env.sample
git commit -m "refactor: use NEXT_PUBLIC_ env vars instead of Vite import.meta.env"
```

---

## Task 3: Build the App Router shell and client bootstrap

Creates the server shell and moves the `src/main.tsx` bootstrap into a client component loaded with `ssr: false`. After this task the app builds and runs under Next.

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/app-client.tsx`
- Create: `app/app-bootstrap.tsx`
- Delete: `src/main.tsx`, `index.html`

**Interfaces:**
- Consumes: `@/App` (default export `App`), `@/init` (`init({ debug })`), `@/mockEnv` (side-effect import), `@/index.css`.
- Produces: a single mounted SPA at route `/`.

- [ ] **Step 1: Create `app/layout.tsx` (server component)**

Server-rendered document shell. Imports the existing global CSS (Tailwind entry) so it is emitted in `<head>`. Metadata + viewport replace the old `index.html` `<head>`.

```tsx
import type { Metadata, Viewport } from "next";
import "@/index.css";

export const metadata: Metadata = {
  title: "start-new",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Create `app/app-client.tsx` (client loader)**

`ssr: false` requires a client component (Next forbids it in server components). This thin loader is the client boundary; the actual bootstrap is code-split so no browser-only module is evaluated on the server.

```tsx
"use client";

import dynamic from "next/dynamic";

// The whole SPA is browser-only: TMA initData, the Supabase session, antd-mobile's
// custom renderer, and MemoryRouter all require `window`. There is no server session
// to render against, so SSR is disabled for the app entry by design.
const AppBootstrap = dynamic(() => import("./app-bootstrap"), { ssr: false });

export default function AppClient() {
  return <AppBootstrap />;
}
```

- [ ] **Step 3: Create `app/app-bootstrap.tsx` (client bootstrap)**

This replaces `src/main.tsx`. Next mounts the React root, so `createRoot`/`StrictMode` on the document are dropped; the antd-mobile `unstableSetRender` shim (which itself calls `createRoot` for antd-mobile portals) and the TMA `init()` are preserved. `mockEnv` is imported for its dev side effect **before** `retrieveLaunchParams()` runs, matching the original ordering in `src/main.tsx`.

```tsx
"use client";

import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { unstableSetRender } from "antd-mobile";
import { retrieveLaunchParams } from "@tma.js/sdk-react";
import App from "@/App";
import { init } from "@/init";
// Dev-only mock of the Telegram WebView environment (side-effect import).
import "@/mockEnv";

// React 19 compatibility for antd-mobile v5.
// See: https://mobile.ant.design/guide/v5-for-19/
unstableSetRender((node, container) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (container as any)._reactRoot ||= createRoot(container);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root = (container as any)._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

export default function AppBootstrap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const launchParams = retrieveLaunchParams();
        const debug =
          (launchParams.tgWebAppStartParam || "").includes("debug") ||
          process.env.NODE_ENV !== "production";
        await init({ debug });
      } catch (e) {
        // Fallback: render the app without TMA initialization (e.g. plain browser).
        console.error("Failed to initialize TMA:", e);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <App />;
}
```

- [ ] **Step 4: Create `app/page.tsx` (server route)**

```tsx
import AppClient from "./app-client";

export default function Page() {
  return <AppClient />;
}
```

- [ ] **Step 5: Delete the Vite entry files**

```bash
git rm src/main.tsx index.html
```

`src/App.tsx` is untouched — it still default-exports `App` and uses `createMemoryRouter`.

- [ ] **Step 6: Build**

```bash
npm run build
```

Expected: `next build` completes. `/` is emitted (dynamic, client-rendered). Warnings about the route being dynamic are fine. If the build fails on a browser-only module being evaluated during prerender, confirm Step 2's `dynamic(..., { ssr: false })` is intact and that no server component imports `app-bootstrap` directly.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/page.tsx app/app-client.tsx app/app-bootstrap.tsx
git commit -m "feat: mount SPA under Next.js App Router shell"
```

---

## Task 4: Verification, regression checks, and smoke test

Runs the full repo gate and a live smoke check, then confirms the migration end-to-end.

**Files:** none (verification only).

- [ ] **Step 1: Lint**

```bash
npm run lint
```

Expected: exits 0. The `eslint-plugin-react-refresh` rule in `eslint.config.js` is now a no-op (it targeted Vite HMR) but is harmless — leave it unless it errors. If it errors on `app/*` files, add `app/**` is already covered by the flat config's default globs; adjust only if lint actually fails.

- [ ] **Step 2: Regression checks (must stay green)**

```bash
npm run check:regressions
```

Expected: prints `regression checks passed`. This script reads source files as text (recipe/shopping mutation invariants + the hardening SQL migration) and is unaffected by the framework swap.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: completes with a route table listing `/`. No type errors (Next type-checks during build).

- [ ] **Step 4: Dev-server smoke — shell responds**

```bash
npm run dev &
sleep 6
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -sS http://localhost:3000/ | grep -q '<div id="__next"\|<body' && echo "shell OK" || echo "shell MISSING"
kill %1
```

Expected: `200` then `shell OK`. The server HTML is the empty document shell (the SPA is `ssr: false`), so it will **not** contain rendered app content — that is correct and expected for this migration.

- [ ] **Step 5: Manual in-app smoke (browser — cannot be scripted)**

Because auth/TMA/antd-mobile are client-only, real rendering must be checked in a browser with `.env.local` populated:

1. `npm run dev`, open `http://localhost:3000/`.
2. In dev (non-Telegram) the `mockEnv` mock activates; confirm the app mounts and redirects to `/login` (no session) — `AuthGuard` shows "Đang kiểm tra đăng nhập..." then the login screen.
3. Log in with email/password (Supabase) and confirm the inventory dashboard, bottom navigation, and one mutation (e.g. add a food item) work with optimistic update intact.
4. Confirm no hydration errors in the console (there should be none — the app never SSRs).

Document the result of this manual pass in the PR description.

- [ ] **Step 6: Final commit (if any lint/config fixups were needed)**

```bash
git add -- <only files you changed in this task>
git commit -m "chore: finalize Next.js migration verification"
```

If Steps 1-4 passed with no edits, skip this commit.

---

## Risks and mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| A browser-only module (`mockEnv`, TMA SDK, antd-mobile) is evaluated during prerender and crashes the build | Medium | The entire SPA is behind `dynamic(..., { ssr: false })` (Task 3, Step 2). Never import `app-bootstrap` from a server component. |
| `mockEnv.ts` top-level `await` fails to bundle under Next/Turbopack | Low | Next + webpack support top-level await in ESM. If Turbopack (`next dev`) complains, run `next dev --no-turbo` or move the mock init inside the `useEffect` in `app-bootstrap.tsx` before `init()`. |
| React Compiler (Babel) conflicts with Next's SWC pipeline | Low | `experimental.reactCompiler: true` is the supported Next path; `babel-plugin-react-compiler` is already installed. If build slows unacceptably, it is opt-in and can be removed without code changes. |
| Tailwind v4 content detection misses classes (styles missing) | Low | `@tailwindcss/postcss` auto-detects sources across the repo; `src/index.css` keeps `@import "tailwindcss";`. Verify styling in Step 5 manual smoke. |
| Uncommitted working-tree changes get clobbered | Medium | Every commit stages an explicit file list; never `git add -A`, never `git checkout`/`reset`/`stash`. Deletions use `git rm` on committed files only. |
| `tsconfig.json` project-reference removal breaks editor/other tooling | Low | Single-tsconfig is the Next standard; `scripts/*.mjs` are plain Node and unaffected. |
| `next-env.d.ts` accidentally committed | Low | Added to `.gitignore` in Task 1, Step 7. |
| Env not renamed in `.env.local`, app can't reach Supabase | Medium | Task 2, Step 6 renames local env; Step 5 manual smoke catches a bad config immediately. |

## Out of scope (do not build)

- Per-route App Router pages with server-side Supabase data fetching (`@supabase/ssr`, cookie-based sessions). Requires a server session this app does not have; adds a dependency for zero benefit.
- Replacing `MemoryRouter` with Next's file-system router. Telegram Mini Apps have no browser history; URL routing would break navigation.
- Middleware, edge runtime, ISR/streaming of app content — nothing here is server-renderable per-user.
